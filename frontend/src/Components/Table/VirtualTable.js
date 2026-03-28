import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import Measure from 'Components/Measure';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import styles from './VirtualTable.css';

const ROW_HEIGHT = 38;

function VirtualTable(props) {
  const {
    className = styles.tableContainer,
    items,
    scrollIndex,
    header,
    rowHeight = ROW_HEIGHT,
    rowRenderer,
    onRecompute = () => {}
  } = props;

  const [width, setWidth] = useState(0);
  const rowRefs = useRef([]);

  useEffect(() => {
    onRecompute(width);
  }, [onRecompute, width]);

  useEffect(() => {
    if (scrollIndex == null) {
      return;
    }

    rowRefs.current[scrollIndex]?.scrollIntoView({
      block: 'start'
    });
  }, [scrollIndex]);

  return (
    <Measure
      onMeasure={({ width: nextWidth }) => {
        setWidth(nextWidth);
      }}
    >
      <Scroller
        className={className}
        scrollDirection={scrollDirections.HORIZONTAL}
      >
        {header}

        <div className={styles.tableBodyContainer}>
          {
            items.map((item, index) => {
              return (
                <div
                  key={`row-wrapper-${item.id ?? index}`}
                  ref={(element) => {
                    rowRefs.current[index] = element;
                  }}
                >
                  {rowRenderer({
                    key: `row-${item.id ?? index}`,
                    rowIndex: index,
                    style: {
                      height: rowHeight,
                      width: width || '100%'
                    }
                  })}
                </div>
              );
            })
          }
        </div>
      </Scroller>
    </Measure>
  );
}

VirtualTable.propTypes = {
  className: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  scrollIndex: PropTypes.number,
  header: PropTypes.node.isRequired,
  rowHeight: PropTypes.number,
  rowRenderer: PropTypes.func.isRequired,
  onRecompute: PropTypes.func
};

export default VirtualTable;
