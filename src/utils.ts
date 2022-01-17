import type { Building, GameT } from './typeDefs';

export const $ = (selector: string): HTMLDivElement | null => document.querySelector(selector);
export const $$ = (selector: string): HTMLDivElement[] => Array.from(document.querySelectorAll(selector));
// in Tampermonkey context, "unsafeWindow" is the global window
export const global = window.unsafeWindow || window;

export const getGame = (): GameT | null => {
    // ObjectsById determines if the game has initialized
    const Game = (global as any).Game;
    if (!Game?.ObjectsById) return null;

    module.exports.Game = Game;

    return Game;
}

export let Game = getGame() as GameT;

export const getAffordableBuildingMultiple = (obj: Pick<Building, 'amount' | 'basePrice'>, choices: number[]) =>
    choices.find(end => getCostOfNBuildings(obj, obj.amount + end) <= Game.cookies) || null;

export const getCostOfNBuildings = (obj: Pick<Building, 'amount' | 'basePrice'>, end: number, amount = obj.amount) =>
    Math.round(
        amount >= end
            ? 0
            : obj.basePrice * (1.15 ** end - 1.15 ** amount) / 0.15
    );

export const cleanHTML = (html: string) =>
    html.replace(/<q>.*<\/q>/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&bull;/g, '●')
        .replace(/&eacute;/g, 'é');

export const formatDuration = (duration: number, { short = true, pad = false } = {}) => {
    duration = Math.floor(duration);
    let hours = String(Math.floor(duration / 3600));
    let minutes = String(Math.floor((duration % 3600) / 60));
    let seconds = String(duration % 60);

    if (pad) {
        [hours, minutes, seconds] = [hours, minutes, seconds].map(num => num && ('0' + num).slice(-2));
    }

    const [h, m, s] = short
        ? ['h', 'm', 's']
        : [' hours', ' minutes', ' seconds'];

    if (hours !== '0') return `${hours}${h} ${minutes}${m} ${seconds}${s}`;

    if (minutes !== '0') return `${minutes}${m} ${seconds}${s}`;

    return `${seconds}${s}`;
};

export const formatAmount = (
    number: number,
    { cookies = true, format = 'full' }: {
        cookies?:
        boolean; format?: 'full' | 'numeric'
    } = {}
): string => {
    number = Math.floor(number);
    const prefix = cookies ? '🍪' : '';

    if (number < 1e3) return prefix + String(number);
    if (number < 1e6) return prefix + `${Math.floor(number / 1e3)},${number % 1000}`;

    const power = Math.floor(Math.log10(number));
    const floorPower = power - (power % 3);
    let value = Math.floor(number / Math.pow(10, floorPower));
    value += Math.round(Math.floor(number / Math.pow(10, floorPower - 2)) % 100) / 100;
    value = Math.round(value * 100) / 100;
    const unit = format === 'full' ? ' ' + units.list[floorPower / 3 - 1] : 'e' + floorPower;

    return prefix + String(value) + unit;
}

export const units = (() => {
    const list = ['thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'];
    const prefixes = ['', 'un', 'duo', 'tre', 'quattuor', 'quin', 'sex', 'septen', 'octo', 'novem'];
    const suffixes = ['decillion', 'vigintillion', 'trigintillion', 'quadragintillion', 'quinquagintillion', 'sexagintillion', 'septuagintillion', 'octogintillion', 'nonagintillion'];

    for (const suf of suffixes) {
        for (const pref of prefixes) {
            list.push(pref + suf);
        }
    }

    const map: Record<string, number> = {};
    for (let i = 0; i < list.length; ++i) {
        map[list[i]] = 10 ** (3 * (i + 1));
    }

    const regexp = new RegExp(`(\\d+(?:\\.\\d+)?)\\s+(${list.join('|')})`, 'gi');
    const commaReg = /(\d+),(\d+)/g;
    const strReplace = (str: string) =>
        str.replace(commaReg, '$1$2')
            .replace(regexp, (_, value, unit) => String(parseFloat(value) * map[unit.toLowerCase()]))

    return { list, map, regexp, strReplace };
})();

export const fixMenuBug = () => {
    Game.specialTab = '';
    Game.ToggleSpecialMenu(0);
}

export const clamp = (value: number, min: number, max?: number): number => {
    if (value < min) value = min;
    if (max != null && value > max) value = max;
    return value;
};

export const sample = <T>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
