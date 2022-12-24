import { CardState } from "../clientJsonTypes";
import { JsonValue, RpsElement } from "../sharedTypes";
import { CardDatabaseJson } from "./databaseTypes";
import { PhaseCardInterface } from "./phases";

export class Card implements PhaseCardInterface {
  #revealed = false;
  #playable = true;
  readonly id: number;
  readonly element: RpsElement;

  // Constructor assumes that all special effects will come from subclasses.
  // If a card is just of type Card, it has no special abilities
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

  upkeepPhase(): void {}
  drawPhase(): void {}
  selectionPhase(): void {}
  preCombatPhase(): void {}
  combatPhase(): void {}
  postCombatPhase(): void {}
}
