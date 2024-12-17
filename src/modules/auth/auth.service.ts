import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Role, User } from '@prisma/client';
import { UserLoginDto } from './dto/user-login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CompanyService } from '../company/company.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly companyService: CompanyService
  ) {}

  private async validateUser(email: string, password: string): Promise<Omit<User, "password">> {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email ou senha incorretos');
    }

    const { password: _password, ...result } = user;
    return result; // Remove a senha do resultado
  }

  public async login(body: UserLoginDto) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('O email e a senha são obrigatórios');
    }

    const user = await this.validateUser(body.email, body.password);
    
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async validateNewUser(user: CreateUserDto | CreateEmployeeDto) {
    if (!user.email || !user.password) {
      throw new UnauthorizedException('O email e a senha são obrigatórios');
    }

    const userExists = await this.userService.findByEmail(user.email);
    
    if (userExists) {
      throw new UnauthorizedException('Email já cadastrado');
    }
  }

  public async register(user: CreateUserDto){
    await this.validateNewUser(user);

    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const newCompany = await this.companyService.createCompany({
      email: user.email,
      name: user.name,
      phone: user.phone
    });
    
    const newUser = await this.userService.create({
      ...user, 
      password: hashedPassword, 
      role: Role.ADMIN, 
      companyId: newCompany.id
    });

    const employee = await this.registerEmployee(newUser.id, newUser);

    // Update the user with the employeeId
    const userUpdated = await this.userService.update(newUser.id, { employeeId: employee.id });

    return userUpdated;
  }

  public async isAdminRequest(userId: number){
    const admin = await this.userService.findById(userId);

    if (!admin || admin.role !== Role.ADMIN) {
      return false;
    }

    return true;
  }

  public async registerEmployee(adminId: number, user: CreateEmployeeDto){
    const isAdminRequest = await this.isAdminRequest(adminId);
    
    if(!isAdminRequest){
      throw new UnauthorizedException('Apenas administradores podem cadastrar funcionários');
    }
    //await this.validateNewUser(user);

    const companyId = await this.companyService.findCompanyByUserId(adminId);
    const employee = await this.userService.createEmployee({
      companyId,
      name: user.name
    });

    return employee;
  }
}
