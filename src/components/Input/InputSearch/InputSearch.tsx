import InputText from "../InputText/InputText";
import styles from "./InputSearch.module.scss";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "@/components/Admin/Rows/ActionElements/ActionButton/ActionButton";

interface IInputSearch {
  searchText: string;
  setSearchText: (value: string) => void;
}

const InputSearch = (props: IInputSearch) => {
  const { searchText, setSearchText } = props;

  return (
    <div className={styles.search}>
      <InputText
        wrapperClass={['inverse']}
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
