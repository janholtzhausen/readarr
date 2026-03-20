import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { cloneElement, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { TABLE_COLUMN } from 'Helpers/dragTypes';
import TableOptionsColumn from './TableOptionsColumn';
import styles from './TableOptionsColumnDragSource.css';

function TableOptionsColumnDragSource(props) {
  const {
    name,
    label,
    isVisible,
    isModifiable,
    index,
    isDraggingUp,
    isDraggingDown,
    onVisibleChange,
    onColumnDragMove,
    onColumnDragEnd
  } = props;

  const ref = useRef(null);

  const [{ isOver }, dropRef] = useDrop({
    accept: TABLE_COLUMN,
    collect: (monitor) => ({
      isOver: monitor.isOver()
    }),
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      onColumnDragMove(dragIndex, hoverIndex);
    }
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: TABLE_COLUMN,
    item: () => ({
      name,
      index
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (_item, monitor) => {
      onColumnDragEnd(_item, monitor.didDrop());
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
        styles.columnDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {
        isBefore &&
          <div
            className={classNames(
              styles.columnPlaceholder,
              styles.columnPlaceholderBefore
            )}
          />
      }

      <TableOptionsColumn
        name={name}
        label={typeof label === 'function' ? label() : label}
        isVisible={isVisible}
        isModifiable={isModifiable}
        index={index}
        isDragging={isDragging}
        connectDragSource={connectDragSource}
        onVisibleChange={onVisibleChange}
      />

      {
        isAfter &&
          <div
            className={classNames(
              styles.columnPlaceholder,
              styles.columnPlaceholderAfter
            )}
          />
      }
    </div>
  );
}

TableOptionsColumnDragSource.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  isVisible: PropTypes.bool.isRequired,
  isModifiable: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onVisibleChange: PropTypes.func.isRequired,
  onColumnDragMove: PropTypes.func.isRequired,
  onColumnDragEnd: PropTypes.func.isRequired
};

export default TableOptionsColumnDragSource;
