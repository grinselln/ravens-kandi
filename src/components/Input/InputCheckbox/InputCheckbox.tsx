import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import InputWrapper from "../InputWrapper/InputWrapper";
import styles from "./InputCheckbox.module.scss";
import { faSquare } from "@fortawesome/free-solid-svg-icons";
import { faSquare as faUnchecked } from "@fortawesome/free-regular-svg-icons";
import clsx from "clsx";
import { formatClsxClassString } from "@/helpers/dataManipulation";

interface InputCheckbox {
  label?: string;
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
  disabled: boolean;
  fieldWrapperClass?: string[];
  wrapperClass?: string[];
  classes?: string[];
}

const InputCheckbox = (props: InputCheckbox) => {
  const { label, isChecked, setIsChecked, disabled, fieldWrapperClass, wrapperClass, classes} = props;
  return (
    <InputWrapper
      fieldWrapperClass={fieldWrapperClass}
      wrapperClass={["checkbox", ...wrapperClass ? wrapperClass : []]}
    >
      <button 
        className={clsx(
          styles.checkbox,
          ...formatClsxClassString(classes, styles)
        )}
        onClick={() => setIsChecked(!isChecked)}
        disabled={disabled}
      >
        <FontAwesomeIcon icon={isChecked ? faSquare : faUnchecked} />
      </button>
      {label && (
        <label>{label}</label>
      )}
    </InputWrapper>
  );
}

export default InputCheckbox;