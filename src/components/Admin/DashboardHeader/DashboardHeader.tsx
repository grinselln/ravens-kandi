import clsx from 'clsx';
import styles from './DashboardHeader.module.scss';
import { formatClsxClassString } from '@/helpers/dataManipulation';

interface IDashboardHeader {
  title: string;
  classes?: string[];
  children?: React.ReactNode;
}

const DashboardHeader = ({title, classes, children} : IDashboardHeader) => {
  return (
    <div className={clsx(
      styles.header,
      ...formatClsxClassString(classes, styles)
    )}>
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
