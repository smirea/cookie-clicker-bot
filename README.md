# Cookie Clicker BOT

Automates [Cookie Clicker](https://orteil.dashnet.org/cookieclicker) purchasing, click and more!

![](./example.png?v=2)

## Usage

### Quick and dirty

Just paste the contents of [dist/CookieBot.js](./dist/CookieBot.js) into the console of [Cookie Clicker](https://orteil.dashnet.org/cookieclicker) and you're good to go


### Automatic updates via [Tampermonkey chrome extension](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)

You can setup the script to automatically update when refreshing tha page

```js
// ==UserScript==
// @name         Cookie Clicker BOT
// @namespace    @github/smirea
// @version      1.0.0
// @author       smirea
// @description  https://github.com/smirea/cookie-clicker-bot
// @icon         https://img.cppng.com/download/2020-06/8-2-cookie-png.png
// @match        http*://orteil.dashnet.org/cookieclicker/*
// @require      https://raw.githubusercontent.com/smirea/cookie-clicker-bot/master/dist/CookieBot.js
// ==/UserScript==
```

## Development

```bash
yarn watch
```

**NOTE:** easiest is to use the Tampermonkey worflow above and just switch the `@require` statement from the github url to your local file system `dist/CookieBot.js`. [Instructions on how to grant Tampermonkey filesystem access](https://stackoverflow.com/a/55568568/574576)
