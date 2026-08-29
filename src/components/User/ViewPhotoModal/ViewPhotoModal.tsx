import Modal from "@/components/Modal/Modal";
import styles from "./ViewPhotoModal.module.scss";
import Button from "@/components/Input/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";
import { faCopy } from "@fortawesome/free-regular-svg-icons";
import { IPublicQueryPhotoCategories, ISelectedPhoto } from "@/interfaces/IPhotos";


interface IViewPhotoModal {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  selectedPhoto: ISelectedPhoto | null;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_UPLOAD_DIRECTORY = import.meta.env.VITE_API_UPLOAD_DIRECTORY;

const ViewPhotoModal = ({isOpen, setIsOpen, selectedPhoto}: IViewPhotoModal) => {
  const baseUploadUrl = `${API_URL}/${API_UPLOAD_DIRECTORY}/`;
  
  const [copied, setCopied] = useState(false);

  const isTwoColumn = useMemo(() => {
    return selectedPhoto?.source || selectedPhoto?.story;
  }, [selectedPhoto])

  const handleCopy = async () => {
    if(selectedPhoto?.source === undefined || selectedPhoto?.source === null) return;

    try {
      await navigator.clipboard.writeText(selectedPhoto?.source);
      setCopied(true);
      
      setTimeout(() => setCopied(false), 1500); 
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Modal
      visibility={isOpen}
      setVisibility={(openValue) => setIsOpen(openValue)}
      title={selectedPhoto?.title ? `${selectedPhoto?.title}${selectedPhoto?.type_title ? ` [${selectedPhoto?.type_title}]` : ""}` : "Creation Details"}
      additionalClass={['view-photo', ...selectedPhoto?.isOdd ? ["view-photo-o"] : [], ...!isTwoColumn ? ["fit-content"] : []]}
      modalButtons={null}
    >
      <div className={`${styles['view-photo-wrapper']}${selectedPhoto?.isOdd ? ` ${styles.odd}` : ""}${!isTwoColumn ? ` ${styles.single}` : ""}`}>
        <div className={`${styles['photo-wrapper']}`}>
          <img src={`${baseUploadUrl}${selectedPhoto?.photo_filename}`} alt="Preview" className={styles.previewImage} />
          {selectedPhoto?.source && (
            <div className={styles.source}>
              <span className={styles['source-title']}>Design source:</span>
              <div className={styles['link-wrapper']}>
                <span className={styles['source-link']}>{selectedPhoto?.source}</span>
                <Button additionalClass="no-style" onClick={() => {handleCopy()}} isDisabled={false}><FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} /></Button>
                <a href={selectedPhoto?.source} target="_blank"><FontAwesomeIcon icon={faUpRightFromSquare} /></a>
              </div>
            </div>
          )}
          {(selectedPhoto?.categories?.length ?? 0) > 0 && (
            <div className={styles['tags-wrapper']}>
              <div className={`${styles['tags-display-wrapper']}`}>
                  {(selectedPhoto?.categories ?? []).map((category: IPublicQueryPhotoCategories) => (
                    category.subcategory_names.map((subcategory: string) => (
                      <div className={styles['tag-wrapper']} key={`viewCategory_${category.category_name}`}>
                        <span className={styles.pill} key={`viewSubcategory_${subcategory}`}>{subcategory}</span>
                      </div>
                    )) 
                  ))}
              </div>
            </div>
          )}
        </div>
        {isTwoColumn && (
          <div className={`${styles['details-wrapper']}`}>
            {selectedPhoto?.story && (
              <div className={styles['story-content-wrapper']}>
                <span className={styles.label}>Story:</span>
                <div className={styles['story-wrapper']}>
                <div className={styles['accent-box']}>
                  <div className={styles.story}>
                    {selectedPhoto?.story}
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
};

export default ViewPhotoModal;