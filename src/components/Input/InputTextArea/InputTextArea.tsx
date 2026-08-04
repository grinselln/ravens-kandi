import InputWrapper from '../InputWrapper/InputWrapper';
import styles from './InputTextArea.module.scss';

interface IInputTextArea extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: any;
  setValue: (value: string) => void;
  label?: string;
  placeholder?: string;
  fieldWrapperClass?: string;
}

const InputTextArea = ({value, setValue, label, placeholder, fieldWrapperClass, ...rest}: IInputTextArea) => {

  return (
    <InputWrapper
      label={label}
      fieldWrapperClass={fieldWrapperClass}
    >
      <textarea
        className={styles.textarea}
        placeholder={placeholder ? placeholder : ""}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        {...rest}
      />
    </InputWrapper>
  )
};

export default InputTextArea;