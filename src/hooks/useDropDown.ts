import { IDropDownOption } from '@/interfaces/IRecords';
import { useState, useEffect, useRef } from 'react';

interface IUseDropDown<T> {
  options: IDropDownOption<T>[];
  value: number | string | null | undefined;
  setValue: (value: IDropDownOption<T> | null) => void;
}

export const useDropDown = <T,>({options, value, setValue}: IUseDropDown<T>) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onOpenDropdown = () => {
    setIsOpen(true);
    const currentIndex = options.findIndex((option: IDropDownOption<T>) => option.value === value);
    setActiveIndex(currentIndex);
  }

  const onCloseDropdown = () => {
    setIsOpen(false);
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isOpen) {
      onCloseDropdown();
    }
    else {
      onOpenDropdown();
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();

        if (!isOpen) onOpenDropdown();
        else {
          setActiveIndex((prev) => (prev === options.length - 1 ? prev : prev + 1));
        }

        break;
      case 'ArrowUp':
        e.preventDefault();

        if (!isOpen) onOpenDropdown();
        else {
          setActiveIndex(prev => Math.max(prev - 1, 0));
        }
        
        break;
      case 'Enter':
      case ' ': // Space
        e.preventDefault();

        if (isOpen && activeIndex !== -1) {
          setValue(options[activeIndex]);
          onCloseDropdown();
          triggerRef.current?.focus();
          inputRef.current?.focus();
        }
        else if (!isOpen) {
          onOpenDropdown();
        }
        break;
      case 'Escape':
        onCloseDropdown();
        triggerRef.current?.focus();
        inputRef.current?.focus();
        break;
      case 'Tab':
        onCloseDropdown();
        triggerRef.current?.focus();
        inputRef.current?.focus();
        break;
    }
  };

  const onInputFocus = () => onOpenDropdown();

  useEffect(() => {
    if(isOpen) {
      const handleDropDownMouseDown = (e: MouseEvent) => {
        if(wrapperRef.current && !wrapperRef.current?.contains(e.target as Node)) {
          onCloseDropdown();
        }
      }

      document.addEventListener('mousedown', handleDropDownMouseDown);

      return () => {
        document.removeEventListener('mousedown', handleDropDownMouseDown);
      }
    }
  }, [isOpen]);

  return {
    isOpen,
    triggerRef,
    inputRef,
    wrapperRef,
    activeIndex,
    setActiveIndex,
    handleTriggerClick,
    handleKeyDown,
    onInputFocus
  }
}