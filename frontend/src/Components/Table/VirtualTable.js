import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import Measure from 'Components/Measure';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import styles from './VirtualTable.css';

function VirtualTable(props) {
  const {
    isSmallScreen,
    className = styles.tableContainer,
    items,
    scrollIndex,
    scrollTop,
    scroller,
    header,
    rowHeight = 38,
    rowRenderer,
    overscanRowCount = 2,
    onRecompute = () => {},
    headerHeight = 38
  } = props;

  const listRef = useRef(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [scrollRestored, setScrollRestored] = useState(false);

  const isVariableHeight = typeof rowHeight === 'function';
  const ListComponent = isVariableHeight ? VariableSizeList : FixedSizeList;
  const itemSize = useMemo(() => {
    return isVariableHeight ? rowHeight : rowHeight;
  }, [isVariableHeight, rowHeight]);

  useEffect(() => {
    if (!width) {
      return;
    }

    onRecompute(width);

    if (listRef.current) {
      if (isVariableHeight && typeof listRef.current.resetAfterIndex === 'function') {
        listRef.current.resetAfterIndex(0, true);
      } else if (typeof listRef.current.resetAfterIndex === 'function') {
        listRef.current.resetAfterIndex(0, true);
      }
    }
  }, [items, width, isVariableHeight, onRecompute]);

  useEffect(() => {
    if (!listRef.current || scrollTop == null || scrollTop === 0 || scrollRestored) {
      return;
    }

    setScrollRestored(true);
    listRef.current.scrollTo(scrollTop);
  }, [scrollTop, scrollRestored]);

  useEffect(() => {
    if (scrollTop == null || scrollTop === 0) {
      setScrollRestored(false);
    }
  }, [scrollTop]);

  useEffect(() => {
    if (scrollIndex == null || !listRef.current) {
      return;
    }

    listRef.current.scrollToItem(scrollIndex, 'start');
  }, [scrollIndex]);

  useEffect(() => {
    if (!scroller) {
      return undefined;
    }

    const currentScroller = scroller;
    const updateHeight = () => {
      const nextHeight = Math.max(
        (isSmallScreen ? window.innerHeight : currentScroller.clientHeight) - headerHeight,
        typeof rowHeight === 'number' ? rowHeight : 38
      );

      setHeight(nextHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [headerHeight, isSmallScreen, rowHeight, scroller]);

  const renderRow = ({ index, style }) => {
    return rowRenderer({
      key: items[index] ? `row-${items[index].id ?? index}` : `row-${index}`,
      rowIndex: index,
      style
    });
  };

  return (
    <Measure onMeasure={({ width: nextWidth }) => setWidth(nextWidth)}>
      <Scroller
        className={className}
        scrollDirection={scrollDirections.HORIZONTAL}
      >
        {header}

        {
          width > 0 && height > 0 ?
            <ListComponent
              ref={listRef}
              className={styles.tableBodyContainer}
              style={{
                width: '100%',
                overflowX: 'hidden'
              }}
              width={width}
              height={height}
              itemCount={items.length}
              itemSize={itemSize}
              overscanCount={overscanRowCount}
            >
              {renderRow}
            </ListComponent> :
            null
        }
      </Scroller>
    </Measure>
  );
}

VirtualTable.propTypes = {
  isSmallScreen: PropTypes.bool.isRequired,
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  scrollIndex: PropTypes.number,
  scrollTop: PropTypes.number,
  scroller: PropTypes.instanceOf(Element).isRequired,
  header: PropTypes.node.isRequired,
  rowHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]).isRequired,
  rowRenderer: PropTypes.func.isRequired,
  overscanRowCount: PropTypes.number,
  onRecompute: PropTypes.func,
  headerHeight: PropTypes.number
};

export default VirtualTable;
