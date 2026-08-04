import { ReactNode } from 'react';
import styles from './InputWrapper.module.scss';

interface IInputWrapper {
  label?: string | ReactNode;
  wrapperClass?: string;
  fieldWrapperClass?: string;
  isSmall?: boolean;
  isMedium?: boolean;
  children: React.ReactNode;
}

const InputWrapper = ({fieldWrapperClass, label, wrapperClass, children, isSmall, isMedium}: IInputWrapper) => {
  return (
    <div className={`${styles['input-field-wrapper']}${fieldWrapperClass ? ` ${styles[fieldWrapperClass]}` : ""}${isSmall ? ` ${styles.small}` : ""}${isMedium ? ` ${styles.medium}` : ""}`}>
      {label && (
        <label>{label}</label>
      )}
      
      <div className={`${styles['input-wrapper']}${wrapperClass ? ` ${styles[wrapperClass]}` : ""}`}>
        {children}
      </div>
    </div>
  )
};

export default InputWrapper;