import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookIndexItemConnector from 'Book/Index/BookIndexItemConnector';
import Measure from 'Components/Measure';
import dimensions from 'Styles/Variables/dimensions';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';
import BookIndexPoster from './BookIndexPoster';
import styles from './BookIndexPosters.css';

const columnPadding = parseInt(dimensions.authorIndexColumnPadding);
const columnPaddingSmallScreen = parseInt(dimensions.authorIndexColumnPaddingSmallScreen);
const progressBarHeight = parseInt(dimensions.progressBarSmallHeight);
const detailedProgressBarHeight = parseInt(dimensions.progressBarMediumHeight);

const additionalColumnCount = {
  small: 3,
  medium: 2,
  large: 1
};

function calculateColumnWidth(width, posterSize, isSmallScreen) {
  const maxiumColumnWidth = isSmallScreen ? 172 : 182;
  const columns = Math.max(Math.floor(width / maxiumColumnWidth), 1);
  const remainder = width % maxiumColumnWidth;

  if (remainder === 0 && posterSize === 'large') {
    return maxiumColumnWidth;
  }

  return Math.floor(width / (columns + additionalColumnCount[posterSize]));
}

function calculateRowHeight(posterHeight, sortKey, isSmallScreen, posterOptions) {
  const {
    detailedProgressBar,
    showTitle,
    showAuthor,
    showMonitored,
    showQualityProfile
  } = posterOptions;

  const nextAiringHeight = 19;

  const heights = [
    posterHeight,
    detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
    nextAiringHeight,
    isSmallScreen ? columnPaddingSmallScreen : columnPadding
  ];

  if (showTitle) {
    heights.push(19);
  }

  if (showAuthor) {
    heights.push(19);
  }

  if (showMonitored) {
    heights.push(19);
  }

  if (showQualityProfile) {
    heights.push(19);
  }

  switch (sortKey) {
    case 'seasons':
    case 'previousAiring':
    case 'added':
    case 'path':
    case 'sizeOnDisk':
      heights.push(19);
      break;
    case 'qualityProfileId':
      if (!showQualityProfile) {
        heights.push(19);
      }
      break;
    default:
  }

  return heights.reduce((acc, height) => acc + height, 0);
}

function calculatePosterHeight(posterWidth) {
  return Math.ceil((400 / 256) * posterWidth);
}

function BookIndexPosters(props) {
  const {
    items,
    sortKey,
    posterOptions,
    jumpToCharacter,
    scrollTop,
    showRelativeDates,
    shortDateFormat,
    timeFormat,
    selectedState,
    isEditorActive,
    isSmallScreen,
    scroller,
    onSelectedChange
  } = props;

  const [width, setWidth] = useState(0);
  const itemRefs = useRef([]);
  const padding = isSmallScreen ? columnPaddingSmallScreen : columnPadding;

  const columnWidth = useMemo(() => {
    return calculateColumnWidth(width || 182, posterOptions.size, isSmallScreen);
  }, [width, posterOptions.size, isSmallScreen]);

  const columnCount = useMemo(() => {
    return Math.max(Math.floor((width || columnWidth) / columnWidth), 1);
  }, [width, columnWidth]);

  const posterWidth = columnWidth - padding * 2;
  const posterHeight = calculatePosterHeight(posterWidth);
  const rowHeight = useMemo(() => {
    return calculateRowHeight(posterHeight, sortKey, isSmallScreen, posterOptions);
  }, [posterHeight, sortKey, isSmallScreen, posterOptions]);

  useEffect(() => {
    if (scrollTop == null) {
      return;
    }

    const scrollTarget = isSmallScreen ? window : scroller;

    if (scrollTarget && scrollTop >= 0) {
      scrollTarget.scrollTo(0, scrollTop);
    }
  }, [isSmallScreen, scrollTop, scroller]);

  useEffect(() => {
    if (jumpToCharacter == null) {
      return;
    }

    const index = getIndexOfFirstCharacter(items, sortKey, jumpToCharacter);

    if (index != null) {
      itemRefs.current[index]?.scrollIntoView({
        block: 'start'
      });
    }
  }, [items, sortKey, jumpToCharacter]);

  const renderedItems = items.map((book, index) => {
    const cellStyle = {
      padding
    };

    const {
      detailedProgressBar,
      showTitle,
      showAuthor,
      showMonitored,
      showQualityProfile
    } = posterOptions;

    return (
      <div
        key={book.id}
        ref={(element) => {
          itemRefs.current[index] = element;
        }}
        className={styles.cell}
        style={cellStyle}
      >
        <BookIndexItemConnector
          component={BookIndexPoster}
          sortKey={sortKey}
          posterWidth={posterWidth}
          posterHeight={posterHeight}
          detailedProgressBar={detailedProgressBar}
          showTitle={showTitle}
          showAuthor={showAuthor}
          showMonitored={showMonitored}
          showQualityProfile={showQualityProfile}
          showRelativeDates={showRelativeDates}
          shortDateFormat={shortDateFormat}
          timeFormat={timeFormat}
          style={style}
          bookId={book.id}
          authorId={book.authorId}
          isSelected={selectedState[book.id]}
          onSelectedChange={onSelectedChange}
          isEditorActive={isEditorActive}
        />
      </div>
    );
  });

  const gridStyle = {
    gridTemplateColumns: `repeat(${columnCount}, minmax(0, ${columnWidth}px))`
  };

  return (
    <Measure onMeasure={({ width: nextWidth }) => setWidth(nextWidth)}>
      {
        width > 0 ? (
          <div className={styles.grid} style={gridStyle}>
            {renderedItems}
          </div>
        ) : (
          <div />
        )
      }
    </Measure>
  );
}

BookIndexPosters.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string,
  posterOptions: PropTypes.object.isRequired,
  jumpToCharacter: PropTypes.string,
  scrollTop: PropTypes.number,
  showRelativeDates: PropTypes.bool.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  selectedState: PropTypes.object.isRequired,
  isEditorActive: PropTypes.bool.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  scroller: PropTypes.instanceOf(Element).isRequired,
  onSelectedChange: PropTypes.func.isRequired
};

export default BookIndexPosters;
