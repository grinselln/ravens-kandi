import { Dispatch, SetStateAction, useMemo, useState } from "react";
import styles from "./FilterDisplay.module.scss"
import Button from "@/components/Input/Button/Button";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import ActionButton from "@/components/Admin/Rows/ActionElements/ActionButton/ActionButton";
import { ICategoriesQueryData, ICategoryFilter, ICategoryFilterCollection, ICategoryQueryGroupedCategory, ICategoryQueryGroupedCategorySubcategory } from "@/interfaces/ICategories";

interface IFilterDisplay {
  isAdmin: boolean;
  categoryData: ICategoriesQueryData | undefined;
  selectedCategoryFilters: ICategoryFilterCollection;
  setSelectedCategoryFilters: Dispatch<SetStateAction<ICategoryFilterCollection>>;
}

const FilterDisplay = ({isAdmin, categoryData, selectedCategoryFilters, setSelectedCategoryFilters}: IFilterDisplay) => {
    const {windowBreakPoints} = useWindowWidth();
    const [isAccordionOpen, setIsAccordionOpen] = useState<boolean>(true);
    
  const viewableCategories = useMemo(() => {
    const dataToUse = isAdmin ? categoryData?.groupedCategories ?? [] : categoryData?.groupedCategoriesPhotosOnly ?? [];
    const selectedArray = selectedCategoryFilters ? Object.values(selectedCategoryFilters) : [];

    return (dataToUse).filter((category: ICategoryQueryGroupedCategory) => {

      const includesTrigger = selectedArray.some((item: ICategoryFilter) => {
        const triggerSubcategoryId = category.trigger_subcategory_id;

        if(!triggerSubcategoryId) return false;

        return (item?.subcategory_ids ?? []).includes(triggerSubcategoryId)
      });
      
      return category.id !== 1 && (category.trigger_subcategory_id == null || includesTrigger);
  });
  }, [categoryData, selectedCategoryFilters, isAdmin]); 

  return (
    viewableCategories.length > 0 && (
      <div className={`${styles.accordion}${isAccordionOpen ? ` ${styles.open}` : ""}${windowBreakPoints.isMobile ? ` ${styles['mobile']}` : ""}${isAdmin ? ` ${styles.admin}` : ""}`}>
        <div className={styles['accordion-header']}
          onClick={() => {
            setIsAccordionOpen(!isAccordionOpen)
          }}
        >
          <span>Filters</span>
          <ActionButton variant="default" icon={isAccordionOpen ? faChevronUp : faChevronDown} isDisabled={false} onAction={() => {
            setIsAccordionOpen(!isAccordionOpen)
          }} />
        </div>

        <div className={styles['body-wrapper']}>
          <div className={styles.body}>
            <div className={styles['body-content']}>
              <div className={`${styles['categories']}${isAdmin ? ` ${styles.admin}` : ""}`}>
                {viewableCategories.map((category: ICategoryQueryGroupedCategory) => {
                  return (
                    <div className={styles.category} key={`category_${category.id}`}>
                      <h3>{category.title}</h3>
                      <div className={styles.subcategories}>
                        {category.subcategories.map((subcategory: ICategoryQueryGroupedCategorySubcategory) => {
                          const currentSelectedSubcategories: Array<string | number> = selectedCategoryFilters?.[category.id]?.subcategory_ids ?? [];

                          return (
                            <Button key={`subcategory_${subcategory.id}`} additionalClass={isAdmin ? "pill-square" : "pill-muted"} isSelected={currentSelectedSubcategories.includes(subcategory.id)} isDisabled={false} 
                              onClick={() => {
                                if(currentSelectedSubcategories.includes(subcategory.id)) { //remove subcategory
                                  if(category.order_index === 0) {
                                    setSelectedCategoryFilters({})
                                  } else {
                                    const triggerCategory = (categoryData?.groupedCategoriesPhotosOnly ?? []).find((category: ICategoryQueryGroupedCategory) => category.trigger_subcategory_id === subcategory.id);

                                    if(triggerCategory) {
                                      setSelectedCategoryFilters((prev: ICategoryFilterCollection) => {
                                        const selectedTmp = {...prev};
                                        delete selectedTmp[triggerCategory.id];
                                        const newSelectedSubcategories = (selectedTmp[category.id]?.subcategory_ids ?? []).filter((currentSubcategory: number) => currentSubcategory !== subcategory.id);

                                        return {
                                          ...selectedTmp,
                                          [category.id]: {
                                            subcategory_ids: newSelectedSubcategories
                                          }
                                        }
                                      });
                                    } else {
                                      setSelectedCategoryFilters((prev: ICategoryFilterCollection) => {
                                        const currentSubcategories = prev[category.id]?.subcategory_ids ?? [];

                                        return {
                                          ...prev,
                                          [category.id]: {
                                            subcategory_ids: currentSubcategories.filter((prevSubcategory: number) => prevSubcategory !== subcategory.id)
                                          }
                                        } 
                                      })
                                    }
                                  }
                                }
                                else {
                                  const triggerCategory = (categoryData?.groupedCategoriesPhotosOnly ?? []).find((category: ICategoryQueryGroupedCategory) => category.trigger_subcategory_id === subcategory.id);

                                  if(category.order_index === 0) { //add
                                    setSelectedCategoryFilters({
                                      [category.id]: {
                                        subcategory_ids: [subcategory.id]
                                      },
                                      ...(triggerCategory && {
                                        [triggerCategory.id]: {
                                          subcategory_ids: []
                                        }
                                      })
                                    })
                                  } else {
                                    setSelectedCategoryFilters((prev: ICategoryFilterCollection) => {
                                      const currentSubcategories = prev[category.id]?.subcategory_ids ?? [];

                                      return {
                                        ...prev,
                                        [category.id]: {
                                          subcategory_ids: [...currentSubcategories, subcategory.id]
                                        },
                                        ...(triggerCategory && {
                                          [triggerCategory.id]: {
                                            subcategory_ids: []
                                          }
                                        })
                                      }
                                    })
                                  }
                                }
                              }}><span>{subcategory.title}</span></Button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
};

export default FilterDisplay;