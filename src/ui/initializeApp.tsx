import { render } from 'preact';
import { ContextConnector } from 'src/typeDefs';
import { $$ } from 'src/utils';
import App from './App';
import { AppContextProvider } from './AppContext';

export default function initializeApp(onChangeEvent: ContextConnector) {
    $$('.CookieAutomator').forEach(el => el.remove());

    const root = document.createElement('div');
    root.classList.add('CookieAutomator');
    document.body.appendChild(root);

    render(
        <AppContextProvider onChangeEvent={onChangeEvent}>
            <App />
        </AppContextProvider>
        , root);
}
