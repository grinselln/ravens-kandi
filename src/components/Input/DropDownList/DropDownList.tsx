import styles from './DropDownList.module.scss';

interface IDropDownList {
  isSmall?: boolean;
  isInverse?: boolean;
  isOpen: boolean;
  activeIndex: number;
  setActiveIndex: Function;
  value: any;
  options: any;
  handleTriggerClick: Function;
  setValue: Function;
  triggerRef: any
  onAddNew?: Function;
  searchText?: string;
  allowRemoval?: boolean;
  placeholder?: string;
  isInverseLight?: boolean;
  isMedium?: boolean;
}

const DropDownList = ({ isSmall, isMedium, isInverse, isInverseLight, isOpen, activeIndex, setActiveIndex, value, options, 
  handleTriggerClick, setValue, triggerRef, onAddNew, searchText, allowRemoval, placeholder }: IDropDownList) => {
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
        {options.map((option: any, idx: number) => {
          const index = allowRemoval ? idx + 1 : idx;

          return (
          <li
            id={`listboxOption_${option.value}`}
            key={option.value}
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
            className={activeIndex === 0
              ? styles.active
              : ""}
            onClick={(e) => {
              handleTriggerClick(e);
              onAddNew({value: (Math.floor(Math.random() * 1000) + 1) * -1, label: searchText});
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