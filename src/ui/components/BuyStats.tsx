import { formatAmount } from 'src/utils';
import { useAppContext } from '../AppContext';
import styles from '../styles.styl'

export default function BuyStats() {
    const { lastState: { buildings } } = useAppContext();

    return <div>
        <table cellPadding={0} cellSpacing={0}>
            <thead>
                <tr>
                    <th>Building</th>
                    <th>Relative Price</th>
                    <th>Cost</th>
                </tr>
            </thead>
            <tbody>
                {buildings.map(({ name, relativeValue, price }) =>
                    <tr key={name}>
                        <td>{name}</td>
                        <td className={styles.numeric}>{relativeValue}x</td>
                        <td className={styles.numeric}>{formatAmount(price, { cookies: false })}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
}
