export function extendArrayMetadata<T extends Array<any>>(
  key: string,
  metadata: T,
  target,
) {
  const previousValue = Reflect.getMetadata(key, target) || [];
  const value = [...previousValue, ...metadata];
  console.log(Reflect.defineMetadata(key, value, target));
}
