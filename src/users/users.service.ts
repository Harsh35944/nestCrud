import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async findAll(): Promise<Omit<User, 'password'>[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<Omit<User, 'password'>> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.userModel
      .findById(id)
      .select('-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async followUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException('Invalid target user id');
    }

    const [currentUser, targetUser] = await Promise.all([
      this.userModel.findById(currentUserId).exec(),
      this.userModel.findById(targetUserId).exec(),
    ]);

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (!targetUser) {
      throw new NotFoundException('User to follow not found');
    }

    const isAlreadyFollowing = currentUser.following.some(
      (id) => id.toString() === targetUserId,
    );

    if (isAlreadyFollowing) {
      throw new BadRequestException('Already following this user');
    }

    currentUser.following.push(new Types.ObjectId(targetUserId));
    targetUser.followers.push(new Types.ObjectId(currentUserId));

    await Promise.all([currentUser.save(), targetUser.save()]);

    return { message: 'User followed successfully' };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    if (!Types.ObjectId.isValid(targetUserId)) {
      throw new BadRequestException('Invalid target user id');
    }

    const [currentUser, targetUser] = await Promise.all([
      this.userModel.findById(currentUserId).exec(),
      this.userModel.findById(targetUserId).exec(),
    ]);

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (!targetUser) {
      throw new NotFoundException('User to unfollow not found');
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId,
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId,
    );

    await Promise.all([currentUser.save(), targetUser.save()]);

    return { message: 'User unfollowed successfully' };
  }

  async getFollowers(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.userModel
      .findById(userId)
      .populate('followers', '-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.followers;
  }

  async getFollowing(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user id');
    }

    const user = await this.userModel
      .findById(userId)
      .populate('following', '-password')
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.following;
  }
}

