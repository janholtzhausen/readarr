import { throttle } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';
import Measure from 'Components/Measure';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import styles from './VirtualTable.css';

const ROW_HEIGHT = 38;

function getWindowScrollTopPosition() {
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

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
    headerHeight = 38
  } = props;

  const listRef = useRef(null);
  const wrapperRef = useRef(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const currentScroller = scroller;

    if (!currentScroller) {
      return;
    }

    const nextWidth = currentScroller.clientWidth;
    const nextHeight = isSmallScreen ? window.innerHeight : currentScroller.clientHeight;

    setSize({
      width: nextWidth,
      height: nextHeight
    });

    onRecompute(nextWidth);
  }, [isSmallScreen, onRecompute, scroller]);

  useEffect(() => {
    const currentScroller = scroller;

    if (!currentScroller || !listRef.current) {
      return undefined;
    }

    const scrollListener = isSmallScreen ? window : currentScroller;

    const handleScroll = throttle(() => {
      const offsetTop = wrapperRef.current?.offsetTop ?? 0;
      const nextScrollTop = (isSmallScreen ? getWindowScrollTopPosition() : currentScroller.scrollTop) - offsetTop;

      listRef.current?.scrollTo(Math.max(nextScrollTop, 0));
    }, 10);

    scrollListener.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      handleScroll.cancel();
      scrollListener.removeEventListener('scroll', handleScroll);
    };
  }, [isSmallScreen, scroller]);

  useEffect(() => {
    if (scrollTop == null || scrollTop === 0 || !listRef.current) {
      return;
    }

    listRef.current.scrollTo(scrollTop);
  }, [scrollTop]);

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

  const availableHeight = Math.max(size.height - headerHeight, rowHeight);

  return (
    <Measure
      onMeasure={() => {
        if (!scroller) {
          return;
        }

        const nextWidth = scroller.clientWidth;
        const nextHeight = isSmallScreen ? window.innerHeight : scroller.clientHeight;

        setSize({
          width: nextWidth,
          height: nextHeight
        });

        onRecompute(nextWidth);
      }}
    >
      <Scroller
        className={className}
        scrollDirection={scrollDirections.HORIZONTAL}
      >
        {header}

        <div ref={wrapperRef}>
          {
            size.width > 0 ?
              <FixedSizeList
                ref={listRef}
                className={styles.tableBodyContainer}
                style={{
                  width: '100%',
                  height: '100%',
                  overflow: 'visible'
                }}
                width={size.width}
                height={availableHeight}
                itemCount={items.length}
                itemSize={rowHeight}
                overscanCount={overscanRowCount}
              >
                {renderRow}
              </FixedSizeList> :
              null
          }
        </div>
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
  rowHeight: PropTypes.number.isRequired,
  rowRenderer: PropTypes.func.isRequired,
  overscanRowCount: PropTypes.number,
  onRecompute: PropTypes.func,
  headerHeight: PropTypes.number
};

export default VirtualTable;
