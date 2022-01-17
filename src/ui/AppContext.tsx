import React, { createContext, useContext, useEffect, useState } from 'react';
import type Automator from 'src/Automator';
import globalOptions from 'src/options';
import { ContextConnector, Options } from 'src/typeDefs';
import { global } from 'src/utils';

const AppContext = createContext<{
    options: Options;
    updateOptions: (diff: Partial<Options>) => void;
    lastState: Automator['lastState'];
}>({} as any);

export default AppContext;

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider: React.FC<{ onChangeEvent: ContextConnector }> = ({ children, onChangeEvent }) => {
    const [options, setOptions] = useState(globalOptions);
    const [lastState, setLastState] = useState(global.Automator.lastState);

    const updateOptions = (diff: Partial<Options>) => {
        global.Automator?.changeOptions(diff);
    }

    // connect Automator with React
    useEffect(() => {
        onChangeEvent(changes => {
            if (changes.includes('options')) setOptions({ ...globalOptions })
            if (changes.includes('lastState')) setLastState({ ...global.Automator.lastState });
        });
    }, [onChangeEvent]);

    return <AppContext.Provider value={{ options, lastState, updateOptions }}>
        {children}
    </AppContext.Provider>;
}
