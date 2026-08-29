import Modal from '@/components/Modal/Modal';
import styles from './AddCategoryModal.module.scss';
import Button from '@/components/Input/Button/Button';
import InputText from '@/components/Input/InputText/InputText';
import InputMultiSelect from '@/components/Input/InputMultiSelect/InputMultiSelect';
import { useMemo, useState } from 'react';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import { IAddCategory, ICategoryQueryOption } from '@/interfaces/ICategories';
import { ISubcategory } from '@/interfaces/ISubcategories';
import { IDropDownOption } from '@/interfaces/IRecords';

interface IAddCategoryModal {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  triggerSubcategories: Array<ICategoryQueryOption>;
  subcategories: Array<ISubcategory>;
  onSave: (newCategory: IAddCategory) => void;
}

const AddCategoryModal = ({ isOpen, setIsOpen, triggerSubcategories, subcategories, onSave }: IAddCategoryModal) => {
  const [categoryName, setCategoryName] = useState<string>("");
  const [selectedSubcategories, setSelectedSubcategories] = useState<Array<IDropDownOption<number>>>([]);
  const [selectedTriggerSubcategory, setSelectedTriggerSubcategory] = useState<IDropDownOption<number> | null>(null);

  const { availableAssignSubcategories, availableTriggerSubcategories } = useMemo(() => {
    const selectedIds = selectedSubcategories.map((subcategory: IDropDownOption<number>) => subcategory.value);

    const availableAssignSubcategories: Array<IDropDownOption<number>> = (subcategories ?? []).filter((subcategory: ISubcategory) => subcategory.category_id === 1 && !selectedIds.includes(subcategory.id))
    .map((subcategory: ISubcategory) => ({label: subcategory.title, value: subcategory.id}));

    const availableTriggerSubcategories: Array<IDropDownOption<number>> = triggerSubcategories.filter((subcategory: ICategoryQueryOption) => subcategory.category_id !== 1 && subcategory.trigger_details === undefined)
    .map((subcategory: ICategoryQueryOption) => ({label: subcategory.label, value: subcategory.id}))
    
    return {
      availableAssignSubcategories,
      availableTriggerSubcategories
    }
  }, [subcategories, selectedSubcategories, triggerSubcategories]);

  const formattedRecord: IAddCategory = useMemo(() => {
    const subcategoryIds = selectedSubcategories.filter((subcategory: IDropDownOption<number>) => subcategory.value > -1).map((subcategory: IDropDownOption<number>) => subcategory.value);
    const newSubcategoryTitles = selectedSubcategories.filter((subcategory: IDropDownOption<number>) => subcategory.value < 0).map((subcategory: IDropDownOption<number>) => subcategory.label);

    return {
      title: categoryName,
      subcategories: subcategoryIds,
      newSubcategoryTitles,
      trigger_subcategory_id: selectedTriggerSubcategory?.value ?? null
    }
  }, [selectedSubcategories, selectedTriggerSubcategory, categoryName])

  return (
    <Modal
        additionalClass={['add-category']}
        visibility={isOpen}
        setVisibility={() => {
          setIsOpen(false);
          setCategoryName(""); 
          setSelectedSubcategories([]);
          setSelectedTriggerSubcategory(null);
        }}
        title="Add Category"
        modalButtons={
          <>
            <Button additionalClass="outline-muted" onClick={() => {setIsOpen(false); setCategoryName(""); setSelectedSubcategories([]); setSelectedTriggerSubcategory(null)}} isDisabled={false}>Cancel</Button>
            <Button onClick={() => {
              onSave(formattedRecord);
              setIsOpen(false); setCategoryName(""); setSelectedSubcategories([]); setSelectedTriggerSubcategory(null)
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
              setSelectedSubcategories((prev: Array<IDropDownOption<number>>) => {
                if(selectedOption === null) return prev;
                
                return [...prev, selectedOption]
              })
            }}
            removeSelection={(selectedOptionValue) => setSelectedSubcategories((prevItems: Array<IDropDownOption<number>>) => prevItems.filter((prevItem: IDropDownOption<number>) => prevItem.value !== selectedOptionValue))}
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