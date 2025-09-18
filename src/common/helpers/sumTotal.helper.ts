import { InternalServerErrorException, Logger } from "@nestjs/common";

export function sumByProp<T extends Record<string, any>>(array: T[], propName: keyof T): number {
  return array.reduce((acc, obj) => {
    const value = obj[propName];
    return acc + (typeof value === 'number' ? value : (() => { 
      Logger.error(`Value of property ${String(propName)} is not a number in object: ${JSON.stringify(obj)}`);
      throw new InternalServerErrorException(`Erro ao somar valores. ${String(propName)} não é um número em algum objeto da lista.`);
    })());
  }, 0);
}