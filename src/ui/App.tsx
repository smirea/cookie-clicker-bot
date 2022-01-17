import { useContext } from 'react';
import { STATUSES } from 'src/typeDefs';
import AppContext from './AppContext';
import styles from './styles.styl';

export default function App() {
    const { options, updateOptions } = useContext(AppContext);

    const onClick = () => {
        const index = STATUSES.findIndex(x => x === options.status);
        const next = STATUSES[(index + 1) % STATUSES.length];
        updateOptions({ status: next });
    }

    return <div className={styles.root} onClick={onClick}>
        <span>Automator: </span>
        <span className={styles.statusText}>{options.status}</span>
        <span className={styles.statusIcon} data-status={options.status} />
    </div>;
}
