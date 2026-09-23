import { useState } from 'react';
import InputWrapper from '../InputWrapper/InputWrapper';

interface IInputNumeric extends React.InputHTMLAttributes<HTMLInputElement> {
  ref?: React.Ref<HTMLInputElement>;
  value: number;
  setValue: (value: number) => void;
  label?: string;
  placeholder?: string;
  fieldWrapperClass?: string[];
  wrapperClass?: string[];
  isDisabled?: boolean;
}

const InputNumeric = ({ref, value, setValue, label, placeholder, fieldWrapperClass, wrapperClass, isDisabled, onFocus, onBlur, ...rest}: IInputNumeric) => {
  const [text, setText] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== Number(text)) {
      setText(String(value));
    }
  }

  return (
    <InputWrapper
      label={label}
      fieldWrapperClass={fieldWrapperClass}
      wrapperClass={wrapperClass}
    >
        <input
          ref={ref} 
          placeholder={placeholder ? placeholder : ""}
          value={text}
          type="number"
          onChange={(e) => {
            const raw = e.target.value.replace(/^(-?)0+(?=\d)/, "$1");

            setText(raw);

            const num = raw === "" ? 0 : Number(raw);
            if (!Number.isNaN(num)) {
              setValue(num);
            }
          }}
          onFocus={(e) => {
            if(onFocus) {
              onFocus(e);
            }
          }}
          onBlur={(e) => {
            const normalized = text === "" ? 0 : Number(text);
            setText(String(normalized));
            setValue(normalized);

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

export default InputNumeric;