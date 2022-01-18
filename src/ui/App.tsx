import styles from './styles.styl';

import BuyStats from './components/BuildingStats';
import Status from './components/Status';
import { useEffect, useState } from 'react';

export default function App() {
    const [open, setOpen] = useState<number[]>(PANELS.map((p, i) => i));

    return <div className={styles.root}>
        <div className={styles.nav}>
            <Status />
            {PANELS.map(({ title }, index) =>
                <div
                    key={index}
                    data-open={String(open.includes(index))}
                    className={styles.navItem}
                    onClick={() =>
                        setOpen(
                            open.includes(index)
                                ? open.filter(x => x !== index)
                                : [...open, index]
                        )
                    }
                >{title}</div>
            )}
        </div>

        {PANELS.map(({ title, render }, index) =>
            open.includes(index) &&
                <div className={styles.collapsible}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.content}>{render()}</div>
                </div>
        )}
    </div>;
}

const PANELS: Array<{ title: string; render: () => any }> = [
    {
        title: 'Buildings',
        render: () => <BuyStats />,
    }
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
