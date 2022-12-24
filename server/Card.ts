/**
 * @file The basic set of methods and properties that defines the base version
 * of a card.
 *
 * @todo
 */
import { CardState } from "../clientJsonTypes";
import { JsonValue, RpsElement } from "../sharedTypes";
import { CardDatabaseJson } from "./databaseTypes";
import { PhaseCardInterface } from "./phases";

export class Card implements PhaseCardInterface {
  #revealed = false;
  #playable = true;

  // All the other information
  readonly id: number;
  readonly element: RpsElement;
  constructor(data: CardDatabaseJson) {
    this.id = data.id;
    this.element = data.element;
  }

  setRevealed(revealed: boolean): void {
    this.#revealed = revealed;
  }

  setPlayable(playability: boolean): void {
    this.#playable = playability;
  }

  toJson(): CardState {
    return {
      id: this.id,
      revealed: this.#revealed,
      playable: this.#playable,
    } satisfies JsonValue;
  }

  // The idea here was that all cards and card subclasses would have these
  // methods. They would be purposefully left empty for the base card class, but
  // special functionality could be added for the subclass versions. That way,
  // the methods would be guaranteed to be defined, no matter how the card was
  // made.
  upkeepPhase(): void {}
  drawPhase(): void {}
  selectionPhase(): void {}
  preCombatPhase(): void {}
  combatPhase(): void {}
  postCombatPhase(): void {}
}
