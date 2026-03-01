import {
  Controller,
  Get,
  Param,
  Post as HttpPost,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/follow')
  async followUser(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.followUser(user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/unfollow')
  async unfollowUser(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.unfollowUser(user.userId, id);
  }

  @Get(':id/followers')
  async getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @Get(':id/following')
  async getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }
}

