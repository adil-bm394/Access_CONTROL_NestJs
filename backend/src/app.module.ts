import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
//import { AdminModule } from './admin/admin.module';
import { MailModule } from './mail/mail.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [AuthModule, DatabaseModule, UsersModule, MailModule, ChatModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
