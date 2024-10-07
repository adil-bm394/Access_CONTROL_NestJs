import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  UseGuards,
  Request,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateGroupDto } from './dto/create-group.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';


@Controller({ path: 'chat', version: '1' })
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('group')
  createGroup(@Body() createGroupDto: CreateGroupDto, @Req() req) {
    return this.chatService.createGroup(createGroupDto);
  }

  @Get('group/:groupId/messages')
  getGroupMessages(@Param('groupId') groupId: number) {
    return this.chatService.getMessagesForGroup(groupId);
  }
}
