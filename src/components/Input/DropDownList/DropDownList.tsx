import { IDropDownOption } from '@/interfaces/IRecords';
import styles from './DropDownList.module.scss';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';

interface IDropDownList<T> {
  isSmall?: boolean;
  isInverse?: boolean;
  isOpen: boolean;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  value: number | string | null | undefined;
  options: IDropDownOption<T>[];
  handleTriggerClick: (e: React.MouseEvent) => void;
  setValue: (value: IDropDownOption<T> | null) => void;
  triggerRef: React.RefObject<HTMLButtonElement | HTMLInputElement | null>;
  listRef: React.RefObject<HTMLUListElement | null>;
  onAddNew?: (newItem: IDropDownOption<number>) => void;
  searchText?: string;
  allowRemoval?: boolean;
  placeholder?: string;
  isInverseLight?: boolean;
  isMedium?: boolean;
  onPositionChange: (value: boolean) => void
}

interface IPosition {
  top: number; 
  bottom: number; 
  left: number, 
  width: number, 
  isDisplayUp: boolean, 
}

const DropDownList = <T,>({ listRef, onPositionChange, isSmall, isMedium, isInverse, isInverseLight, isOpen, activeIndex, setActiveIndex, value, options, handleTriggerClick, setValue, triggerRef, onAddNew, searchText, allowRemoval, placeholder }: IDropDownList<T>) => {
  const [position, setPosition] = useState<IPosition | null>(null);

  const calculatePosition = useCallback((): IPosition | null => {
    if (!triggerRef.current || !listRef?.current) return null;

    const triggerPosition = triggerRef.current.getBoundingClientRect();
    const dropdownHeight = listRef.current.getBoundingClientRect().height;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0
    const isInverse = viewportHeight - triggerPosition.bottom < dropdownHeight;

    return {
      top: isInverse ? triggerPosition.top - dropdownHeight : triggerPosition.bottom,
      bottom: triggerPosition.bottom,
      left: triggerPosition.left,
      width: triggerPosition.width,
      isDisplayUp: isInverse
    };
  }, [triggerRef, listRef]);

  useEffect(() => {
    if (!isOpen) return;

    const reposition = () => {
      const calculated = calculatePosition();
      if (calculated) setPosition(calculated);
    };

    reposition();

    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true); // capture phase for nested scroll containers

    const container = triggerRef.current?.closest('[class*="body-wrapper"]');
    const resizeObserver = container ? new ResizeObserver(reposition) : null;
    resizeObserver?.observe(container as Element);

    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
      resizeObserver?.disconnect();
    };
  }, [isOpen, calculatePosition, triggerRef]);

  useEffect(() => {
    if (position) {
      onPositionChange?.(position.isDisplayUp);
    }
  }, [position, onPositionChange]);

  useEffect(() => {
  if (!isOpen) {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- resetting position/measurement state on close, not deriving render output
    setPosition(null);
    onPositionChange?.(false);
  }
}, [isOpen, onPositionChange]);

  if(!isOpen) return null;

  return createPortal(
    <ul role="listbox" className={`
      ${styles['dropdown-list']}
      ${isSmall ? ` ${styles.small}` : ""}
      ${isMedium ? ` ${styles.medium}` : ""}
      ${isInverse ? ` ${styles.inverse}` : ""}
      ${isInverseLight ? ` ${styles['inverse-light']}` : ""}
      ${position?.isDisplayUp ? ` ${styles['display-up']}` : ""}
      `} 
      onMouseLeave={() => setActiveIndex(-1)}
      style={
        position
          ? { top: position.top, left: position.left, width: position.width }
          : { visibility: 'hidden', top: 0, left: 0 }
      }
      ref={listRef}
    >
      {allowRemoval && (
        <li
          id={`listboxOption_null`}
          role="option"
          className={(value === null || value === undefined)
            ? styles.selected
            : activeIndex === 0
            ? styles.active
            : ""}
          onClick={(e) => {
            handleTriggerClick(e);
            setValue(null);
            triggerRef.current?.focus();
          }}
          onMouseEnter={() => {
            setActiveIndex(0)
          }}
        >
          {placeholder}
        </li>
      )}
      {options.map((option, idx: number) => {
        const index = allowRemoval ? idx + 1 : idx;

        return (
        <li
          id={`listboxOption_${option.value}`}
          key={`${option.value}`}
          role="option"
          aria-selected={option.value === value}
          className={option.value === value 
            ? styles.selected
            : activeIndex === index
            ? styles.active
            : ""}
          onClick={(e) => {
            handleTriggerClick(e);
            setValue(option);
            triggerRef.current?.focus();
          }}
          onMouseEnter={() => {
            setActiveIndex(index)
          }}
        >
          {option.label}
        </li>
      )})}
      {options.length === 0 && onAddNew && (
        <li
          id={`listboxOption_-1`}
          role="option"
          className={clsx(
            activeIndex === 0 && styles.active
          )}
          onClick={(e) => {
            handleTriggerClick(e);
            onAddNew({value: (Math.floor(Math.random() * 1000) + 1) * -1, label: searchText ?? ""});
            triggerRef.current?.focus();
          }}
          onMouseEnter={() => {
            setActiveIndex(0)
          }}
        >
          {`Add ${searchText} as a subcategory`}
        </li>
      )}
    </ul>,
    document.body
  )
};

export default DropDownList;