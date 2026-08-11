import Modal from "@/components/Modal/Modal";
import styles from "./PhotoDetailsModal.module.scss";
import Button from "@/components/Input/Button/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckSquare, faLink, faSpinner, faSquare, faSquareXmark } from "@fortawesome/free-solid-svg-icons";
import InputText from "@/components/Input/InputText/InputText";
import InputTextArea from "@/components/Input/InputTextArea/InputTextArea";
import InputDropDown from "@/components/Input/InputDropDown/InputDropDown";
import { useEffect, useMemo, useRef, useState } from "react";
import { faImages } from "@fortawesome/free-regular-svg-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addPhoto, updatePhoto } from "@/api/photos";
import ActionButton from "../../Rows/ActionElements/ActionButton/ActionButton";

interface IOption {
  label: string;
  value: string;
}

interface IUploadItem {
  id: string;          // crypto.randomUUID() or index — something stable to key on
  file: File;
  previewUrl: string;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}

interface IPhotoDetailsModal {
  isOpen: boolean;
  setIsOpen: Function;
  photoTypes: Array<any>
  categories: Array<any>
  subcategories: Array<any>
  selectedPhotos: any;
  setSelectedPhotos: Function;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_UPLOAD_DIRECTORY = import.meta.env.VITE_API_UPLOAD_DIRECTORY;

const PhotoDetailsModal = ({selectedPhotos = [], setSelectedPhotos, isOpen, setIsOpen, photoTypes, categories, subcategories}: IPhotoDetailsModal) => {
  const baseUploadUrl = `${API_URL}/${API_UPLOAD_DIRECTORY}/`;
  const queryClient = useQueryClient();
  const [uploadItems, setUploadItems] = useState<IUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoTitle, setPhotoTitle] = useState<string>("");
  const [photoSource, setPhotoSource] = useState<string>("");
  const [photoSourceError, setPhotoSourceError] = useState<boolean>(false);
  const [photoStory, setPhotoStory] = useState<string>("");
  const [selectedPhotoType, setSelectedPhotoType] = useState<IOption>({label: "", value: ""});
  const [selectedCategories, setSelectedCategories] = useState<Array<number>>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Array<number>>([]);

  const resetState = () => {
    setSelectedPhotos([]);
    setUploadItems([]);
    setPhotoTitle("");
    setPhotoSource("");
    setPhotoStory("");
    setSelectedPhotoType({label: "", value: ""});
    setSelectedCategories([]);
    setSelectedSubcategories([]);
  }

