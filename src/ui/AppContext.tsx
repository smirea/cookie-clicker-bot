import React, { createContext, useEffect, useState } from 'react';

import globalOptions from 'src/options';
import { ContextConnector, Options } from 'src/typeDefs';
import { global } from 'src/utils';

const AppContext = createContext<{ options: Options; updateOptions: (diff: Partial<Options>) => void }>({} as any);

export default AppContext;

export const AppContextProvider: React.FC<{ onChangeEvent: ContextConnector }> = ({ children, onChangeEvent }) => {
    const [options, _setOptions] = useState(globalOptions);

    const updateOptions = (diff: Partial<Options>) => {
        global.Automator?.changeOptions(diff);
    }

    // connect Automator with React
    useEffect(() => { onChangeEvent(_setOptions); }, [onChangeEvent]);

    return <AppContext.Provider value={{ options, updateOptions }}>
        { children }
    </AppContext.Provider>;
}
