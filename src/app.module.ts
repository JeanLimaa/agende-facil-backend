import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ServiceModule } from './modules/service/service.module';
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [
    AuthModule,
    UserModule, 
    StripeModule, 
    ServiceModule, 
    CompanyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
