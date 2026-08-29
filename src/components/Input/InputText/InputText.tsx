import InputWrapper from '../InputWrapper/InputWrapper';

interface IInputText extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
  value: string;
  setValue: (value: string) => void;
  label?: string;
  placeholder?: string;
  fieldWrapperClass?: string;
  wrapperClass?: string;
  isDisabled?: boolean;
}

const InputText = ({ref, value, setValue, label, placeholder, fieldWrapperClass, wrapperClass, isDisabled, onFocus, onBlur, ...rest}: IInputText) => {

  return (
    <InputWrapper
      label={label}
      fieldWrapperClass={fieldWrapperClass}
      wrapperClass={wrapperClass}
    >
        <input
          ref={ref} 
          placeholder={placeholder ? placeholder : ""}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          onFocus={(e) => {
            if(onFocus) {
              onFocus(e);
            }
          }}
          onBlur={(e) => {
            if(onBlur) {
              onBlur(e);
            }
          }}
          disabled={!!isDisabled}
          {...rest}
        />
    </InputWrapper>
  )
};

export default InputText;