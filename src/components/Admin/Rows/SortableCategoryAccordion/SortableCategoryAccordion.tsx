import { useSortable } from "@dnd-kit/react/sortable";
import { CollisionDetector, CollisionPriority, CollisionType } from '@dnd-kit/abstract';


  type SortableType = 'category' | 'subcategory';

  interface Category {
    id: number;
    name: string;
    subcategories: Subcategory[];
  }

  interface Subcategory {
    id: number;
    name: string;
  }

  const verticalEdgeDetector: CollisionDetector = ({ dragOperation, droppable }) => {
    const { shape, source } = dragOperation;

    if (!shape || !droppable.shape || droppable.id === source?.id) {
      return null;
    }

    const activeRect = shape.current.boundingRectangle;
    const initialRect = shape.initial.boundingRectangle;
    const targetRect = droppable.shape.boundingRectangle;
    const targetMidpoint = (targetRect.top + targetRect.bottom) / 2;

    const isMovingDown = activeRect.top > initialRect.top;

    if (isMovingDown) {
      if (activeRect.bottom >= targetMidpoint && activeRect.top < targetMidpoint) {
        const value = activeRect.bottom - targetMidpoint;
        return { id: droppable.id, value, type: CollisionType.Collision, priority: CollisionPriority.Normal };
      }
    } else {
      if (activeRect.top <= targetMidpoint && activeRect.bottom > targetMidpoint) {
        const value = targetMidpoint - activeRect.top;
        return { id: droppable.id, value, type: CollisionType.Collision, priority: CollisionPriority.Normal };
      }
    }

    return null;
  };

const SortableCategoryAccordion = ({ category, headerRenderFn, index }: any) => {
  

  const { ref, handleRef } = useSortable({
    id: category.id,
    index,
    type: 'category' satisfies SortableType,
    accept: 'category' satisfies SortableType,
    collisionDetector: verticalEdgeDetector,
    transition: {
      duration: 0,
      easing: 'ease-out',
      idle: false,
    },
  });

  return (
    <div ref={ref}>
      {headerRenderFn(handleRef)}
    </div>
  );
};

export default SortableCategoryAccordion;