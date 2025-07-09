import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { EmployeeModule } from '../employee/employee.module';
import { AuthModule } from '../auth/auth.module';
import { CompanyModule } from '../company/company.module';

@Module({
    imports: [
        EmployeeModule,
        CompanyModule,
        AuthModule
    ],
    providers: [],
    controllers: [SettingsController],
})
export class SettingsModule {}
