import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private readonly postModel: Model<Post>,
  ) {}

  async create(
    authorId: string,
    createPostDto: CreatePostDto,
    imagePath?: string,
  ): Promise<Post> {
    if (!Types.ObjectId.isValid(authorId)) {
      throw new BadRequestException('Invalid author id');
    }

    const created = new this.postModel({
      content: createPostDto.content,
      author: new Types.ObjectId(authorId),
      image: imagePath ?? undefined,
    });

    return created.save();
  }

  async findAll(): Promise<Post[]> {
    return this.postModel
      .find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email')
      .populate('likes', 'name email')
      .exec();
  }

  async findOne(id: string): Promise<Post> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid post id');
    }

    const post = await this.postModel
      .findById(id)
      .populate('author', 'name email')
      .populate('likes', 'name email')
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(
    id: string,
    authorId: string,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const post = await this.findOne(id);

    if (post.author.toString() !== authorId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    if (updatePostDto.content !== undefined) {
      post.content = updatePostDto.content;
    }

    return post.save();
  }

  async remove(id: string, authorId: string): Promise<{ message: string }> {
    const post = await this.findOne(id);

    if (post.author.toString() !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.postModel.deleteOne({ _id: post._id }).exec();
    return { message: 'Post deleted successfully' };
  }

  async likePost(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const post = await this.findOne(id);

    const alreadyLiked = post.likes.some(
      (likeId) => likeId.toString() === userId,
    );
    if (alreadyLiked) {
      throw new BadRequestException('Post already liked');
    }

    post.likes.push(new Types.ObjectId(userId));
    await post.save();
    return { message: 'Post liked successfully' };
  }

  async unlikePost(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const post = await this.findOne(id);

    post.likes = post.likes.filter(
      (likeId) => likeId.toString() !== userId,
    );

    await post.save();
    return { message: 'Post unliked successfully' };
  }
}

