/** Rock, Paper, or Scissors, each with a numerical value. */
export const elements = {
  r: 0,
  p: 1,
  s: 2,
} as const;

/** An individual element in rock-paper-scissors. */
export type RpsElement = keyof typeof elements;

/** Any kind of valid JSON-serializable value. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** An array that will complain if you call the shift or unshift methods. */
export type Stack<T = unknown> = Omit<Array<T>, "shift" | "unshift">;

/**
 * An array that will complain if you call the pop or unshift methods.
 *
 * May need to be replaced with a dedicated class that implements things as
 * linked lists or maybe two stacks, depending on how slow the shift/unshift
 * operations end up being.
 */
export type Queue<T = unknown> = Omit<Array<T>, "pop" | "unshift">;
