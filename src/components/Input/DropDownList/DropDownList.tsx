import { IDropDownOption } from '@/interfaces/IRecords';
import styles from './DropDownList.module.scss';
import clsx from 'clsx';

interface IDropDownList<T> {
  isSmall?: boolean;
  isInverse?: boolean;
  isOpen: boolean;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  value: number | string | null | undefined;
  options: IDropDownOption<T>[];
  handleTriggerClick: (e: React.MouseEvent) => void;
  setValue: (value: IDropDownOption<T> | null) => void;
  triggerRef: React.RefObject<HTMLButtonElement | HTMLInputElement | null>;
  onAddNew?: (newItem: IDropDownOption<number>) => void;
  searchText?: string;
  allowRemoval?: boolean;
  placeholder?: string;
  isInverseLight?: boolean;
  isMedium?: boolean;
}

const DropDownList = <T,>({ isSmall, isMedium, isInverse, isInverseLight, isOpen, activeIndex, setActiveIndex, value, options, handleTriggerClick, setValue, triggerRef, onAddNew, searchText, allowRemoval, placeholder }: IDropDownList<T>) => {
  

  return (
    isOpen && (
      <ul role="listbox" className={`${styles['dropdown-list']}${isSmall ? ` ${styles.small}` : ""}
      ${isMedium ? ` ${styles.medium}` : ""}${isInverse ? ` ${styles.inverse}` : ""}${isInverseLight ? ` ${styles['inverse-light']}` : ""}`} onMouseLeave={() => setActiveIndex(-1)}>
        {allowRemoval && (
          <li
            id={`listboxOption_null`}
            role="option"
            className={(value === null || value === undefined)
              ? styles.selected
              : activeIndex === 0
              ? styles.active
              : ""}
            onClick={(e) => {
              handleTriggerClick(e);
              setValue(null);
              triggerRef.current?.focus();
            }}
            onMouseEnter={() => {
              setActiveIndex(0)
            }}
          >
            {placeholder}
          </li>
        )}
        {options.map((option, idx: number) => {
          const index = allowRemoval ? idx + 1 : idx;

          return (
          <li
            id={`listboxOption_${option.value}`}
            key={`${option.value}`}
            role="option"
            aria-selected={option.value === value}
            className={option.value === value 
              ? styles.selected
              : activeIndex === index
              ? styles.active
              : ""}
            onClick={(e) => {
              handleTriggerClick(e);
              setValue(option);
              triggerRef.current?.focus();
            }}
            onMouseEnter={() => {
              setActiveIndex(index)
            }}
          >
            {option.label}
          </li>
        )})}
        {options.length === 0 && onAddNew && (
          <li
            id={`listboxOption_-1`}
            role="option"
            className={clsx(
              activeIndex === 0 && styles.active
            )}
            onClick={(e) => {
              handleTriggerClick(e);
              onAddNew({value: (Math.floor(Math.random() * 1000) + 1) * -1, label: searchText ?? ""});
              triggerRef.current?.focus();
            }}
            onMouseEnter={() => {
              setActiveIndex(0)
            }}
          >
            {`Add ${searchText} as a subcategory`}
          </li>
        )}
      </ul>
    )
  )
};

export default DropDownList;