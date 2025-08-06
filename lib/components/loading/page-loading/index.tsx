import styles from './loading.module.css';

export default function PageLoading() {
  return (
    <div
      className={`z-[9999] fixed top-0 left-0 h-[3px] rounded bg-fpl ${styles.progress}`}
    />
  );
}
