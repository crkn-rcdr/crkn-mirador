import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import BackIcon from '@mui/icons-material/ArrowBackSharp';
import { announce } from '@react-aria/live-announcer';
import { useTranslation } from 'react-i18next';
import SearchHit from '../containers/SearchHit';
import { ScrollTo } from './ScrollTo';

function getCanvasIdFromAnnotation(annotation) {
  if (!annotation?.targetId) return null;
  return annotation.targetId.split('#')[0];
}

function SearchHitsAndAnnotations({
  companionWindowId,
  containerRef,
  searchAnnotations,
  searchHits,
  windowId,
  focused,
  toggleFocus,
  viewer,
  canvases,
  setCanvas,
}) {
  const handleClick = (annotation) => {
    const canvasId = getCanvasIdFromAnnotation(annotation);
    if (!canvasId) return;

    const pageIndex = canvases.findIndex((c) => c.id === canvasId);
    if (pageIndex < 0) return;

    setCanvas(canvasId);
    if (viewer) viewer.goToPage(pageIndex);
  };

  // Combine hits and annotations
  const allItems = [
    ...searchHits.map(hit => ({
      type: 'hit',
      data: hit,
      canvasId: getCanvasIdFromAnnotation(hit.annotations[0]),
      position: hit.position ?? 0,
    })),
    ...searchAnnotations.map(anno => ({
      type: 'annotation',
      data: anno,
      canvasId: getCanvasIdFromAnnotation(anno),
      position: anno.position ?? 0,
    })),
  ];

  // Group by canvasId
  const groupedByCanvas = allItems.reduce((acc, item) => {
    if (!item.canvasId) return acc;
    if (!acc[item.canvasId]) acc[item.canvasId] = [];
    acc[item.canvasId].push(item);
    return acc;
  }, {});

  // Sort each canvas group by position
  Object.keys(groupedByCanvas).forEach(canvasId => {
    groupedByCanvas[canvasId].sort((a, b) => a.position - b.position);
  });

  // Flatten groups, ordered by canvas order
  const sortedItems = Object.keys(groupedByCanvas)
    .sort((a, b) => canvases.findIndex(c => c.id === a) - canvases.findIndex(c => c.id === b))
    .flatMap(canvasId => groupedByCanvas[canvasId]);

  return sortedItems.map((item, index) => {
    if (item.type === 'hit') {
      const annotation = item.data.annotations[0];
      return (
        <SearchHit
          key={annotation.id}
          announcer={announce}
          hit={item.data}
          annotation={annotation}
          annotationId={annotation.id}
          companionWindowId={companionWindowId}
          containerRef={containerRef}
          focused={focused}
          index={index}
          total={sortedItems.length}
          windowId={windowId}
          showDetails={toggleFocus}
          viewer={viewer}
          canvases={canvases}
          setCanvas={setCanvas}
          onClick={() => handleClick(annotation)}
        />
      );
    } else {
      const annotation = item.data;
      return (
        <SearchHit
          key={annotation.id}
          announcer={announce}
          annotation={annotation}
          annotationId={annotation.id}
          companionWindowId={companionWindowId}
          containerRef={containerRef}
          focused={focused}
          index={index}
          total={sortedItems.length}
          windowId={windowId}
          showDetails={toggleFocus}
          viewer={viewer}
          canvases={canvases}
          setCanvas={setCanvas}
          onClick={() => handleClick(annotation)}
        />
      );
    }
  });
}

export function SearchResults({
  companionWindowId,
  containerRef,
  isFetching,
  fetchSearch,
  nextSearch,
  query,
  searchAnnotations,
  searchHits,
  searchNumTotal,
  windowId,
  viewer,
  canvases,
  setCanvas,
}) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const toggleFocus = useCallback(() => setFocused((f) => !f), []);

  const noResultsState = query && !isFetching && searchHits.length === 0 && searchAnnotations.length === 0;

  return (
    <>
      {focused && (
        <ScrollTo containerRef={containerRef} offsetTop={96} scrollTo>
          <Button onClick={toggleFocus} sx={{ textTransform: 'none' }} size="small">
            <BackIcon />
            {t('backToResults')}
          </Button>
        </ScrollTo>
      )}

      {noResultsState && (
        <Typography sx={{ padding: 2, typography: 'h6' }}>{t('searchNoResults')}</Typography>
      )}

      <List disablePadding>
        <SearchHitsAndAnnotations
          companionWindowId={companionWindowId}
          containerRef={containerRef}
          searchAnnotations={searchAnnotations}
          searchHits={searchHits}
          windowId={windowId}
          focused={focused}
          toggleFocus={toggleFocus}
          viewer={viewer}
          canvases={canvases}
          setCanvas={setCanvas}
        />
      </List>

      {nextSearch && (
        <Button
          sx={{ width: '100%' }}
          color="secondary"
          onClick={() => fetchSearch(windowId, companionWindowId, nextSearch, query)}
        >
          {t('moreResults')}
          <br />
          {searchNumTotal ? `(${t('searchResultsRemaining', { numLeft: searchNumTotal - searchHits.length })})` : ""}
        </Button>
      )}
    </>
  );
}

SearchResults.propTypes = {
  companionWindowId: PropTypes.string.isRequired,
  containerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
  fetchSearch: PropTypes.func.isRequired,
  isFetching: PropTypes.bool,
  nextSearch: PropTypes.string,
  query: PropTypes.string,
  searchAnnotations: PropTypes.arrayOf(PropTypes.object),
  searchHits: PropTypes.arrayOf(PropTypes.object),
  searchNumTotal: PropTypes.number,
  windowId: PropTypes.string.isRequired,
  viewer: PropTypes.object,
  canvases: PropTypes.arrayOf(PropTypes.object),
  setCanvas: PropTypes.func.isRequired,
};
