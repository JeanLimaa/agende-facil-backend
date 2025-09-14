import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { UserService } from '../user/user.service';
import { DatabaseService } from 'src/services/Database.service';
import { CompanyService } from '../company/company.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { EmployeeService } from '../employee/employee.service';
import { UserModule } from '../user/user.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { EmployeeModule } from '../employee/employee.module';
import { CompanyModule } from '../company/company.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey', // Chave secreta
      signOptions: { expiresIn: '1h' }, // Expiração do token
    }),
    UserModule,
    CompanyModule,
    SubscriptionModule,
    EmployeeModule,
    CategoryModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    UserService, 
    DatabaseService
  ],
  exports: [AuthService],
})
export class AuthModule {}
