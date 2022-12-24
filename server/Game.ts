import { RoundUpdate } from "../clientJsonTypes";
import { Card } from "./Card";
import { elements, JsonValue, RpsElement } from "../sharedTypes";
import { Player } from "./Player";
import { PhaseCallbacks, phases } from "./phases";

type RpsWinner = "p1" | "p2" | "draw";

export class Game {
  #round = 1;
  #gameOver = false;
  #phaseCallbacks: PhaseCallbacks = {
    upkeep: [],
    draw: [],
    selection: [],
    preCombat: [],
    combat: [],
    postCombat: [],
  };

  #player1: Player;
  #player2: Player;

  constructor(player1Cards: Card[], player2Card: Card[]) {
    this.#player1 = new Player(1, player1Cards);
    this.#player2 = new Player(2, player2Card);
  }

  get gameOver() {
    return this.#gameOver;
  }

  reset(): void {
    this.#round = 1;
    this.#player1.reset();
    this.#player2.reset();
    this.#phaseCallbacks = {
      upkeep: [],
      draw: [],
      selection: [],
      preCombat: [],
      combat: [],
      postCombat: [],
    };
  }

  #upkeepPhase(): void {
    if (!this.#player1.outOfCards && !this.#player2.outOfCards) {
      return;
    }

    if (this.#player1.outOfCards) {
      this.#player1.convertRemainingCardsToPoints();
    }

    if (this.#player2.outOfCards) {
      this.#player2.convertRemainingCardsToPoints();
    }

    this.#gameOver = true;
  }

  #drawPhase(): void {
    this.#player1.draw();
    this.#player2.draw();
  }

  #selectionPhase() {
    // Complicated stuff; this might not have a void a return type, depending on
    // how it hooks up to manageGameState. The end of the selection phase will
    // have to be where I load up the callbacks for each card
  }

  #preCombatPhase(): void {
    // Do nothing; stubbed out in case this needs to change later
    return;
  }

  #combatPhase(): void {
    const p1Select = this.#player1.selectedCardInfo;
    const p2Select = this.#player2.selectedCardInfo;

    if (!p1Select.ready || !p2Select.ready) {
      throw new Error(`Reached combat phase before both players were ready`);
    }

    const baseScore = this.#calculateRpsWinner(
      p1Select.card.element,
      p2Select.card.element
    );
  }

  #postCombatPhase(): void {
    this.#player1.discardSelectedCard();
    this.#player2.discardSelectedCard();
  }

  #calculateRpsWinner(p1Play: RpsElement, p2Play: RpsElement): RpsWinner {
    if (p1Play === p2Play) {
      return "draw";
    }

    const p1Num = elements[p1Play];
    const p2Num = elements[p2Play];
    return p1Num > p2Num && p1Num !== 2 && p2Num !== 0 ? "p1" : "p2";
  }

  *gameStateGenerator() {
    while (!this.#gameOver) {
      for (const phase of phases) {
        if (this.#gameOver) {
          break;
        }

        const callbackStack = this.#phaseCallbacks[phase];
        while (callbackStack.length > 0) callbackStack.shift()?.();

        switch (phase) {
          case "upkeep": {
            this.#upkeepPhase();
            break;
          }

          case "draw": {
            this.#drawPhase();
            break;
          }

          case "selection": {
            this.#selectionPhase();
            break;
          }

          case "preCombat": {
            this.#preCombatPhase();
            break;
          }

          case "combat": {
            this.#combatPhase();
            break;
          }

          case "postCombat": {
            this.#postCombatPhase();
            break;
          }
        }
      }
    }

    return this.toRoundUpdateJson();
  }

  processMessages(): void {}

  // Not sure if this class will need multiple types of JSON; if not, this name
  // can be changed to just toJson
  toRoundUpdateJson(): RoundUpdate {
    return {
      gameOver: this.#gameOver,
      round: this.#round,
      p1: this.#player1.toJson(),
      p2: this.#player2.toJson(),
    } satisfies JsonValue;
  }
}

function* testGen() {
  const temp: "AssignValue" = yield "YieldValue" as const;
  return "ReturnValue" as const;
}
