import { useMemo, useState } from 'react';
import InputWrapper from '../InputWrapper/InputWrapper';
import styles from './InputMultiSelect.module.scss';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDropDown } from '@/hooks/useDropDown';
import DropDownList from '../DropDownList/DropDownList';
import InputText from '../InputText/InputText';
import { IDropDownOption } from '@/interfaces/IRecords';

interface IInputMultiSelect {
  label: string;
  placeholder: string;
  addSelection: (value: IDropDownOption<number> | null) => void;
  removeSelection: (value: number) => void;
  options: IDropDownOption<number>[];
  selectedOptions: IDropDownOption<number>[];
}

const InputMultiSelect = ({label, placeholder, addSelection, removeSelection, options, selectedOptions}: IInputMultiSelect) => {
  const [searchText, setSearchText] = useState<string>("");

  const filteredOptions = useMemo(() => {
    return options.filter((option: IDropDownOption<number>) => {
      if(searchText === "") return option;

      const optionLabel = (option.label).toLowerCase();
      const searchQuery = searchText.toLocaleLowerCase();

      return optionLabel.includes(searchQuery);
    })
  }, [searchText, options]);

  const {isOpen, inputRef, wrapperRef, activeIndex, setActiveIndex, handleTriggerClick, onInputFocus} = useDropDown({options: filteredOptions, value: null, setValue: addSelection});

  return (
    <InputWrapper
      label={label}
    >
      {selectedOptions.length > 0 && (
        <div className={styles['selected-options-wrapper']}>
          {selectedOptions.map((option) => (
            <button key={`tag_${option.value}`} className={styles['selected-option']} onClick={() => removeSelection(option.value)}>
              <span>{option.label}</span>
              <FontAwesomeIcon icon={faClose} />
            </button>
          ))}
        </div>
      )}
      <div className={`${styles['multi-select']}`} ref={wrapperRef}>
        <div className={`${styles['multi-field-wrapper']}${isOpen ? ` ${styles.open}` : ""}`}>
          <InputText
            ref={inputRef}
            placeholder={placeholder}
            value={searchText}
            setValue={(newValue) => setSearchText(newValue)}
            onFocus={() => onInputFocus()}
          />
        </div>
        <DropDownList
          isOpen={isOpen}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          value={null}
          options={filteredOptions}
          handleTriggerClick={handleTriggerClick}
          setValue={addSelection}
          triggerRef={inputRef}
          onAddNew={(newItem: IDropDownOption<number>) => {
            setSearchText("");
            addSelection(newItem)
          }}
          searchText={searchText}
        />
      </div>
    </InputWrapper>
  )
};

export default InputMultiSelect;