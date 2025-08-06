import { ReactSVG } from 'react-svg';
import styles from './DownloadAppSvg.module.css';

export default function DownloadAppSvg() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG
        src="/images/svg/install_mobile.svg"
        className="fill-white hover:fill-red-400"
      />
    </div>
  );
}
