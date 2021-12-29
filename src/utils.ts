import type { Building, GameT } from './typeDefs';

export const $ = (selector: string): HTMLDivElement | null => document.querySelector(selector);
export const $$ = (selector: string): HTMLDivElement[] => Array.from(document.querySelectorAll(selector));
// in Tampermonkey context, "unsafeWindow" is the global window
export const global = window.unsafeWindow || window;
export const Game = (global as any).Game as GameT;

export const getAffordableBuildingMultiple = (obj: Building, choices: number[]) =>
    choices.find(end => getCostOfNBuildings(obj, obj.amount + end) <= Game.cookies) || null;

export const getCostOfNBuildings = (obj: Building, end: number) =>
    obj.amount >= end
        ? 0
        : obj.basePrice * (1.15 ** end - 1.15 ** obj.amount) / 0.15;

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
        boolean; format?: 'full' | 'small' | 'numeric'
    } = {}
): string => {
    number = Math.floor(number);

    const labels: Array<[string, string]> = [
        ['million', 'M'],
        ['billion', 'B'],
        ['trillion', 'T'],
        ['quadrillion', 'Quad'],
        ['quintillion', 'Quint'],
        ['sextillion', 'Sext😏'],
        ['septillion', 'Sept'],
        ['octillion', 'Oct'],
        ['nonillion', 'Non'],
        ['decillion', 'Dec'],
    ];

    if (number < 1e3) return String(number);
    if (number < 1e6) return `${Math.floor(number / 1e3)},${number % 1000}`;

    const power = Math.floor(Math.log10(number));
    const floorPower = Math.floor(power / 3) * 3;
    const label = labels[floorPower / 3 - 2];
    let value = Math.floor(number / Math.pow(10, floorPower));
    value += Math.round(Math.floor(number / Math.pow(10, floorPower - 2)) % 100) / 100;
    value = Math.round(value * 100) / 100;
    const unit = (
        format === 'full' ? ' ' + label[0] :
        format === 'small' ? ' ' + label[1] :
        'e' + floorPower
    );

    return (cookies ? '🍪' : '') + String(value) + unit;
}
