import { ReactSVG } from 'react-svg';
import styles from './ReadAll.module.css';

export default function ReadAll() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG
        src="/images/svg/read_all.svg"
        className="text-spanish-gray hover:text-fpl"
      />
    </div>
  );
}
