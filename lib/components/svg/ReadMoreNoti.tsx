import { ReactSVG } from 'react-svg';
import styles from './ReadMoreNoti.module.css';

export default function ReadMoreNoti() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG src="/images/svg/read_more_noti.svg" className="text-fpl" />
    </div>
  );
}
