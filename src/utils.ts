export const $ = (selector: string): HTMLDivElement | null => document.querySelector(selector);
export const $$ = (selector: string): HTMLDivElement[] => Array.from(document.querySelectorAll(selector));
