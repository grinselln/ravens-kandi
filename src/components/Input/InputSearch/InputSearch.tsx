import InputText from "../InputText/InputText";
import styles from "./InputSearch.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "@/components/Admin/Rows/ActionElements/ActionButton/ActionButton";
import { formatClsxClassString } from "@/helpers/dataManipulation";
import clsx from "clsx";

interface IInputSearch {
  additionalClasses?: string[];
  wrapperClass?: string[];
  fieldWrapperClass?: string[];
  isLight?: boolean;
  searchText: string;
  setSearchText: (value: string) => void;
}

const InputSearch = (props: IInputSearch) => {
  const { additionalClasses, wrapperClass, fieldWrapperClass, isLight = false, searchText, setSearchText } = props;

  return (
    <div 
      className={clsx(
        styles.search,
        formatClsxClassString(additionalClasses, styles)
      )}
    >
      <InputText
        fieldWrapperClass={fieldWrapperClass}
        wrapperClass={[isLight ? "" : 'inverse', ...wrapperClass ?? []]}
        placeholder='Search by title...'
        value={searchText}
        setValue={(newValue) => setSearchText(newValue)}
      />
      {searchText !== "" && (
        <ActionButton
          icon={faClose}
          variant="default"
          onAction={() => setSearchText("")}
          isDisabled={false}
        />
      )}
    </div>
  )
}

export default InputSearch
