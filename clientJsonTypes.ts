import { RpsElement } from "./sharedTypes";

/**
 * @file Defines a set of types describing values that will be sent to the
 * client. Not sure if these types could also be used for the database yet.
 */

export type CardId = number;
export type Discovery = [CardId | null, CardId | null, CardId | null];

export type CardJson = {
  id: CardId;
  name: string;
  element: RpsElement;
  effectText: string;
  imgUrl: string;
};

export type CardState = {
  id: CardId;
  revealed: boolean;
  playable: boolean;
};

export type RoundUpdate = {
  gameOver: boolean;
  round: number;
  p1: PlayerUpdate;
  p2: PlayerUpdate;
};

export type PlayerUpdate = {
  hand: CardId[];
  deckCount: number;
  discardCount: number;
  points: number;
  discovery: Discovery | null;
};

export type InitialData = {
  cards: Record<CardId, CardJson>;
  p1Cards: CardId[];
  p2Cards: CardId[];
  startingState: RoundUpdate;
};
