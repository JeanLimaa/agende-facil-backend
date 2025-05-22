export function sumByProp<T extends Record<string, any>>(array: T[], propName: keyof T): number {
  return array.reduce((acc, obj) => {
    const value = obj[propName];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
}