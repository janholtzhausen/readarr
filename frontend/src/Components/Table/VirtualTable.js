import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import Measure from 'Components/Measure';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import styles from './VirtualTable.css';

function getWindowScrollTopPosition() {
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function VirtualTable(props) {
  const {
    isSmallScreen,
    className,
    items,
    scrollIndex,
    scrollTop,
    scroller,
    header,
    rowHeight,
    rowRenderer,
    overscanRowCount,
    onRecompute
  } = props;

  const listRef = useRef(null);
  const [width, setWidth] = useState(0);
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
    const currentScrollListener = isSmallScreen ? window : currentScroller;

    const handleScroll = () => {
      const { offsetTop = 0 } = currentScroller;
      const nextScrollTop =
        (isSmallScreen
          ? getWindowScrollTopPosition()
          : currentScroller.scrollTop) - offsetTop;

      listRef.current?.scrollTo(nextScrollTop);
    };

    currentScrollListener.addEventListener('scroll', handleScroll);

    return () => {
      currentScrollListener.removeEventListener('scroll', handleScroll);
    };
  }, [isSmallScreen, scroller]);

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
          width > 0 ?
            <ListComponent
              ref={listRef}
              className={styles.tableBodyContainer}
              style={{
                width: '100%',
                overflowX: 'hidden',
                overflowY: 'hidden'
              }}
              width={width}
              height={window.innerHeight}
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
  onRecompute: PropTypes.func
};

VirtualTable.defaultProps = {
  className: styles.tableContainer,
  overscanRowCount: 2,
  onRecompute: () => {}
};

export default VirtualTable;
