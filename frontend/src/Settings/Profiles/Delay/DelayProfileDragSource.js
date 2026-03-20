import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { cloneElement, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { DELAY_PROFILE } from 'Helpers/dragTypes';
import DelayProfile from './DelayProfile';
import styles from './DelayProfileDragSource.css';

function DelayProfileDragSource(props) {
  const {
    id,
    order,
    isDraggingUp,
    isDraggingDown,
    onDelayProfileDragMove,
    onDelayProfileDragEnd,
    ...otherProps
  } = props;

  const ref = useRef(null);

  const [{ isOver }, dropRef] = useDrop({
    accept: DELAY_PROFILE,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    }),
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.order;
      const hoverIndex = order;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY > hoverMiddleY) {
        onDelayProfileDragMove(dragIndex, hoverIndex + 1);
      } else if (dragIndex > hoverIndex && hoverClientY < hoverMiddleY) {
        onDelayProfileDragMove(dragIndex, hoverIndex);
      }
    }
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: DELAY_PROFILE,
    item: () => ({
      id,
      order
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      onDelayProfileDragEnd(item, monitor.didDrop());
    }
  });

  const connectDragSource = useCallback((element) => {
    return cloneElement(element, { ref: dragRef });
  }, [dragRef]);

  dropRef(ref);

  const isBefore = !isDragging && isDraggingUp && isOver;
  const isAfter = !isDragging && isDraggingDown && isOver;

  return (
    <div
      ref={ref}
      className={classNames(
        styles.delayProfileDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {
        isBefore &&
          <div
            className={classNames(
              styles.delayProfilePlaceholder,
              styles.delayProfilePlaceholderBefore
            )}
          />
      }

      <DelayProfile
        id={id}
        order={order}
        isDragging={isDragging}
        isOver={isOver}
        {...otherProps}
        connectDragSource={connectDragSource}
      />

      {
        isAfter &&
          <div
            className={classNames(
              styles.delayProfilePlaceholder,
              styles.delayProfilePlaceholderAfter
            )}
          />
      }
    </div>
  );
}

DelayProfileDragSource.propTypes = {
  id: PropTypes.number.isRequired,
  order: PropTypes.number.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onDelayProfileDragMove: PropTypes.func.isRequired,
  onDelayProfileDragEnd: PropTypes.func.isRequired
};

export default DelayProfileDragSource;
