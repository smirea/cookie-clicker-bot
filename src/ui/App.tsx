import styles from './styles.styl';

import BuyStats from './components/BuildingStats';
import Status from './components/Status';
import { useEffect, useState } from 'react';
import { useAppContext } from './AppContext';
import Poll from './components/Poll';

export default function App() {
    const { Automator, uiConfig: { panels }, updateUiConfig } = useAppContext();

    return <div className={styles.root}>
        <div className={styles.nav}>
            <Status />
            {PANELS.map(({ id, title }) => {
                const isOpen = panels.includes(id);

                return <div
                    key={id}
                    data-open={String(isOpen)}
                    className={styles.navItem}
                    onClick={() =>
                        updateUiConfig({
                            panels: isOpen
                                ? panels.filter(x => x !== id)
                                : [...panels, id]
                        })
                    }
                >
                    {title}
                </div>
            })}
            <Poll
                time={500}
                render={() => {
                    const buffs = Automator.getBuffs();
                    return <>
                        <div>|</div>
                        <div>cps: {Math.round(buffs.cpsMultiple * 10) / 10}x</div>
                        <div>click: {Math.round(buffs.multClick * buffs.devastationMultiple * 10) / 10}x</div>
                    </>
                }}
            />
        </div>

        {PANELS.map(({ id, title, render }) =>
            panels.includes(id) &&
                <div className={styles.collapsible}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.content}>{render()}</div>
                </div>
        )}
    </div>;
}

const PANELS: Array<{ id: string, title: string; render: () => any }> = [
    {
        id: 'buildings',
        title: 'Buildings',
        render: () => <BuyStats />,
    },
];

const Collapsible: React.FC<{
    title: string;
    expanded?: boolean;
    render: () => any;
}> = ({ title, expanded = true, render }) => {
    const [show, setShow] = useState(expanded);
    useEffect(() => { setShow(expanded); }, [expanded]);

    return <div className={styles.collapsible}>
        <div className={styles.title} onClick={() => setShow(!show)}>{show ? '▾' : '▸'} {title}</div>
        {show && <div className={styles.content}>{render()}</div>}
    </div>
}
