import styles from './styles.styl';

import BuyStats from './components/BuyStats';
import Status from './components/Status';
import { useEffect, useState } from 'react';

export default function App() {
    return <div className={styles.root}>
        <Status />
        <Collapsible
            title='Building Stats'
            render={() => <BuyStats />}
        />
    </div>;
}

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
