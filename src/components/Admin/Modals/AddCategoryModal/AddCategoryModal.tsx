import Modal from '@/components/Modal/Modal';
import styles from './AddCategoryModal.module.scss';
import Button from '@/components/Input/Button/Button';
import InputText from '@/components/Input/InputText/InputText';
import InputMultiSelect from '@/components/Input/InputMultiSelect/InputMultiSelect';
import { useMemo, useState } from 'react';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';

interface IAddCategoryModal {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  triggerSubcategories: any;
  subcategories: any;
  onSave: Function;
}

const AddCategoryModal = ({ isOpen, setIsOpen, triggerSubcategories, subcategories, onSave }: IAddCategoryModal) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [selectedSubcategories, setSelectSubcategories] = useState<any>([]);
  const [selectedTriggerSubcategory, setSelectedTriggerSubcategory] = useState<any>(null);

  const { availableAssignSubcategories, availableTriggerSubcategories } = useMemo(() => {
    const selectedIds = selectedSubcategories.map((subcategory: any) => subcategory.value);

    const availableAssignSubcategories = (subcategories ?? []).filter((subcategory: any) => subcategory.category_id === 1 && !selectedIds.includes(subcategory.id))
    .map((subcategory: any) => ({label: subcategory.title, value: subcategory.id}));

    const availableTriggerSubcategories = triggerSubcategories.filter((subcategory: any) => subcategory.category_id !== 1 && subcategory.trigger_details === undefined)
    .map((subcategory: any) => ({label: subcategory.label, value: subcategory.id}))
    
    return {
      availableAssignSubcategories,
      availableTriggerSubcategories
    }
  }, [subcategories, selectedSubcategories]);

  const formattedRecord = useMemo(() => {
    const subcategoryIds = selectedSubcategories.filter((subcategory: any) => subcategory.value > -1).map((subcategory: any) => subcategory.value);
    const newSubcategoryTitles = selectedSubcategories.filter((subcategory: any) => subcategory.value < 0).map((subcategory: any) => subcategory.label);

    return {
      title: categoryName,
      subcategoryIds,
      newSubcategoryTitles,
      triggerSubcategoryId: selectedTriggerSubcategory?.value ?? null
    }
  }, [selectedSubcategories, selectedTriggerSubcategory])

  return (
    <Modal
        additionalClass={['add-category']}
        visibility={isOpen}
        setVisibility={() => {
          setIsOpen(false);
          setCategoryName(""); 
          setSelectSubcategories([]);
          setSelectedTriggerSubcategory(null);
        }}
        title="Add Category"
        modalButtons={
          <>
            <Button additionalClass="outline-muted" onClick={() => {setIsOpen(false); setCategoryName(""); setSelectSubcategories([]); setSelectedTriggerSubcategory(null)}} isDisabled={false}>Cancel</Button>
            <Button onClick={() => {
              onSave(formattedRecord);
              setIsOpen(false); setCategoryName(""); setSelectSubcategories([]); setSelectedTriggerSubcategory(null)
             } } isDisabled={categoryName === ""}>Save Category</Button>
          </>
        }
      >
        <div className={styles['new-category-wrapper']}>
          <InputText
            label="Name"
            placeholder='e.g. Parks'
            value={categoryName}
            setValue={(newValue) => setCategoryName(newValue)}
          />
          <InputMultiSelect
            label='Assign subcategories'
            placeholder='Search or create subcategory'
            addSelection={(selectedOption) => {
              setSelectSubcategories((prev: any) => [...prev, selectedOption])
            }}
            removeSelection={(selectedOptionValue) => setSelectSubcategories((prevItems: any) => prevItems.filter((prevItem: any) => prevItem.value !== selectedOptionValue))}
            options={availableAssignSubcategories}
            selectedOptions={selectedSubcategories}
          />
          <div className={styles['box-accent']}>
            <InputDropDown
              label={
                <>
                  <FontAwesomeIcon icon={faLink} />
                  <span>Trigger subcategory</span>
                </>
              }
              placeholder='None - always visible'
              value={selectedTriggerSubcategory?.value}
              allowRemoval={true}
              setValue={(newValue) => setSelectedTriggerSubcategory(newValue)}
              options={availableTriggerSubcategories}
              isDisabled={false}
              isInverse={true}
            />
            <p>Assigning this subcategory will reveal/hide this category on subcategory filter selection.</p>
          </div>
        </div>
      </Modal>
  )
};

export default AddCategoryModal;