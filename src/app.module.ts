import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseService } from './services/Database.service';
import { StripeModule } from './modules/stripe/stripe.module';
import { ServiceService } from './modules/service/service.service';
import { ServiceModule } from './modules/service/service.module';

@Module({
  imports: [AuthModule, UserModule, StripeModule, ServiceModule],
  controllers: [AppController],
  providers: [AppService, ServiceService],
})
export class AppModule {}
