import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import BookIndexItemConnector from 'Book/Index/BookIndexItemConnector';
import Measure from 'Components/Measure';
import dimensions from 'Styles/Variables/dimensions';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';
import BookIndexOverview from './BookIndexOverview';

const columnPadding = parseInt(dimensions.authorIndexColumnPadding);
const columnPaddingSmallScreen = parseInt(dimensions.authorIndexColumnPaddingSmallScreen);
const progressBarHeight = parseInt(dimensions.progressBarSmallHeight);
const detailedProgressBarHeight = parseInt(dimensions.progressBarMediumHeight);

function calculatePosterWidth(posterSize, isSmallScreen) {
  const maxiumPosterWidth = isSmallScreen ? 192 : 202;

  if (posterSize === 'large') {
    return maxiumPosterWidth;
  }

  if (posterSize === 'medium') {
    return Math.floor(maxiumPosterWidth * 0.75);
  }

  return Math.floor(maxiumPosterWidth * 0.5);
}

function calculateRowHeight(posterHeight, isSmallScreen, overviewOptions) {
  const { detailedProgressBar } = overviewOptions;

  return [
    posterHeight,
    detailedProgressBar ? detailedProgressBarHeight : progressBarHeight,
    isSmallScreen ? columnPaddingSmallScreen : columnPadding
  ].reduce((acc, height) => acc + height, 0);
}

function calculatePosterHeight(posterWidth) {
  return Math.ceil((400 / 256) * posterWidth);
}

function BookIndexOverviews(props) {
  const {
    items,
    sortKey,
    overviewOptions,
    jumpToCharacter,
    scrollTop,
    showRelativeDates,
    shortDateFormat,
    longDateFormat,
    timeFormat,
    isSmallScreen,
    scroller,
    selectedState,
    isEditorActive,
    onSelectedChange
  } = props;

  const itemRefs = useRef([]);
  const [width, setWidth] = useState(0);

  const posterWidth = useMemo(() => {
    return calculatePosterWidth(overviewOptions.size, isSmallScreen);
  }, [overviewOptions.size, isSmallScreen]);

  const posterHeight = useMemo(() => calculatePosterHeight(posterWidth), [posterWidth]);
  const rowHeight = useMemo(() => {
    return calculateRowHeight(posterHeight, isSmallScreen, overviewOptions);
  }, [posterHeight, isSmallScreen, overviewOptions]);

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
    const rowStyle = {
      minHeight: rowHeight
    };

    return (
      <div
        key={book.id}
        ref={(element) => {
          itemRefs.current[index] = element;
        }}
        style={rowStyle}
      >
        <BookIndexItemConnector
          component={BookIndexOverview}
          sortKey={sortKey}
          posterWidth={posterWidth}
          posterHeight={posterHeight}
          rowHeight={rowHeight}
          overviewOptions={overviewOptions}
          showRelativeDates={showRelativeDates}
          shortDateFormat={shortDateFormat}
          longDateFormat={longDateFormat}
          timeFormat={timeFormat}
          isSmallScreen={isSmallScreen}
          bookId={book.id}
          authorId={book.authorId}
          isSelected={selectedState[book.id]}
          onSelectedChange={onSelectedChange}
          isEditorActive={isEditorActive}
        />
      </div>
    );
  });

  return (
    <Measure onMeasure={({ width: nextWidth }) => setWidth(nextWidth)}>
      {
        width > 0 ? renderedItems : <div />
      }
    </Measure>
  );
}

BookIndexOverviews.propTypes = {
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  sortKey: PropTypes.string.isRequired,
  overviewOptions: PropTypes.object.isRequired,
  jumpToCharacter: PropTypes.string,
  scrollTop: PropTypes.number,
  showRelativeDates: PropTypes.bool.isRequired,
  shortDateFormat: PropTypes.string.isRequired,
  longDateFormat: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  isSmallScreen: PropTypes.bool.isRequired,
  scroller: PropTypes.instanceOf(Element).isRequired,
  selectedState: PropTypes.object.isRequired,
  isEditorActive: PropTypes.bool.isRequired,
  onSelectedChange: PropTypes.func.isRequired
};

export default BookIndexOverviews;
