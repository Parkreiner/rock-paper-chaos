/**
 * @file Defines and exports class definitions for the deck, hand, and discard
 * piles.
 *
 * @todo Eventually rewrite these. I think this will be less of a priority,
 * because I think these three have all the obvious functionality that could be
 * needed.
 */

import { Card } from "./Card";
import { Discovery } from "../clientJsonTypes";
import { JsonValue, Stack } from "../sharedTypes";

type ForEachCallback = (
  card: Card,
  index?: number,
  thisArg?: CardStack
) => void;

abstract class CardStack {
  protected cards: Stack<Card>;

  constructor(cards: Card[]) {
    this.cards = cards;
  }

  get length() {
    return this.cards.length;
  }

  #forEach(callback: ForEachCallback): void {
    for (const [index, card] of this.cards.entries()) {
      callback(card, index, this);
    }
  }

  #forEachById(callback: ForEachCallback, ...cardIds: number[]): void {
    for (const [index, card] of this.cards.entries()) {
      if (cardIds.includes(card.id)) {
        callback(card, index, this);
      }
    }
  }

  add(...cards: Card[]): this {
    this.cards.push(...cards);
    return this;
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i >= 1; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));

      const plucked = this.cards[randomIndex] as Card;
      this.cards[randomIndex] = this.cards[i] as Card;
      this.cards[i] = plucked;
    }
  }

  getIds(): number[] {
    return this.cards.map((card) => card.id);
  }

  discover(): Discovery {
    const randomIndices: number[] = [];
    let cardsLeft = this.cards.length;

    while (randomIndices.length < 3 && cardsLeft > 0) {
      let randomIndex = Math.floor(Math.random() * this.cards.length);
      while (randomIndices.includes(randomIndex)) {
        randomIndex = (randomIndex + 1) % this.cards.length;
      }

      randomIndices.push(randomIndex);
      cardsLeft--;
    }

    return [
      this.cards[randomIndices[0] ?? -1]?.id ?? null,
      this.cards[randomIndices[1] ?? -1]?.id ?? null,
      this.cards[randomIndices[2] ?? -1]?.id ?? null,
    ];
  }

  removeById(id: number): Card | null {
    const removalIndex = this.cards.findIndex((card) => card.id === id);
    if (removalIndex === -1) {
      return null;
    }

    const removed = this.cards.splice(removalIndex);
    return removed[0] ?? null;
  }

  removeByIds(...ids: number[]): Card[] {
    if (ids.length === 0) {
      return [];
    }

    const removed: Card[] = [];
    const remaining: Card[] = [];

    for (const card of this.cards) {
      const destination = ids.includes(card.id) ? removed : remaining;
      destination.push(card);
    }

    this.cards = remaining;
    return removed;
  }

  setRevealedById(...cardIds: number[]): void {
    this.#forEachById((card) => card.setRevealed(true), ...cardIds);
  }

  setPlayableById(playable: boolean, ...cardIds: number[]): void {
    this.#forEachById((card) => card.setPlayable(playable), ...cardIds);
  }

  setPlayabilityAll(playable: boolean): void {
    this.#forEach((card) => card.setPlayable(playable));
  }

  toJson(): number[] {
    return this.getIds() satisfies JsonValue;
  }
}

export class DiscardPile extends CardStack {}

export class Hand extends CardStack {
  getRandomCard(): Card | null {
    const randomIndex = Math.floor(Math.random() * this.cards.length);
    return this.cards[randomIndex] ?? null;
  }
}

export class Deck extends CardStack {
  drawN(drawCount: number): Card[] {
    const drawn: Card[] = [];
    for (let i = drawCount; this.cards.length > 0 && i > 0; i--) {
      drawn.push(this.cards.pop() as Card);
    }

    return drawn;
  }

  draw(): Card | null {
    return this.drawN(1)[0] ?? null;
  }
}
