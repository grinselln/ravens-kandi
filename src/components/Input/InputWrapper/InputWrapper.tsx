import { ReactNode } from 'react';
import styles from './InputWrapper.module.scss';
import clsx from 'clsx';
import { formatClsxClassString } from '@/helpers/dataManipulation';

interface IInputWrapper {
  label?: string | ReactNode;
  wrapperClass?: string[];
  fieldWrapperClass?: string[];
  children: React.ReactNode;
}

const InputWrapper = ({fieldWrapperClass, label, wrapperClass, children}: IInputWrapper) => {
  return (
    <div className={clsx(
      styles['input-field-wrapper'],
      ...formatClsxClassString(fieldWrapperClass, styles)
    )}>
      {label && (
        <label>{label}</label>
      )}
      
      <div className={clsx(
        styles['input-wrapper'],
        ...formatClsxClassString(wrapperClass, styles)
      )}>
        {children}
      </div>
    </div>
  )
};

export default InputWrapper;