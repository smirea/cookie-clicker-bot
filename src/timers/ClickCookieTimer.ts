import { $ } from 'src/utils';
import options from 'src/options';
import Timer from 'src/Timer';

export default class ClickCookieTimer extends Timer {
    execute() {
        $('#bigCookie')?.click();
        return options.cookieClickTimeout;
    }
}
