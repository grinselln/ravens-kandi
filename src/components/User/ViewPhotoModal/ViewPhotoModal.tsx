import Modal from "@/components/Modal/Modal";
import styles from "./ViewPhotoModal.module.scss";
import Button from "@/components/Input/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";
import { useMemo, useState } from "react";
import { faCopy, faImages } from "@fortawesome/free-regular-svg-icons";


interface IViewPhotoModal {
  isOpen: boolean;
  setIsOpen: Function;
  photo: any;
}

const API_URL = import.meta.env.VITE_API_URL;

const ViewPhotoModal = ({isOpen, setIsOpen, photo}: IViewPhotoModal) => {
  const baseUploadUrl = `${API_URL}/uploads/`;
  
  const [copied, setCopied] = useState(false);

  const selectedPhoto = useMemo(() => {
    return !!photo ? photo : {};
  }, [photo])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedPhoto.source);
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
      title={selectedPhoto.title ? selectedPhoto.title : "Creation Details"}
      additionalClass={selectedPhoto.isOdd ? "view-photo-o" : "view-photo"}
      modalButtons={null}
    >
      <div className={`${styles['view-photo-wrapper']}${selectedPhoto.isOdd ? ` ${styles.odd}` : ""}`}>
        <div className={`${styles['photo-wrapper']}`}>
          <img src={`${baseUploadUrl}${selectedPhoto.photo_filename}`} alt="Preview" className={styles.previewImage} />
        </div>
        <div className={`${styles['details-wrapper']}`}>
          {(selectedPhoto.type_title || selectedPhoto.source) && (
            <div className={styles['header-details']}>
              {selectedPhoto.type_title && (
                <div className={styles['type-wrapper']}><span className={styles.label}>Creation Type: </span><span className={styles.type}>{selectedPhoto.type_title}</span></div>
              )}
              {selectedPhoto.source && (
                <div className={styles.source}>
                  <span className={styles['source-title']}>Design source:</span>
                  <span className={styles['source-link']}>{selectedPhoto.source}</span>
                  <Button additionalClass="no-style" onClick={() => {handleCopy()}} isDisabled={false}><FontAwesomeIcon icon={copied ? faCheckCircle : faCopy} /></Button>
                  <a href={selectedPhoto.source} target="_blank"><FontAwesomeIcon icon={faUpRightFromSquare} /></a>
                </div>
              )}
            </div>
          )}
            <div className={styles['tags-wrapper']}>
              <span className={styles.label}>Categories & Subcategories:</span>
              <div className={`${styles['tags-display-wrapper']}`}>
                  {(selectedPhoto?.categories ?? []).map((category: any) => (
                    <div className={styles['tag-wrapper']} key={`viewCategory_${category.category_name}`}>
                      <span className={styles.label}>{category.category_name}: </span>
                      <div className={styles.subcategories}>
                        {category.subcategory_names.map((subcategory: any) => (
                          <span className={styles.pill} key={`viewSubcategory_${subcategory}`}>{subcategory}</span>
                        ))}
                        {category.subcategory_names.length === 0 && (
                          <p>No subcategories have been assigned.</p>
                        )}  
                      </div>
                    </div>
                  ))}
                  {selectedPhoto.categories?.length === 0 && (
                    <p>No categories have been assigned.</p>
                  )}
              </div>
            </div>
          {selectedPhoto.story && (
            <div className={styles['story-content-wrapper']}>
              <span className={styles.label}>Story:</span>
              <div className={styles['story-wrapper']}>
              <div className={styles['accent-box']}>
                <div className={styles.story}>
                  {selectedPhoto.story}
                </div>
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
};

export default ViewPhotoModal;