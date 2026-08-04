
import Row from "../Row/Row";
import { CollisionDetector, CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import { useSortable } from "@dnd-kit/react/sortable";
import { RestrictToElement } from '@dnd-kit/dom/modifiers';

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

const SortableTypeRow = ({photoType, index, container, ...rowProps}: any) => {
 const { ref, handleRef } = useSortable({
    id: photoType.id,
    index,
    type: 'type',
    accept: 'type',
    collisionDetector: verticalEdgeDetector,
    modifiers: [
      RestrictToElement.configure({
        element: () => container.current,
      })
    ],
    transition: {
      duration: 0,
      easing: 'ease-out',
      idle: false,
    },
  });

  return (
    <div ref={ref}>
      <Row {...rowProps} dragHandleRef={handleRef}  />
    </div>
  )
};

export default SortableTypeRow