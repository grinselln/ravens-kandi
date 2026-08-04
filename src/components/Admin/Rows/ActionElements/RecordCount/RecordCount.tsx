import styles from './RecordCount.module.scss';
import { useMemo } from 'react';

interface IRecordCount {
  count: number;
  label: string;
  pluralLabel?: string;
}

const RecordCount = ({ count, label, pluralLabel } : IRecordCount) => {
  const displayLabel = useMemo(() => {
    const isPlural = count !== 1;

    return isPlural ? (pluralLabel ?? `${label}s`) : label;

  }, [count, label, pluralLabel]);

  return (
    <span className={styles['record-count']}>{count} {displayLabel}</span>
  );
};

export default RecordCount;
