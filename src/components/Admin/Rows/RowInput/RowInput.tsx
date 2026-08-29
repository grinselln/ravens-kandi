import InputText from '@/components/Input/InputText/InputText';

interface IRowInput {
  value: string;
  setValue: (value: string) => void;
  isNew: boolean;
  inputItemLabel: string;
  isDisabled: boolean;
}

const RowInput = ({ value, setValue, isNew, inputItemLabel, isDisabled } : IRowInput) => {
  return (
    <InputText
      fieldWrapperClass='row-input-wrapper'
      wrapperClass='row-input'
      placeholder={`${isNew ? "New" : "Edit"} ${inputItemLabel}`}
      value={value}
      setValue={(newValue) => setValue(newValue)}
      isDisabled={isDisabled}
    />
  );
};

export default RowInput;
