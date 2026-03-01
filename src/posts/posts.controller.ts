import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post as HttpPost,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { multerConfig } from '../common/multer.config';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost()
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async create(
    @CurrentUser() user: { userId: string },
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagePath = file ? `uploads/${file.filename}` : undefined;
    return this.postsService.create(user.userId, createPostDto, imagePath);
  }

  @Get()
  async findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, user.userId, updatePostDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.postsService.remove(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/like')
  async likePost(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.postsService.likePost(id, user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/unlike')
  async unlikePost(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.postsService.unlikePost(id, user.userId);
  }
}

