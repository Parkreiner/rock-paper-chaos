/**
 * @files Defines all the basic methods for running a new game instance.
 * Ideally, the app will get to a point where multiple games are able to run
 * concurrently (assuming there are enough players).
 */
import { RoundUpdate } from "../clientJsonTypes";
import { Card } from "./Card";
import { elements, JsonValue, RpsElement } from "../sharedTypes";
import { Player } from "./Player";
import { PhaseCallbacks, phases } from "./phases";

type RpsWinner = "p1" | "p2" | "draw";

export class Game {
  #round = 1;
  #gameOver = false;

  /**
   * Note: these callbacks are designed to represent card effects and are set
   * to be run at the start of a phase. May or may not separate stacks for
   * holding cleanup functions?
   */
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

  /** Fully resets the game. */
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
    // how it hooks up to manageGameState. I'm thinking that the end of the
    // selection phase is when all the card effects should be loaded up.
  }

  #preCombatPhase(): void {
    // Do nothing; stubbed out in case this needs to change later
    return;
  }

  /** @todo Finish this method definition */
  #combatPhase(): void {
    const p1Select = this.#player1.selectedCard;
    const p2Select = this.#player2.selectedCard;

    if (p1Select === null || p2Select === null) {
      throw new Error(`Reached combat phase before both players were ready`);
    }

    const baseScore = this.#calculateRpsWinner(
      p1Select.element,
      p2Select.element
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

  /**
   * With how I'm thinking about the game right now, the vast majority of it is
   * synchronous. The only exception is the selection phase, which requires that
   * the game be paused while both players select a card to play.
   *
   * With a generator, I think it could be possible to yield a round update to
   * pause the method, and then resume the function only once both players have
   * a selection.
   */
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

  // I don't really know what I'm doing with this; I think the idea was to have
  // a separate function for receiving messages/data from both clients,
  // basically having it act as a middleman
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
