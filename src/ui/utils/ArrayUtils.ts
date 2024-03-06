export function arrayRemoveElement<T>(array: T[], element: T): boolean {
  const index = array.indexOf(element);
  if (index === -1) {
    return false;
  }
  arrayRemoveAt(array, index);
  return true;
}

export function arrayRemoveAt<T>(array: T[], index: number): void {
  array.splice(index, 1);
}

export const arrayFind: <T>(array: readonly T[], predicate: (element: T, index: number, array: readonly T[]) => boolean) => T | undefined =
  typeof Array.prototype.find === 'function'
    ? (array, predicate) => array.find(predicate)
    : (array, predicate) => {
        for (let i = 0; i < array.length; i++) {
          if (predicate(array[i], i, array)) {
            return array[i];
          }
        }
        return undefined;
      };
