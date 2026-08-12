import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Modal.module.scss';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from 'react';
import clsx from 'clsx';

interface IModal {
  visibility: boolean;
  setVisibility?: (value: boolean) => void;
  additionalClass?: string[];
  title: string;
  children: React.ReactNode;
  modalButtons: React.ReactNode; 
}

const Modal = ({ visibility, setVisibility, additionalClass, title, children, modalButtons } : IModal) => {

  useEffect(() => {
    if (!visibility) return;

    window.dispatchEvent(new Event("modal:open"));

    return () => {
      window.dispatchEvent(new Event("modal:close"));
    };
  }, [visibility]);

  return (
    <>
      <div 
        className={clsx(
          styles.modal,
          visibility ? styles.open : "",
          ...(additionalClass ?? []).map((cls: string) => styles[cls])
        )}>
        <div className={styles.header}>
          <h3>{title}</h3>
          {!!setVisibility && (
            <button className={styles.close} onClick={() => setVisibility(false)}>
              <FontAwesomeIcon icon={faClose} />
            </button>
          )}
          
        </div>
        <div className={styles['body-wrapper']}>
          <div className={styles.body}>
            {children}
          </div>
        </div>
        {!!modalButtons && (
          <div className={styles.footer}>
            {modalButtons}
          </div>
        )}
      </div>
      <div className={`${styles.overlay}${visibility ? ` ${styles.open}` : ""}`}></div>
    </>
  );
};

export default Modal;
