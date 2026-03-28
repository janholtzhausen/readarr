import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import Measure from 'Components/Measure';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import styles from './VirtualTable.css';
import WindowScroller from './WindowScrollerShim';

const ROW_HEIGHT = 38;

function VirtualTableList(props) {
  const {
    width,
    height,
    items,
    rowHeight,
    estimatedRowSize,
    overscanRowCount,
    rowRenderer,
    onRecompute,
    scrollIndex,
    initialScrollTop,
    externalScrollTop,
    onChildScroll
  } = props;

  const listRef = useRef(null);
  const [scrollRestored, setScrollRestored] = useState(false);

  const isVariableHeight = typeof rowHeight === 'function';
  const ListComponent = isVariableHeight ? VariableSizeList : FixedSizeList;

  useEffect(() => {
    if (!listRef.current || !width) {
      return;
    }

    onRecompute(width);

    if (typeof listRef.current.resetAfterIndex === 'function') {
      listRef.current.resetAfterIndex(0, true);
    }
  }, [items, width, onRecompute]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTo(externalScrollTop);
  }, [externalScrollTop]);

  useEffect(() => {
    if (!listRef.current || initialScrollTop == null || initialScrollTop === 0 || scrollRestored) {
      return;
    }

    setScrollRestored(true);
    listRef.current.scrollTo(initialScrollTop);
    onChildScroll({ scrollTop: initialScrollTop });
  }, [initialScrollTop, onChildScroll, scrollRestored]);

  useEffect(() => {
    if (initialScrollTop == null || initialScrollTop === 0) {
      setScrollRestored(false);
    }
  }, [initialScrollTop]);

  useEffect(() => {
    if (scrollIndex == null || !listRef.current) {
      return;
    }

    listRef.current.scrollToItem(scrollIndex, 'start');
  }, [scrollIndex]);

  const renderRow = ({ index, style }) => {
    return rowRenderer({
      key: items[index] ? `row-${items[index].id ?? index}` : `row-${index}`,
      rowIndex: index,
      style
    });
  };

  return (
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
      itemSize={rowHeight}
      estimatedItemSize={estimatedRowSize}
      overscanCount={overscanRowCount}
      onScroll={({ scrollOffset, scrollUpdateWasRequested }) => {
        if (!scrollUpdateWasRequested) {
          onChildScroll({ scrollTop: scrollOffset });
        }
      }}
    >
      {renderRow}
    </ListComponent>
  );
}

VirtualTableList.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowHeight: PropTypes.oneOfType([PropTypes.func, PropTypes.number]).isRequired,
  estimatedRowSize: PropTypes.number.isRequired,
  overscanRowCount: PropTypes.number.isRequired,
  rowRenderer: PropTypes.func.isRequired,
  onRecompute: PropTypes.func.isRequired,
  scrollIndex: PropTypes.number,
  initialScrollTop: PropTypes.number,
  externalScrollTop: PropTypes.number.isRequired,
  onChildScroll: PropTypes.func.isRequired
};

function VirtualTable(props) {
  const {
    isSmallScreen,
    className = styles.tableContainer,
    items,
    scrollIndex,
    scrollTop,
    scroller,
    header,
    rowHeight = ROW_HEIGHT,
    rowRenderer,
    overscanRowCount = 2,
    onRecompute = () => {},
    headerHeight = 38,
    estimatedRowSize = ROW_HEIGHT
  } = props;

  const [width, setWidth] = useState(0);

  return (
    <WindowScroller
      scrollElement={isSmallScreen ? undefined : scroller}
    >
      {({ height, registerChild, onChildScroll, scrollTop: externalScrollTop }) => {
        if (!height) {
          return null;
        }

        const availableHeight = Math.max(height - headerHeight, estimatedRowSize);

        return (
          <Measure onMeasure={({ width: nextWidth }) => setWidth(nextWidth)}>
            <Scroller
              className={className}
              scrollDirection={scrollDirections.HORIZONTAL}
            >
              {header}

              <div ref={registerChild}>
                {
                  width > 0 ?
                    <VirtualTableList
                      width={width}
                      height={availableHeight}
                      items={items}
                      rowHeight={rowHeight}
                      estimatedRowSize={estimatedRowSize}
                      overscanRowCount={overscanRowCount}
                      rowRenderer={rowRenderer}
                      onRecompute={onRecompute}
                      scrollIndex={scrollIndex}
                      initialScrollTop={scrollTop}
                      externalScrollTop={externalScrollTop}
                      onChildScroll={onChildScroll}
                    /> :
                    null
                }
              </div>
            </Scroller>
          </Measure>
        );
      }}
    </WindowScroller>
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
  headerHeight: PropTypes.number,
  estimatedRowSize: PropTypes.number
};

export default VirtualTable;
