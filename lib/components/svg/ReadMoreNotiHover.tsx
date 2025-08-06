import { ReactSVG } from 'react-svg';
import styles from './ReadMoreNoti.module.css';

export default function ReadMoreNotiHover() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG
        src="/images/svg/read_more_noti_hover.svg"
        className="text-fpl"
      />
    </div>
  );
}
