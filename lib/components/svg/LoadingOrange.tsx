import { ReactSVG } from 'react-svg';
import styles from './LoadingOrange.module.css';

export default function LoadingOrangeSvg() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG src="/images/svg/loading_orange.svg" />
    </div>
  );
}
