/**
 * @file Defines a set of types describing values that will be sent to the
 * client. Not sure if these types could also be used for the database yet.
 */

import { RpsElement } from "./sharedTypes";

export type CardId = number;

/**
 * A set of up to three random cards. The player can select one of them to
 * add to their hand.
 */
export type Discovery = [CardId | null, CardId | null, CardId | null];

/**
 * All the statelsss data about a card that will be sent to the client. Far
 * simplified compared to the database JSON.
 */
export type CardJson = {
  id: CardId;
  name: string;
  element: RpsElement;
  effectText: string;
  imgUrl: string;
};

/**
 * All the stateful data about a card that needs to be sent to the client.
 */
export type CardState = {
  id: CardId;
  revealed: boolean;
  playable: boolean;
};

/**
 * JSON reprenting info about the current round. After the initial load, this is
 * the data that will be sent to the client at the start of each round
 * (possibly the start of each phase?)
 */
export type RoundUpdate = {
  gameOver: boolean;
  round: number;
  p1: PlayerUpdate;
  p2: PlayerUpdate;
};

/** Info about one of the players. */
export type PlayerUpdate = {
  hand: CardId[];
  deckCount: number;
  discardCount: number;
  points: number;
  discovery: Discovery | null;
};

/**
 * Data that is sent to the client side right after the game starts.
 */
export type InitialData = {
  allCards: Record<CardId, CardJson>;
  p1Deck: CardId[];
  p2Deck: CardId[];
  startingState: RoundUpdate;
};