  const addMutation = useMutation({
    mutationFn: (newPhoto: {
      title: string;
      story: string;
      source: string;
      photo_type_id: number | null;
      categories: Array<number>;
      subcategories: Array<number>;
      image: File;
    }) => addPhoto(newPhoto),
    onError: (error) => {
      console.error('Upload failed:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {
      id: number, 
      updatedPhoto: {
        title: string;
        story: string;
        source: string;
        photo_type_id: number | null;
        categories: Array<number>;
        subcategories: Array<number>;
        image: File | null;
      }
    }) => updatePhoto(updates.id, updates.updatedPhoto),
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const handleSaveNew = async () => {
    if (uploadItems.length === 0 || photoSourceError) return;

    const isSingle = uploadItems.length === 1;
    setUploadItems(prev => prev.map(item => ({ ...item, status: "uploading" })));

    const results = await Promise.allSettled(
      uploadItems.map(async (item) => {
        try {
          await addMutation.mutateAsync(
            {
              title: photoTitle,
              story: isSingle ? photoStory : "",
              source: "",
              photo_type_id: selectedPhotoType.value ? Number(selectedPhotoType.value) : null,
              categories: selectedCategories,
              subcategories: selectedSubcategories,
              image: item.file,
            }
          );
          setUploadItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "success" } : i
          ));
        } catch (err) {
          setUploadItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "error", errorMessage: String(err) } : i
          ));
          throw err;
        }
      })
    );

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['photos'] }),
      queryClient.invalidateQueries({ queryKey: ['photoCategories'] }),
      queryClient.invalidateQueries({ queryKey: ['photoSubcategories'] })
    ])

    const allSucceeded = results.every(r => r.status === "fulfilled");

    if (allSucceeded) {
      setIsOpen(false);
      resetState();
    }
  };

  const handleSaveEdit = async () => {
    if (uploadItems.length === 0 || selectedPhotos.length === 0) return;

    setUploadItems(prev => prev.map(item => ({ ...item, status: "uploading" })));

    const results = await Promise.allSettled(
      uploadItems.map(async (item) => {
        const selectedPhoto = selectedPhotos.find((photo: any) => photo.id === item.id);
        const isSingle = uploadItems.length === 1;

        try {
          await updateMutation.mutateAsync(
            {
              id: parseInt(item.id),
              updatedPhoto: {
                title: isSingle ? photoTitle : selectedPhoto.title, 
                story: isSingle ? photoStory : selectedPhoto.story,
                source: isSingle ? photoSource : selectedPhoto.source,
                photo_type_id: selectedPhotoType.value ? Number(selectedPhotoType.value) : null,
                categories: selectedCategories,
                subcategories: selectedSubcategories,
                image: isSingle ? uploadItems[0].file : null
              }
            }
          );
          setUploadItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "success" } : i
          ));
        } catch (err) {
          setUploadItems(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "error", errorMessage: String(err) } : i
          ));
          throw err;
        }
      })
    );

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['photos'] }),
      queryClient.invalidateQueries({ queryKey: ['photoCategories'] }),
      queryClient.invalidateQueries({ queryKey: ['photoSubcategories'] })
    ])

    const allSucceeded = results.every(r => r.status === "fulfilled");

    if (allSucceeded) {
      setIsOpen(false);
      resetState();
    }
  };

  const photoTypeOptions =  useMemo(() => {
    return photoTypes.map((type:any) => ({label: type.title, value: type.id}))
  }, [photoTypes]);

  const availableCategories = useMemo(() => {
    return (categories).filter((category: any) => category.id !== 1).map((category: any) => {
      if(category.trigger_subcategory_id && subcategories) {
        const triggerSubcategory = subcategories.find((subcategory: any) => subcategory.id === category.trigger_subcategory_id);
        const triggerSubcategoryCategory = categories.find((category: any) => category.id === triggerSubcategory?.category_id);

        if(triggerSubcategory && triggerSubcategoryCategory) {
        return {
            ...category,
            linkedSubcategory: {
              triggerSubcategoryCategory,
              triggerSubcategory
            }
          }
        }
      }

      return category
    });
  }, [categories, subcategories]);

  const formattedPhotoSource = useMemo(() => {
    if(photoSource === "" || photoSource === "http://") return "";

    const cleanPhotoSource = photoSource.replace('http://', '');

    return 'http://' + cleanPhotoSource;
  }, [photoSource]);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;

    const availableNewSlots = 16 - uploadItems.length;
    const restrictedFileList = Array.from(fileList)
      .slice(0, availableNewSlots);

    const newItems: IUploadItem[] = restrictedFileList
      .filter(file => file.type.startsWith("image/"))
      .map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending" as const,
      }));

    setUploadItems(prev => [...prev, ...newItems]);
  };

  const removeItem = (id: string) => {
    setUploadItems(prev => {
      const target = prev.find(i => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  function isValidUrl(url: string) {
    if (url === "") {
      setPhotoSourceError(false);
      return;
    }

    try {
      const tmpUrl = new URL(url);
      
      if (tmpUrl.protocol !== "http:" && tmpUrl.protocol !== "https:") {
        setPhotoSourceError(true);
        return;
      }

      const hostnameParts = tmpUrl.hostname.split('.');
       
      if (hostnameParts.length < 2 || hostnameParts[hostnameParts.length - 1].length < 2) {
        setPhotoSourceError(true);
        return;
      }
      
      setPhotoSource(url);
      setPhotoSourceError(false);
      return;
    } catch (_) {
      setPhotoSourceError(true);
      return;
    }
  }

  useEffect(() => {
  return () => {
    uploadItems.forEach(item => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    if(selectedPhotos.length > 0) {
      setPhotoTitle(selectedPhotos[0].title);
      setUploadItems(selectedPhotos.map((photo: any) => ({
        id: photo.id,
        previewUrl: `${baseUploadUrl}${photo.photo_filename}`,
        status: "pending",
      })));
      setSelectedPhotoType({label: selectedPhotos[0].type_title ?? "", value: selectedPhotos[0].photo_type_id ?? ""});
      setSelectedCategories(selectedPhotos[0].categories.map((category: any) => category.id));
      setSelectedSubcategories(selectedPhotos[0].subcategories.map((subcategory: any) => subcategory.id));
    }
  }, [selectedPhotos]);

  return (
    <Modal
      visibility={isOpen}
      setVisibility={(openValue) => {
        setIsOpen(openValue);
        resetState();
      }}
      title={selectedPhotos.length === 1 
        ? "Edit Photo"
        : selectedPhotos.length > 1
        ? "Edit Photo"
        : "Add Photo"}
      additionalClass="add-photo"
      modalButtons={
        <>
          <Button additionalClass="outline-muted" onClick={() => {
              setIsOpen(false);
              resetState();
            }} 
            isDisabled={false}>Cancel</Button>
          <Button onClick={() => selectedPhotos.length !== 0 ? handleSaveEdit() : handleSaveNew()}
            isDisabled={uploadItems.length === 0
            || photoSourceError}>Save Photo</Button>
        </>
      }
    >
      <div className={styles['new-photo-wrapper']}>
        <div className={styles['photo-details']}>
          {selectedPhotos.length <= 1 && (
            <InputText
              label='Title'
              placeholder='e.g. Glow bat bracelet'
              value={photoTitle}
              setValue={(title) => setPhotoTitle(title)}
            />
          )}
          <div
            className={`${styles.upload}${isDragging ? ` ${styles.dragging}` : ""}${uploadItems.length > 1 ? ` ${styles.multiple}` : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {uploadItems.length <= 1 && (
              <input
                ref={fileInputRef}
                multiple
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleFiles(e.target.files)}
              />
            )}
            {/*{existingPhoto && (
              <div className={`${styles['preview-grid']}`}>
                <div className={`${styles['preview-item']}`}>
                    <img src={`${baseUploadUrl}${existingPhoto}`} alt="" className={styles.previewImage} />
                    <ActionButton icon={faSquareXmark} variant="alert" onAction={(e) => { e.stopPropagation(); setExistingPhoto(null) }} isDisabled={false} />
                  </div>
              </div>
            )}*/}
            {uploadItems.length > 0 && (
              <div className={`${styles['preview-grid']}${uploadItems.length > 1 ? ` ${styles.multiple}` : ""}`}>
                {uploadItems.map(item => (
                  <div key={item.id} className={`${styles['preview-item']} ${styles[item.status]}`}>
                    <img src={item.previewUrl} alt="" className={styles.previewImage} />
                    {item.status === "error" && (
                      <p className={styles['error-badge']}>{item.errorMessage ?? (selectedPhotos.length === 0 ? "Upload failed" : "Edit failed")}</p>
                    )}
                    {item.status === "uploading" && <FontAwesomeIcon className={styles['status-badge-loading']} icon={faSpinner} spin />}
                    {item.status === "success" && <FontAwesomeIcon className={styles['status-badge-success']} icon={faCheck} />}
                    {item.status !== "uploading" && uploadItems.length === 1 && (
                      <ActionButton icon={faSquareXmark} variant="alert" onAction={(e) => { e.stopPropagation(); removeItem(item.id); }} isDisabled={false} />
                    )}
                  </div>
                ))}
              </div>
            )}
            {uploadItems.length === 0 && (
              <>
                <FontAwesomeIcon className={styles['image-placeholder']} icon={faImages} />
                <p>Click or drag to upload image</p>
              </>
            )}
          </div>

          {uploadItems.length === 12 && (
            <p className={styles.max}>Max upload limit reached.</p>
          )}

          {uploadItems.length <= 1 && (
            <>
            <div className={styles.source}>
              <InputText
                label='Source'
                placeholder='Source URL credit'
                value={formattedPhotoSource}
                setValue={(source) => setPhotoSource(source)}
                onBlur={() => isValidUrl(formattedPhotoSource)}
              />
              {photoSourceError && (
                <p className="alert">Invalid URL</p>
              )}
            </div>
              <InputTextArea
                label='Story'
                placeholder='Details of the interaction...'
                value={photoStory}
                setValue={(story) => setPhotoStory(story)}
              />
            </>
          )}
        </div>
        <div className={styles['category-details']}>
          <InputDropDown
            label='Photo type'
            placeholder='Select photo type'
            value={selectedPhotoType.value}
            setValue={setSelectedPhotoType}
            options={photoTypeOptions}
            isDisabled={false}
          />
          <p className={styles.header}>Categories & subcategories</p>
          <div className={styles['accent-box-wrapper']}>
            <div className={styles['accent-box']}>
              <div className={styles['selection-wrapper']}>
                {availableCategories.map((category: any, idx: number) => {
                  const isCategorySelected = selectedCategories.includes(category.id);
                  const isCategoryDisabled = !!category.trigger_subcategory_id && !selectedSubcategories.includes(category.trigger_subcategory_id);

                  return (
                    <div key={`categoryDetails_${category.id}`} className={`${styles['category-selection-wrapper']}${isCategoryDisabled ? ` ${styles.disabled}` : ""}`}>
                      {idx !== 0 && (
                        <hr />
                      )}
                      <div className={styles['category-header']}>
                        <Button
                          additionalClass="no-style"
                          onClick={() => {
                            if(isCategorySelected) {
                              setSelectedCategories((prev: any) => prev.filter((prevItem: any) => prevItem !== category.id));

                              const categorySubcategories = category.subcategories.map((subcategory: any) => subcategory.id);
                              setSelectedSubcategories((prev: any) => prev.filter((prevItem: any) => !categorySubcategories.includes(prevItem)));
                            }
                            else {
                              setSelectedCategories((prev: any) => [...prev, category.id]);
                            }
                          }} 
                          isDisabled={isCategoryDisabled}
                          >
                          <span className={`${styles['checkbox-select']}${isCategorySelected ? ` ${styles.selected}` : ""}`}>
                            <FontAwesomeIcon icon={isCategorySelected ? faCheckSquare : faSquare} />
                            {category.title}
                          </span>
                        </Button>
                        {isCategoryDisabled && !!category?.linkedSubcategory && (
                          <p className={styles['trigger-notice']}>
                            <FontAwesomeIcon icon={faLink} /><span>hidden until triggered ({`${category.linkedSubcategory.triggerSubcategoryCategory.title} > ${category.linkedSubcategory.triggerSubcategory.title}`})</span>
                          </p>
                        )}
                      </div>
                      {isCategorySelected && !isCategoryDisabled && (
                        <div className={styles['subcategory-selection-wrapper']}>
                          {category.subcategories.map((subcategory: any) => {
                            const isSubcategorySelected = selectedSubcategories.includes(subcategory.id);

                            return (
                              <Button key={`detail-subcategory_${subcategory.id}`} additionalClass="no-style" 
                                onClick={() => {
                                  if(isSubcategorySelected) {
                                    setSelectedSubcategories((prev: any) => prev.filter((prevItem: any) => prevItem !== subcategory.id));
                                  }
                                  else {
                                    setSelectedSubcategories((prev: any) => [...prev, subcategory.id]);
                                  }
                                }} 
                                isDisabled={false}
                              >
                                <span className={`${styles['checkbox-select']}${isSubcategorySelected ? ` ${styles.selected}` : ""}`}>
                                  <FontAwesomeIcon icon={isSubcategorySelected ? faCheckSquare : faSquare} />
                                  <span>{subcategory.title}</span>
                                </span>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
};

export default PhotoDetailsModal;