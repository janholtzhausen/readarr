import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { cloneElement, useCallback, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { QUALITY_PROFILE_ITEM } from 'Helpers/dragTypes';
import QualityProfileItem from './QualityProfileItem';
import QualityProfileItemGroup from './QualityProfileItemGroup';
import styles from './QualityProfileItemDragSource.css';

function QualityProfileItemDragSource(props) {
  const {
    editGroups,
    groupId,
    qualityId,
    name,
    allowed,
    items,
    qualityIndex,
    isDraggingUp,
    isDraggingDown,
    onCreateGroupPress,
    onDeleteGroupPress,
    onQualityProfileItemAllowedChange,
    onItemGroupAllowedChange,
    onItemGroupNameChange,
    onQualityProfileItemDragMove,
    onQualityProfileItemDragEnd
  } = props;

  const ref = useRef(null);

  const [{ isOver, isOverCurrent }, dropRef] = useDrop({
    accept: QUALITY_PROFILE_ITEM,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true })
    }),
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const {
        qualityIndex: dragQualityIndex,
        isGroup: isDragGroup
      } = item;

      const dropQualityIndex = qualityIndex;
      const isDropGroupItem = !!(qualityId && groupId);
      const childNodeIndex = isOverCurrent && isDraggingUp ? 1 : 0;
      const componentDOMNode = ref.current.children[childNodeIndex] ?? null;

      if (!componentDOMNode) {
        return;
      }

      const hoverBoundingRect = componentDOMNode.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      if (!monitor.isOver({ shallow: true })) {
        return;
      }

      if (dragQualityIndex === dropQualityIndex) {
        return;
      }

      if (isDragGroup && isDropGroupItem) {
        return;
      }

      let dropPosition = null;

      if (hoverClientY > hoverMiddleY) {
        dropPosition = 'below';
      } else if (hoverClientY < hoverMiddleY) {
        dropPosition = 'above';
      } else {
        return;
      }

      onQualityProfileItemDragMove({
        dragQualityIndex,
        dropQualityIndex,
        dropPosition
      });
    }
  });

  const [{ isDragging }, dragRef] = useDrag({
    type: QUALITY_PROFILE_ITEM,
    item: () => ({
      editGroups,
      qualityIndex,
      groupId,
      qualityId,
      isGroup: !qualityId,
      name,
      allowed
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (_item, monitor) => {
      onQualityProfileItemDragEnd(monitor.didDrop());
    }
  });

  const connectDragSource = useCallback((element) => {
    return cloneElement(element, { ref: dragRef });
  }, [dragRef]);

  dropRef(ref);

  const isBefore = !isDragging && isDraggingUp && isOverCurrent;
  const isAfter = !isDragging && isDraggingDown && isOverCurrent;

  return (
    <div
      ref={ref}
      className={classNames(
        styles.qualityProfileItemDragSource,
        isBefore && styles.isDraggingUp,
        isAfter && styles.isDraggingDown
      )}
    >
      {
        isBefore &&
          <div
            className={classNames(
              styles.qualityProfileItemPlaceholder,
              styles.qualityProfileItemPlaceholderBefore
            )}
          />
      }

      {
        !!groupId && qualityId == null &&
          <QualityProfileItemGroup
            editGroups={editGroups}
            groupId={groupId}
            name={name}
            allowed={allowed}
            items={items}
            qualityIndex={qualityIndex}
            isDragging={isDragging}
            isDraggingUp={isDraggingUp}
            isDraggingDown={isDraggingDown}
            connectDragSource={connectDragSource}
            onDeleteGroupPress={onDeleteGroupPress}
            onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
            onItemGroupAllowedChange={onItemGroupAllowedChange}
            onItemGroupNameChange={onItemGroupNameChange}
            onQualityProfileItemDragMove={onQualityProfileItemDragMove}
            onQualityProfileItemDragEnd={onQualityProfileItemDragEnd}
          />
      }

      {
        qualityId != null &&
          <QualityProfileItem
            editGroups={editGroups}
            groupId={groupId}
            qualityId={qualityId}
            name={name}
            allowed={allowed}
            qualityIndex={qualityIndex}
            isDragging={isDragging}
            isOverCurrent={isOverCurrent}
            connectDragSource={connectDragSource}
            onCreateGroupPress={onCreateGroupPress}
            onQualityProfileItemAllowedChange={onQualityProfileItemAllowedChange}
          />
      }

      {
        isAfter &&
          <div
            className={classNames(
              styles.qualityProfileItemPlaceholder,
              styles.qualityProfileItemPlaceholderAfter
            )}
          />
      }
    </div>
  );
}

QualityProfileItemDragSource.propTypes = {
  editGroups: PropTypes.bool,
  groupId: PropTypes.number,
  qualityId: PropTypes.number,
  name: PropTypes.string.isRequired,
  allowed: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object),
  qualityIndex: PropTypes.string.isRequired,
  isDraggingUp: PropTypes.bool,
  isDraggingDown: PropTypes.bool,
  onCreateGroupPress: PropTypes.func,
  onDeleteGroupPress: PropTypes.func,
  onQualityProfileItemAllowedChange: PropTypes.func,
  onItemGroupAllowedChange: PropTypes.func,
  onItemGroupNameChange: PropTypes.func,
  onQualityProfileItemDragMove: PropTypes.func.isRequired,
  onQualityProfileItemDragEnd: PropTypes.func.isRequired
};

export default QualityProfileItemDragSource;
