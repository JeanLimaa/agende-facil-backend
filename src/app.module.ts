import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { ServiceModule } from './modules/service/service.module';
import { CompanyModule } from './modules/company/company.module';
import { CategoryModule } from './modules/category/category.module';
import { EmployeeServicesModule } from './modules/employee-services/employee-services.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { AppointmentModule } from './modules/appointments/appointment.module';
import { ClientsModule } from './modules/clients/clients.module';

@Module({
  imports: [
    AuthModule,
    UserModule, 
    StripeModule, 
    ServiceModule, 
    CompanyModule,
    CategoryModule,
    EmployeeServicesModule,
    EmployeeModule,
    AppointmentModule,
    ClientsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
