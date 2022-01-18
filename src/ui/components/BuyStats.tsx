import { Building } from 'src/typeDefs';
import { formatAmount } from 'src/utils';
import { useAppContext } from '../AppContext';
import styles from '../styles.styl'

export default function BuyStats() {
    const { lastState: { buildings } } = useAppContext();

    return <div>
        <table cellPadding={0} cellSpacing={0}>
            <thead>
                <tr>
                    <th />
                    <th>Building</th>
                    <th>Relative Price</th>
                    <th>Cost</th>
                </tr>
            </thead>
            <tbody>
                {buildings.map(({ name, relativeValue, price, building }) =>
                    <tr key={name}>
                        <td><BuildingIcon building={building} /></td>
                        <td>{name}</td>
                        <td className={styles.numeric}>{relativeValue >= 10 ? Math.round(relativeValue) : relativeValue}x</td>
                        <td className={styles.numeric}>{formatAmount(price, { cookies: false })}</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
}

const BuildingIcon: React.FC<{ building: Building; size?: number }> = ({ building, size = 16 }) =>
    <span
        className={styles.buildingIcon}
        style={{
            backgroundPosition: `0 -${building.icon * 64}px`,
            zoom: size / 64,
        }}
    />
