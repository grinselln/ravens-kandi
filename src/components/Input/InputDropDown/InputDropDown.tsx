import { ReactNode, useMemo } from 'react';
import InputWrapper from '../InputWrapper/InputWrapper';
import styles from './InputDropDown.module.scss';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDropDown } from '@/hooks/useDropDown';
import DropDownList from '../DropDownList/DropDownList';
import { IDropDownOption } from '@/interfaces/IRecords';

interface IInputDropDown<T> {
  label?: string | ReactNode;
  placeholder: string;
  value: number | string | null | undefined;
  setValue: (value: IDropDownOption<T>) => void;
  options: IDropDownOption<T>[];
  isDisabled: boolean;
  isSmall?: boolean;
  isMedium?: boolean;
  isInverse?: boolean;
  isInverseLight?: boolean;
  allowRemoval?: boolean;
}

const InputDropDown = <T,>({label, placeholder, value, setValue, options, isDisabled, isSmall, isMedium, isInverse, isInverseLight, allowRemoval}: IInputDropDown<T>) => {
  const {isOpen, triggerRef, wrapperRef, activeIndex, setActiveIndex, handleTriggerClick, handleKeyDown} = useDropDown({options, value, setValue});

  const displayLabel = useMemo(() => {  
    const selectedOption = options.find(option => option.value === value);
    
    return selectedOption?.label ?? placeholder; 
  }, [value, options, placeholder]);

  return (
    <InputWrapper
      label={label}
      wrapperClass='faux-input'
      isSmall={isSmall}
      isMedium={isMedium}
    >
      <div className={`${styles.dropdown}${isSmall ? ` ${styles.small}` : ""}${isMedium ? ` ${styles.medium}` : ""}${isInverse ? ` ${styles.inverse}` : ""}${isInverseLight ? ` ${styles['inverse-light']}` : ""}`} ref={wrapperRef}>
        <button
          ref={triggerRef}
          type="button"
          className={isOpen ? styles.open : ""}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-activedescendant={isOpen && activeIndex >= 0 ? `listboxOption_${options[activeIndex]?.value}` : undefined}
          disabled={options.length === 0 || isDisabled}
          onClick={(e) => handleTriggerClick(e)}
          onKeyDown={(e) => handleKeyDown(e)}
        >
          {displayLabel}
          <FontAwesomeIcon icon={faChevronDown} />
        </button>
        <DropDownList
          isSmall={isSmall}
          isInverse={isInverse}
          isInverseLight={isInverseLight}
          isMedium={isMedium}
          isOpen={isOpen}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          value={value}
          options={options}
          handleTriggerClick={handleTriggerClick}
          setValue={setValue}
          triggerRef={triggerRef}
          allowRemoval={allowRemoval}
          placeholder={placeholder}
        />
      </div>
    </InputWrapper>
  )
};

export default InputDropDown;