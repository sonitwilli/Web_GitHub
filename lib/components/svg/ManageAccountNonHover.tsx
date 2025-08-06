import { ReactSVG } from 'react-svg';
import styles from './ManageAccountNonHover.module.css';

export default function ManageAccountNonHover() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG src="/images/svg/manage_account.svg" className="w-6 h-6" />
    </div>
  );
}
