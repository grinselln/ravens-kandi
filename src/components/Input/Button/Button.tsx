import clsx from 'clsx';
import styles from './Button.module.scss';
import { formatClsxClassString } from '@/helpers/dataManipulation';
import { MouseEventHandler } from 'react';

interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  additionalClass?: string[];
  isDisabled: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  isSelected?: boolean;
}

const Button = ({additionalClass, isDisabled, onClick, children, isSelected, ...rest} : IButton) => {
  return (
    <button
      className={clsx(
        styles['button'],
        isSelected ? ` ${styles.active}` : [],
        formatClsxClassString(additionalClass, styles)
      )}
      onClick={(e) => onClick(e)}
      disabled={isDisabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
