import styles from './DashboardHeader.module.scss';

interface IDashboardHeader {
  title: string;
  children?: React.ReactNode;
}

const DashboardHeader = ({title, children} : IDashboardHeader) => {
  return (
    <div className={styles.header}>
      <h2>{title}</h2>

      {children && (
        <div className={styles['header-buttons']}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
