import React, { createContext, useContext, useEffect, useState } from 'react';
import type Automator from 'src/Automator';
import globalOptions from 'src/options';
import { ContextConnector, Options } from 'src/typeDefs';
import { global } from 'src/utils';

const AppContext = createContext<AppContextT>({} as any);

export default AppContext;

export const useAppContext = () => useContext(AppContext);

export interface AppContextT {
    Automator: Automator;
    options: Options;
    updateOptions: (diff: Partial<Options>) => void;
    lastState: Automator['lastState'];
    uiConfig: {
        panels: string[];
    };
    updateUiConfig: (diff: Partial<AppContextT['uiConfig']>) => void;
}

export const AppContextProvider: React.FC<{ onChangeEvent: ContextConnector }> = ({ children, onChangeEvent }) => {
    const [options, setOptions] = useState(globalOptions);
    const [lastState, setLastState] = useState(global.Automator.lastState);
    const [uiConfig, setUiConfig] = useState<AppContextT['uiConfig']>();

    useEffect(() => {
        try {
            setUiConfig(JSON.parse(localStorage[options.localStorage.uiConfig]));
        } catch (ex) {
            setUiConfig({
                panels: [],
            });
        }
    }, []);

    if (!uiConfig) return null;

    const updateUiConfig = (diff: Partial<AppContextT['uiConfig']>) => {
        setUiConfig({ ...uiConfig, ...diff });
    }

    const updateOptions = (diff: Partial<Options>) => {
        global.Automator?.changeOptions(diff);
    }

    useEffect(() => {
        localStorage[options.localStorage.uiConfig] = JSON.stringify(uiConfig);
    }, [uiConfig]);

    // connect Automator with React
    useEffect(() => {
        onChangeEvent(changes => {
            if (changes.includes('options')) setOptions({ ...globalOptions })
            if (changes.includes('lastState')) setLastState({ ...global.Automator.lastState });
        });
    }, [onChangeEvent]);

    return <AppContext.Provider value={{
        options,
        lastState,
        updateOptions,
        uiConfig,
        updateUiConfig,
        Automator: global.Automator,
    }}>
        {children}
    </AppContext.Provider>;
}
