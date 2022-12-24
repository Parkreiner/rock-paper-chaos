/**
 * @file Holds information representing all the phases that can happen in the
 * game.
 */
import { Queue } from "../sharedTypes";
import { Game } from "./Game";

/** All phases, exposed as an array for iteration. */
export const phases = [
  "upkeep",
  "draw",
  "selection",
  "preCombat",
  "combat",
  "postCombat",
] as const;

export type Phase = typeof phases[number];
export type PhaseCallbacks = Record<Phase, Queue<() => void>>;

/**
 * Exposes a set of methods that a card can implement.
 */
// Despite the name, this is a type alias and not an interface. Interfaces
// don't support mapped type definitions.
export type PhaseCardInterface = {
  [p in Phase as `${p}Phase`]: (gameInstance?: Game) => void;
};
