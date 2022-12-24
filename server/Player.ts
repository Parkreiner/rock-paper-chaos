/**
 * @file Represents a player, along with all their cards.
 */

import { JsonValue } from "../sharedTypes";
import { Card } from "./Card";
import { DiscardPile, Hand, Deck } from "./CardStacks";
import { Discovery } from "../clientJsonTypes";

/** Indicates where a discovery can come from. */
type DiscoverySource = "deck" | "discard";

/** Info about a discovery */
type DiscoveryInfo =
  | { source: null; cards: null }
  | { source: DiscoverySource; cards: Discovery };

export class Player {
  #points = 0;
  #canGainPoints = true;
  #selectedCard: Card | null = null;
  #hand = new Hand([]);
  #discardPile = new DiscardPile([]);
  #discovery: DiscoveryInfo = { source: null, cards: null };

  readonly id: 1 | 2;
  #initialCards: Card[];
  #deck: Deck;

  constructor(id: 1 | 2, cards: Card[]) {
    this.id = id;
    this.#initialCards = cards;
    this.#deck = new Deck([...cards]);
  }

  get selectedCard(): Card | null {
    return this.#selectedCard;
  }

  get outOfCards() {
    return this.#hand.length === 0 && this.#deck.length === 0;
  }

  set canGainPoints(value: boolean) {
    this.#canGainPoints = value;
  }

  /**
   * Placeholder method until rest of the game can be scaffolded out; this will
   * be removed at some point.
   *
   * This basically results in an instant game over, but the idea is to give the
   * other player a fighting chance not to lose any more points.
   */
  convertRemainingCardsToPoints(): void {
    if (this.#hand.length > 0) {
      const handIds = this.#hand.getIds();
      this.addPoints(handIds.length);
      this.discardByIds(...handIds);
    }

    if (this.#deck.length > 0) {
      this.addPoints(this.#deck.length);
      this.mill(this.#deck.length);
    }
  }

  reset(): void {
    this.#deck = new Deck([...this.#initialCards]);
  }

  /**
   * Transfer some number of cards from the deck to the hand. Defaults to 1.
   */
  draw(drawCount = 1): void {
    const drawn = this.#deck.drawN(drawCount);
    this.#hand.add(...drawn);
  }

  /**
   * Transfer some number of cards from the deck to the discard pile. Defaults
   * to 1.
   */
  mill(millCount = 1): void {
    const milled = this.#deck.drawN(millCount);
    this.#discardPile.add(...milled);
  }

  /** Transfers specific cards from the discard pile to the hand. */
  reloadByIds(...cardIds: number[]): void {
    const removedFromDiscard = this.#discardPile.removeByIds(...cardIds);
    this.#hand.add(...removedFromDiscard);
  }

  /** Transfers specific cards from the hand to the discard pile. */
  discardByIds(...cardIds: number[]): void {
    const removedFromHand = this.#hand.removeByIds(...cardIds);
    this.#discardPile.add(...removedFromHand);
  }

  /** Shuffles specific cards from the hand into the deck. */
  shuffleHandIntoDeckById(...cardIds: number[]): void {
    const removed = this.#hand.removeByIds(...cardIds);
    this.#deck.add(...removed);
    this.#deck.shuffle();
  }

  /** Shuffles specific cards from the discard pile into the deck. */
  shuffleDiscardIntoDeckById(...cardIds: number[]): void {
    const refreshed = this.#discardPile.removeByIds(...cardIds);
    this.#deck.add(...refreshed);
    this.#deck.shuffle();
  }

  discardSelectedCard(): void {
    if (!this.#selectedCard) {
      throw new Error("No card in the main play area.");
    }

    const card = this.#selectedCard;
    this.#selectedCard = null;
    this.#discardPile.add(card);
  }

  /** Transfer a card from hand to the Selected Card zone. */
  selectCardById(cardId: number): void {
    const selectedCard = this.#hand.removeById(cardId);
    if (!selectedCard) {
      throw new Error(`Provided card ID ${cardId} does not exist in hand.`);
    }

    this.#selectedCard = selectedCard;
  }

  discover(sourceName: DiscoverySource): void {
    const source = sourceName === "deck" ? this.#deck : this.#discardPile;
    this.#discovery = { source: sourceName, cards: source.discover() };
  }

  resolveDiscoveryChoice(cardId: number): void {
    if (this.#discovery.source === null) {
      return;
    }

    if (!this.#discovery.cards.includes(cardId)) {
      throw new Error("Trying to discover card from wrong source.");
    }

    const sourceName = this.#discovery.source;
    const source = sourceName === "deck" ? this.#deck : this.#discardPile;

    const card = source.removeById(cardId);
    if (!card) {
      throw new Error(
        `Card with ID ${cardId} does not exist in source ${sourceName}`
      );
    }

    this.#hand.add(card);
    this.#discovery = { source: null, cards: null };
  }

  addPoints(newPoints = 1): void {
    if (this.#canGainPoints) {
      this.#points += newPoints;
    }
  }

  subtractPoints(newPoints = 1): void {
    this.#points -= newPoints;
  }

  multiplyPoints(multiplier = 2): void {
    this.#points *= multiplier;
  }

  dividePoints(divisor = 2): void {
    this.#points = Math.ceil(this.#points / divisor);
  }

  toJson() {
    return {
      points: this.#points,
      hand: this.#hand.getIds(),
      deckCount: this.#deck.length,
      discardCount: this.#discardPile.length,
      discovery: this.#discovery.cards,
    } satisfies JsonValue;
  }
}
