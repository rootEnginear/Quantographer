export const deepClone = <T>(target: T): T => {
  if (typeof target !== 'object')
    // primitive type
    return target
  // object type
  // create container
  const newTargert: any = Array.isArray(target) ? [] : {}
  for (const key in target)
    // clone child
    newTargert[key] = deepClone(
      target[key]
    )
  return newTargert
}
