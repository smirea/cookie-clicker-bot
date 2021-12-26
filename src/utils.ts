import type { GameT } from './typeDefs';

export const $ = (selector: string): HTMLDivElement | null => document.querySelector(selector);
export const $$ = (selector: string): HTMLDivElement[] => Array.from(document.querySelectorAll(selector));
// in Tampermonkey context, "unsafeWindow" is the global window
export const global = window.unsafeWindow || window;
export const Game = (global as any).Game as GameT;
