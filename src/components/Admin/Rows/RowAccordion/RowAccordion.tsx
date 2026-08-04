import { useState } from 'react';
import styles from './RowAccordion.module.scss';

interface IRowAccordion {
  header: (isOpen: boolean, onToggle: () => void, isInverse: boolean | undefined) => React.ReactNode;
  isOpenDefault?: boolean;
  children: React.ReactNode;
  isInverse?: boolean;
}

const RowAccordion = ({header, children, isInverse, isOpenDefault} : IRowAccordion) => {
  const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(!!isOpenDefault);
  
  return (
    <div className={`${styles.accordion}${isAccordionOpen ? ` ${styles.open}` : ""}${isInverse ? ` ${styles.inverse}` : ""}`}>
      {header(isAccordionOpen, () => setIsAccordionOpen(!isAccordionOpen), isInverse)}

      <div className={styles['body-wrapper']}>
        <div className={styles.body}>
          <div className={styles['body-content']}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RowAccordion;
