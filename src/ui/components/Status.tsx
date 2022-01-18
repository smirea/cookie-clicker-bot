import { STATUSES } from 'src/typeDefs';
import { useAppContext } from '../AppContext';
import styles from '../styles.styl';

export default function Status() {
    const { options, updateOptions } = useAppContext();

    const onClick = () => {
        const index = STATUSES.findIndex(x => x === options.status);
        const next = STATUSES[(index + 1) % STATUSES.length];
        updateOptions({ status: next });
    }

    return <div onClick={onClick} className={`${styles.statusRoot} ${styles.navItem}`}>
        <span className={styles.statusIcon} data-status={options.status} />
        <span className={styles.statusText}>{options.status}</span>
    </div>
}
