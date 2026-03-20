import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeGrid } from 'react-window';
import AuthorIndexItemConnector from 'Author/Index/AuthorIndexItemConnector';
import Measure from 'Components/Measure';
import dimensions from 'Styles/Variables/dimensions';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';
import AuthorIndexPoster from './AuthorIndexPoster';

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

  if (showTitle !== 'no') {
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
  return Math.ceil(posterWidth);
}

function getWindowScrollTopPosition() {
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function AuthorIndexPosters(props) {
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

  const gridRef = useRef(null);
  const [width, setWidth] = useState(0);
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
    if (scrollTop && gridRef.current) {
      gridRef.current.scrollTo({ scrollLeft: 0, scrollTop });
    }
  }, [scrollTop]);

  useEffect(() => {
    if (jumpToCharacter == null || !gridRef.current) {
      return;
    }

    const index = getIndexOfFirstCharacter(items, sortKey, jumpToCharacter);

    if (index != null) {
      const rowIndex = Math.floor(index / columnCount);
      gridRef.current.scrollToItem({
        rowIndex,
        columnIndex: 0,
        align: 'start'
      });
    }
  }, [items, sortKey, jumpToCharacter, columnCount]);

  useEffect(() => {
    if (!scroller) {
      return undefined;
    }

    const currentScrollListener = isSmallScreen ? window : scroller;

    const handleScroll = () => {
      const { offsetTop = 0 } = scroller;
      const nextScrollTop =
        (isSmallScreen ? getWindowScrollTopPosition() : scroller.scrollTop) - offsetTop;

      gridRef.current?.scrollTo({ scrollLeft: 0, scrollTop: nextScrollTop });
    };

    currentScrollListener.addEventListener('scroll', handleScroll);

    return () => {
      currentScrollListener.removeEventListener('scroll', handleScroll);
    };
  }, [isSmallScreen, scroller]);

  const cellRenderer = ({ columnIndex, rowIndex, style }) => {
    const authorIdx = rowIndex * columnCount + columnIndex;
    const author = items[authorIdx];

    if (!author) {
      return null;
    }

    const {
      detailedProgressBar,
      showTitle,
      showMonitored,
      showQualityProfile
    } = posterOptions;

    return (
      <div
        style={{
          ...style,
          padding
        }}
      >
        <AuthorIndexItemConnector
          key={author.id}
          component={AuthorIndexPoster}
          sortKey={sortKey}
          posterWidth={posterWidth}
          posterHeight={posterHeight}
          detailedProgressBar={detailedProgressBar}
          showTitle={showTitle}
          showMonitored={showMonitored}
          showQualityProfile={showQualityProfile}
          showRelativeDates={showRelativeDates}
          shortDateFormat={shortDateFormat}
          timeFormat={timeFormat}
          style={style}
          authorId={author.id}
          qualityProfileId={author.qualityProfileId}
          metadataProfileId={author.metadataProfileId}
          isSelected={selectedState[author.id]}
          onSelectedChange={onSelectedChange}
          isEditorActive={isEditorActive}
        />
      </div>
    );
  };

  return (
    <Measure onMeasure={({ width: nextWidth }) => setWidth(nextWidth)}>
      {
        width > 0 ?
          <FixedSizeGrid
            ref={gridRef}
            style={{
              width: '100%',
              overflowX: 'hidden',
              overflowY: 'hidden'
            }}
            width={width}
            height={window.innerHeight}
            columnCount={columnCount}
            columnWidth={columnWidth}
            rowCount={Math.ceil(items.length / columnCount)}
            rowHeight={rowHeight}
          >
            {cellRenderer}
          </FixedSizeGrid> :
          <div />
      }
    </Measure>
  );
}

AuthorIndexPosters.propTypes = {
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

export default AuthorIndexPosters;
