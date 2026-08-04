import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './ActionButton.module.scss';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface IActionButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  additionalClass?: string;
  icon: IconProp;
  onAction: (e: any) => void;
  variant: "default" | "action" | "confirm" | "alert";
  isDisabled: boolean;
  ref?: any;
}

const ActionButton = ({ ref, additionalClass, variant, onAction, icon, isDisabled, ...rest } : IActionButton) => {
  return (
    <button ref={ref} className={`${styles['action-button']}${additionalClass ? ` ${styles[additionalClass]}` : ""}`} 
    onClick={(e) => {
      e.stopPropagation();
      onAction(e)
    }} 
    disabled={isDisabled}
    {...rest}
    >
      <FontAwesomeIcon icon={icon} className={variant !== "default" ? variant : ""} />
    </button>
  );
};

export default ActionButton;
