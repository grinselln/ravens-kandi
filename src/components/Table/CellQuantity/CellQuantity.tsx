import styles from "./CellQuantity.module.scss";
import ActionButton from "@/components/Admin/Rows/ActionElements/ActionButton/ActionButton";
import Button from "@/components/Input/Button/Button";
import { formatClsxClassString } from "@/helpers/dataManipulation";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { faClose, faMinusSquare, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import clsx from "clsx";

interface ICellQuantity {
  classes?: string[];
  isEditing: boolean;
  originalQuantity: number;
  quantity: number;
  onQuantityChange: (values: {value: number, originalValue: number, changeSource: number}) => void;
  minusDisabled?: boolean;
  plusDisabled?: boolean;
}

const CellQuantity = (props: ICellQuantity) => {
  const { classes, isEditing, originalQuantity, quantity, onQuantityChange, minusDisabled, plusDisabled } = props;

  const { windowBreakPoints } = useWindowWidth();

  return (
    <div className={clsx(
      styles['count-wrapper'],
      ...formatClsxClassString(classes, styles)
    )}>
      <div className={styles.count}>
        <div className={styles.control}>
          <ActionButton
            additionalClass={isEditing ? [] : ["hidden"]}
            icon={faMinusSquare}
            onAction={() => onQuantityChange({value: quantity - 1, originalValue: quantity, changeSource: -1})}
            variant="default"
            isDisabled={quantity === 0 || !!minusDisabled}
          />
        </div>
        <span>{quantity}</span>
        <div className={styles.control}>
          <ActionButton
            additionalClass={isEditing ? [] : ["hidden"]}
            icon={faPlusSquare}
            onAction={() => onQuantityChange({value: quantity + 1, originalValue: quantity, changeSource: 1})}
            variant="default"
            isDisabled={!!plusDisabled}
          />
        </div> 
      </div>
      {quantity !== originalQuantity && (
        <Button 
          additionalClass={['alert', 'quantity-revert']} 
          onClick={() => onQuantityChange({value: originalQuantity, originalValue: originalQuantity, changeSource: 0})} 
          isDisabled={false}>
            {windowBreakPoints.isMobile ? <FontAwesomeIcon icon={faClose} /> : "Revert"}
        </Button>
      )}
    </div>
  )
};

export default CellQuantity;