import InputText from '@/components/Input/InputText/InputText';

interface IRowInput {
  value: string;
  setValue: (value: string) => void;
  isNew: boolean;
  inputItemLabel: string;
  isDisabled: boolean;
  fieldWrapperClasses?: string[];
  wrapperClasses?: string[];
}

const RowInput = ({ value, setValue, isNew, inputItemLabel, isDisabled, fieldWrapperClasses, wrapperClasses } : IRowInput) => {
  return (
    <InputText
      fieldWrapperClass={['row-input-wrapper', ...(fieldWrapperClasses ?? [])]}
      wrapperClass={['row-input', ...(wrapperClasses ?? [])]}
      placeholder={`${isNew ? "New" : "Edit"} ${inputItemLabel}`}
      value={value}
      setValue={(newValue) => setValue(newValue)}
      isDisabled={isDisabled}
    />
  );
};

export default RowInput;
