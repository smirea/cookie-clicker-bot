const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const userscriptPath = path.join(dist, 'cookie-clicker-bot.userscript.js');
const packageJson = require('../package.json');

const sourceCodeUrl = `https://raw.githubusercontent.com/smirea/cookie-clicker-bot/master/dist/cookie-clicker-bot.js?v=${packageJson.version}`;
const scriptUrl = `https://raw.githubusercontent.com/smirea/cookie-clicker-bot/master/dist/${path.basename(userscriptPath)}`;

const runCmd = (title, command) => {
    console.log('');
    console.log(title);
    console.log('$>', command);
    execSync(command, { stdio: 'inherit' });
}

runCmd(
    '🍪 Building Typescript to check for errors 🍪',
    'yarn build:tsc-errors',
);

runCmd(
    '🍪 Building bundle 🍪',
    'yarn build',
);

console.log('');
console.log('🍪 Create new UserScript version 🍪');
console.log('');

fs.writeFileSync(
    userscriptPath,
    `
// ==UserScript==
// @name            Cookie-Clicker BOT
// @namespace       @github/smirea
// @version         ${packageJson.version}
// @author          smirea
// @description     https://github.com/smirea/cookie-clicker-bot
// @icon            https://img.cppng.com/download/2020-06/8-2-cookie-png.png
// @match           http*://orteil.dashnet.org/cookieclicker/*
// @require         ${sourceCodeUrl}
// @updateURL       ${scriptUrl}
// @downloadURL     ${scriptUrl}
// ==/UserScript==
    `.trim(),
);

runCmd(
    '🍪 Add bundle 🍪',
    'git add dist',
);
