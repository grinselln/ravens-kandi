import styles from './Button.module.scss';

interface IButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  additionalClass?: string;
  isDisabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
  isSelected?: boolean;
}

const Button = ({additionalClass, isDisabled, onClick, children, isSelected, ...rest} : IButton) => {
  return (
    <button
      className={`${styles['button']}${additionalClass ? ` ${styles[additionalClass]}` : ""}${isSelected ? ` ${styles.active}` : ""}`}
      onClick={() => onClick()}
      disabled={isDisabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
