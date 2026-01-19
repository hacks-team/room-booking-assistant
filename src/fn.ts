export const withTypeGuard = <T = unknown>(predicate: (value: any) => value is T, handler: (value: T) => void) => {
  return (value: any) => {
    if (predicate(value)) {
      handler(value);
    }
  };
};
