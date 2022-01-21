import { Building } from 'src/typeDefs';
import { formatAmount, Game } from 'src/utils';
import { useAppContext } from '../AppContext';
import styles from '../styles.styl'

export default function BuildingStats() {
    const { lastState: { buildings } } = useAppContext();

    return <div>
        <table cellPadding={0} cellSpacing={0}>
            <thead>
                <tr>
                    <th />
                    <th>Building</th>
                    <th>Score</th>
                    <th>Δ Value</th>
                    <th>Δ Price</th>
                    <th>% CPS</th>
                    {/* <th>Cookies</th> */}
                </tr>
            </thead>
            <tbody>
                {buildings.map(({ name, relativeValue, relativePrice, opportunityCost, price, cps, building }) =>
                    <tr key={name}>
                        <td><BuildingIcon building={building} /></td>
                        <td>{name}</td>
                        <td className={styles.numeric}>{numberFormat(opportunityCost)}</td>
                        <td className={styles.numeric}>{numberFormat(relativeValue)}x</td>
                        <td className={styles.numeric}>{numberFormat(relativePrice)}x</td>
                        <td className={styles.numeric}>{numberFormat(cps / Game.cookiesPs * 100)}</td>
                        {/* <td className={styles.numeric}>{formatAmount(price, { cookies: false })}</td> */}
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
    />;

const numberFormat = (num: number): string => {
    let precision = num >= 100 ? 0 : num >= 10 ? 1 : 2;
    num = Math.round(num * 100) / 100;
    return String(num.toFixed(precision)).replace(/\.(\d+)/, (_, d) => '.' + d.slice(0, precision));
}
