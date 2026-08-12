import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './AddBulkModal.module.scss';
import { faLink, faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import Modal from '@/components/Modal/Modal';
import Button from '@/components/Input/Button/Button';
import InputText from '@/components/Input/InputText/InputText';
import ActionButton from '@/components/Admin/Rows/ActionElements/ActionButton/ActionButton';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';

interface IAddBulkModal {
  showModal: boolean;
  setShowModal: Function;
  records?: any;
  recordType: string;
  recordTypePlural?: string;
  dropdownData?: any;
  onSave: Function;
}

const AddBulkModal = ({ records, recordType, recordTypePlural, dropdownData, showModal, setShowModal, onSave } : IAddBulkModal) => {
  const blankRecord = {
    title: "",
    value: null
  }

  const [addedRecords, setAddedRecords] = useState<Array<any>>([]);
  const [newAddedRecord, setNewAddedRecord] = useState<any>(blankRecord);

  const resetStates = () => {
    setShowModal(false);
    setAddedRecords([]);
    setNewAddedRecord(blankRecord);
  }

  return (
    <Modal
      additionalClass={['add-records']}
      visibility={showModal}
      setVisibility={() => resetStates()}
      title={`Add ${recordTypePlural}`}
      modalButtons={
        <>
          <Button additionalClass="outline-muted" onClick={() => resetStates()} isDisabled={false}>Cancel</Button>
          <Button onClick={() => {
            onSave(addedRecords);
            resetStates();
          }} isDisabled={addedRecords.length === 0}>Save {recordTypePlural}</Button>
        </>
      }
    >
      <div className={styles['add-record-wrapper']}>
        {addedRecords.map((addedRecord) => {

          return (
            <div className={styles['add-record']} key={`addedRecord_${addedRecord.title}`}>
              <div className={styles['field-wrapper']}>
                <InputText
                  wrapperClass='bulk-record-input'
                  label='Name'
                  value={addedRecord.title}
                  setValue={() => null }
                  isDisabled={true}
                />
                {dropdownData && (
                  <InputDropDown
                    placeholder='Assign to Category'
                    value={addedRecord?.value}
                    setValue={() => null}
                    options={dropdownData}
                    isDisabled={true}
                  />
                )}
              </div>
              <div className={styles.action}>
                <ActionButton variant={"alert"} icon={faTrashCan} isDisabled={false} onAction={() => {
                  setAddedRecords(prevItems => prevItems.filter(item => item.title !== addedRecord.title));
                }} />
              </div>
            </div>
          )
        })}
        <div className={styles['add-record']}>
          <div className={styles['field-wrapper']}>
            <InputText
              wrapperClass='bulk-record-input'
              label='Title'
              value={newAddedRecord?.title}
              placeholder={`${recordTypePlural} title`}
              setValue={(newValue) => {
                setNewAddedRecord((prev: any) => ({...prev, title: newValue})) 
              }}
            />
            {dropdownData && (
              <InputDropDown
                placeholder='Category'
                label='Assign category'
                value={newAddedRecord?.value}
                setValue={(newValues) => setNewAddedRecord((prev: any) => ({...prev, value: newValues.value}))}
                options={dropdownData}
                isDisabled={false}
              />
            )}
          </div>
          
          <div className={styles.action}>
            <ActionButton variant={"default"} icon={faPlus} 
            isDisabled={newAddedRecord.title === "" 
              || addedRecords.find((record: any) => record.title === newAddedRecord.title) 
              || (dropdownData && newAddedRecord.value === null)} 
            onAction={() => {
              setAddedRecords((prev) => [...prev, newAddedRecord]);
              setNewAddedRecord(blankRecord);
            }} />
          </div>
        </div>
      </div>
    </Modal> 
  );
};

export default AddBulkModal;
