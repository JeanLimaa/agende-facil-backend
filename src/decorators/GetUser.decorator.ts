import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Cria o decorator GetUser que extrai o usuário da requisição
export const GetUser = createParamDecorator(
  (data: keyof any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Caso seja especificado um campo, retorna apenas ele (ex: id, email, etc.)
    return data ? user?.[data] : user;
  },
);
