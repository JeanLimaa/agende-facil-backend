import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { PlanType, Role, User } from '@prisma/client';
import { UserLoginDto } from './dto/user-login.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CompanyService } from '../company/company.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { DatabaseService } from 'src/services/Database.service';
import { UserPayload } from './interfaces/UserPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly companyService: CompanyService,
    private readonly subscriptionService: SubscriptionService,
    private readonly prisma: DatabaseService
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

  private async validateNewUser(user: CreateUserDto | CreateEmployeeDto) {
    if (!user.email || !user.password) {
      throw new UnauthorizedException('O email e a senha são obrigatórios');
    }

    const userExists = await this.userService.findByEmail(user.email);
    
    if (userExists) {
      throw new UnauthorizedException('Email já cadastrado');
    }
  }

  private async isAdminRequest(userId: number){
    const admin = await this.userService.findById(userId);

    if (!admin || admin.role !== Role.ADMIN) {
      return false;
    }

    return true;
  }

  public async login(body: UserLoginDto) {
    if (!body.email || !body.password) {
      throw new UnauthorizedException('O email e a senha são obrigatórios');
    }

    const user = await this.validateUser(body.email, body.password);
    
    const payload: UserPayload = { userId: user.id, email: user.email, role: user.role, companyId: user.companyId };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async register(user: CreateUserDto){
    await this.validateNewUser(user);

    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // Criar uma empresa para o usuário
    const newCompany = await this.companyService.createCompany({
      email: user.email,
      name: user.name,
      phone: user.phone
    });
    
    // Criar um usuário administrador para a empresa
    const newUser = await this.userService.create({
      email: user.email, 
      password: hashedPassword, 
      role: Role.ADMIN, 
      companyId: newCompany.id,
      employeeId: null
    });

    // Criar um plano de teste inicial para a empresa
    const trialPlan = await this.prisma.plan.findUnique({
      where: { name: PlanType.TRIAL }
    })
    await this.subscriptionService.createSubscription(
      newCompany.id, 
      trialPlan.id
    );

    // Criar um funcionário para o administrador
    const employee = await this.registerEmployee(newUser.id, user);

    // Update the user with the employeeId
    const userUpdated = await this.userService.update(newUser.id, { employeeId: employee.id });

    const payload: UserPayload = { 
      userId: userUpdated.id,
      email: userUpdated.email, 
      role: userUpdated.role, 
      companyId: userUpdated.companyId 
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  public async registerEmployee(adminId: number, user: CreateEmployeeDto){
    const isAdminRequest = await this.isAdminRequest(adminId);
    
    if(!isAdminRequest){
      throw new UnauthorizedException('Apenas administradores podem cadastrar funcionários');
    }
    //await this.validateNewUser(user);

    const companyId = await this.companyService.findCompanyIdByUserId(adminId);
    const employee = await this.userService.createEmployee({
      companyId,
      name: user.name,
      phone: user.phone,
    });

    return employee;
  }

  public async getMe(userId: number): Promise<GetMePayload> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        employee: true,
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const payload: GetMePayload = {
      email: user.email,
      name: user.employee.name,
      phone: user.employee.phone,
      companyName: user.company.name,
      companyLink: `${process.env.FRONTEND_URL}/cliente/${user.company.link}`,
    };

    return payload;
  }
}
