import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [MailingService],
  exports: [MailingService]
})
export class MailingModule {}
