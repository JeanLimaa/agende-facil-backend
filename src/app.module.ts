import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseService } from './services/Database.service';
import { StripeModule } from './modules/stripe/stripe.module';

@Module({
  imports: [AuthModule, UserModule, StripeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
