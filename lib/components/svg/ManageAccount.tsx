import { ReactSVG } from 'react-svg';
import styles from './ManageAccount.module.css';

export default function ManageAccount() {
  return (
    <div className={styles.svgContainer}>
      <ReactSVG src="/images/svg/manage_account.svg" />
    </div>
  );
}
