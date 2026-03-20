import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FixedSizeList } from 'react-window';
import AuthorIndexItemConnector from 'Author/Index/AuthorIndexItemConnector';
import Measure from 'Components/Measure';
import dimensions from 'Styles/Variables/dimensions';
import getIndexOfFirstCharacter from 'Utilities/Array/getIndexOfFirstCharacter';
import AuthorIndexOverview from './AuthorIndexOverview';

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
  return posterWidth;
}

function getWindowScrollTopPosition() {
  return document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function AuthorIndexOverviews(props) {
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

  const listRef = useRef(null);
  const [width, setWidth] = useState(0);

  const posterWidth = useMemo(() => {
    return calculatePosterWidth(overviewOptions.size, isSmallScreen);
  }, [overviewOptions.size, isSmallScreen]);

  const posterHeight = useMemo(() => calculatePosterHeight(posterWidth), [posterWidth]);
  const rowHeight = useMemo(() => {
    return calculateRowHeight(posterHeight, isSmallScreen, overviewOptions);
  }, [posterHeight, isSmallScreen, overviewOptions]);

  useEffect(() => {
    if (scrollTop && listRef.current) {
      listRef.current.scrollTo(scrollTop);
    }
  }, [scrollTop]);

  useEffect(() => {
    if (jumpToCharacter == null || !listRef.current) {
      return;
    }

    const index = getIndexOfFirstCharacter(items, sortKey, jumpToCharacter);

    if (index != null) {
      listRef.current.scrollToItem(index, 'start');
    }
  }, [items, sortKey, jumpToCharacter]);

  useEffect(() => {
    if (!scroller) {
      return undefined;
    }

    const currentScrollListener = isSmallScreen ? window : scroller;

    const handleScroll = () => {
      const { offsetTop = 0 } = scroller;
      const nextScrollTop =
        (isSmallScreen ? getWindowScrollTopPosition() : scroller.scrollTop) - offsetTop;

      listRef.current?.scrollTo(nextScrollTop);
    };

    currentScrollListener.addEventListener('scroll', handleScroll);

    return () => {
      currentScrollListener.removeEventListener('scroll', handleScroll);
    };
  }, [isSmallScreen, scroller]);

  const rowRenderer = ({ index, style }) => {
    const author = items[index];

    if (!author) {
      return null;
    }

    return (
      <div style={style}>
        <AuthorIndexItemConnector
          key={author.id}
          component={AuthorIndexOverview}
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
          <FixedSizeList
            ref={listRef}
            style={{
              width: '100%',
              overflowX: 'hidden',
              overflowY: 'hidden'
            }}
            width={width}
            height={window.innerHeight}
            itemCount={items.length}
            itemSize={rowHeight}
          >
            {rowRenderer}
          </FixedSizeList> :
          <div />
      }
    </Measure>
  );
}

AuthorIndexOverviews.propTypes = {
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

export default AuthorIndexOverviews;
