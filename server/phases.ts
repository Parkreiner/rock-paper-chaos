import { Queue } from "../sharedTypes";
import { Game } from "./Game";

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
export type PhaseCardInterface = {
  [p in Phase as `${p}Phase`]: (gameInstance?: Game) => void;
};
