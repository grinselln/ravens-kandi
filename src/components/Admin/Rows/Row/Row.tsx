import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Row.module.scss';
import { faChevronRight, faGrip } from '@fortawesome/free-solid-svg-icons';
import ActionButton from '../ActionElements/ActionButton/ActionButton';

interface IRow {
  additionalClass?: string;
  title: React.ReactNode;
  order: number | null;
  isOrderingDisabled: boolean;
  isOrderingHidden?: boolean;
  isInverse?: boolean;
  isAccordion?: boolean;
  isOpen?: boolean;
  isNew?: boolean;
  accordionToggle?: () => void;
  actionElements: React.ReactNode;
  isEditing?: boolean;
  isSimple?: boolean;
  dragHandleRef?: (element: Element | null) => void;
}



const Row = ({ additionalClass, title, order, isInverse, isAccordion, isNew, isOrderingDisabled, isOrderingHidden, isOpen, accordionToggle, actionElements, isEditing, isSimple, dragHandleRef} : IRow) => {
  return (
    <div 
      className={`${styles['item-row']}${additionalClass ? ` ${styles[additionalClass]}` : ""}${isInverse ? ` ${styles['inverse']}` : ""}${isAccordion ? ` ${styles['accordion-header']}` : ""}${isAccordion ? ` ${styles.simple}` : ""}${isOpen ? ` ${styles['open']}` : ""}`}
      onClick={() => {
        if(!accordionToggle || !isSimple) return null;

        accordionToggle();
      }}  
    >
      <div className={styles['row-left']} onClick={ () => {
        if(!accordionToggle || isEditing === true) return null;

        accordionToggle();
      }}>
        {((!isOrderingHidden || isAccordion || (order !== null && order !== -1)) && !isSimple) && (
          <div className={styles.icons}>
            {!isOrderingHidden && (
              <ActionButton ref={dragHandleRef} additionalClass={[isNew ? "new-grip" : "grip"]} variant='default' icon={faGrip} 
              isDisabled={isOrderingDisabled} onAction={() => {}}
              />
            )}

            {isAccordion && (
              <FontAwesomeIcon icon={faChevronRight} className={`${styles['accordion-indicator']}${isOpen ? ` ${styles['open']}` : ""}`} />
            )}

            {(order !== null && order !== -1) && (
              <span className={styles.count}>{order + 1}</span>
            )}
          </div>
        )}
        <div className={styles.title}>
          {title}      
        </div>
      </div>
      <div className={styles['row-right']}>
        {isSimple ? (
          <FontAwesomeIcon icon={faChevronRight} className={`${styles['accordion-indicator']}${isOpen ? ` ${styles['open']}` : ""}`} />
        ) : (
          actionElements
        )}
      </div>
    </div>
  );
};

export default Row;
