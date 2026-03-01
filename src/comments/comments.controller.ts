import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post as HttpPost,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpPost(':postId')
  async addComment(
    @Param('postId') postId: string,
    @CurrentUser() user: { userId: string },
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.addComment(
      postId,
      user.userId,
      createCommentDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteComment(
    @Param('id') id: string,
    @CurrentUser() user: { userId: string },
  ) {
    return this.commentsService.deleteComment(id, user.userId);
  }

  @Get('/post/:postId')
  async getCommentsByPost(@Param('postId') postId: string) {
    return this.commentsService.getCommentsByPost(postId);
  }
}

