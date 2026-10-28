import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import BiIcon from './BiIcon';
import { announce } from '@react-aria/live-announcer';
import { useTranslation } from 'react-i18next';
import SearchHit from '../containers/SearchHit';
import { ScrollTo } from './ScrollTo';
import { OSDReferences } from '../plugins/OSDReferences';
import { normalizeCanvasId, normalizeAnnotationId } from '../state/selectors/utils';

function getCanvasIdFromAnnotation(annotation, searchAnnotations = [], canvases = []) {
  if (!annotation) return null;
  if (typeof annotation === 'object') {
    if (annotation.targetId) return String(annotation.targetId).split('#')[0];
    if (annotation.target) return String(annotation.target).split('#')[0];
    if (Array.isArray(annotation.on) && annotation.on[0]) return String(annotation.on[0]).split('#')[0];
    if (typeof annotation.on === 'string') return annotation.on.split('#')[0];
    if (annotation.resource && typeof annotation.resource.on === 'string') return String(annotation.resource.on).split('#')[0];
  }
  const annoId = typeof annotation === 'object' ? (annotation.id || annotation['@id']) : String(annotation);
  if (!annoId) return null;

  const annoList = Array.isArray(searchAnnotations)
    ? (searchAnnotations[0]?.resources ? searchAnnotations.flatMap(a => a.resources || []) : searchAnnotations)
    : (searchAnnotations?.resources || []);

  const norm = (s) => normalizeAnnotationId(s);
  const normBase = (s) => norm(s).split('#')[0];

  const res = annoList.find(r => {
    if (!r) return false;
    const rId = r.id || r['@id'];
    if (!rId) return false;
    return norm(rId) === norm(annoId) || normBase(rId) === normBase(annoId);
  });

  if (res) {
    if (res.targetId) return String(res.targetId).split('#')[0];
    if (res.target) return String(res.target).split('#')[0];
    if (Array.isArray(res.on) && res.on[0]) return String(res.on[0]).split('#')[0];
    if (typeof res.on === 'string') return String(res.on).split('#')[0];
    if (res.resource && typeof res.resource.on === 'string') return String(res.resource.on).split('#')[0];
  }

  const cand = normalizeCanvasId(annoId);
  if (canvases && canvases.length > 0) {
    const matched = canvases.find(c => {
      const cNorm = normalizeCanvasId(c.id || c['@id']);
      return cNorm === cand || cand.includes(cNorm);
    });
    if (matched) return matched.id || matched['@id'];
  }

  return null;
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
  selectAnnotation,
}) {
  const handleClick = (annotation) => {
    const canvasId = getCanvasIdFromAnnotation(annotation, searchAnnotations, canvases);
    if (!canvasId) return;

    const normTarget = normalizeCanvasId(canvasId);
    const targetCanvas = (canvases || []).find(c => normalizeCanvasId(c.id || c['@id'] || c.canvas?.id) === normTarget);
    const targetCanvasId = targetCanvas ? (targetCanvas.id || targetCanvas['@id']) : canvasId;

    const pageIndex = canvases.findIndex((c) => normalizeCanvasId(c.id || c['@id'] || c.canvas?.id) === normTarget);
    if (pageIndex < 0) return;

    setCanvas(targetCanvasId);
    if (annotation) {
      const annoId = typeof annotation === 'object' ? (annotation.id || annotation['@id']) : annotation;
      if (annoId && typeof selectAnnotation === 'function') selectAnnotation(annoId);
    }
    const osdViewer = OSDReferences.get(windowId) || viewer?.current || viewer;
    if (osdViewer && typeof osdViewer.goToPage === 'function') osdViewer.goToPage(pageIndex);
  };

  // Combine hits and annotations
  const allItems = [
    ...searchHits.map(hit => ({
      type: 'hit',
      data: hit,
      canvasId: getCanvasIdFromAnnotation(hit.annotations?.[0], searchAnnotations, canvases),
      position: hit.position ?? 0,
    })),
    ...searchAnnotations.map(anno => ({
      type: 'annotation',
      data: anno,
      canvasId: getCanvasIdFromAnnotation(anno, searchAnnotations, canvases),
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
  selectAnnotation,
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
            <BiIcon name="arrow-left" size={16} />
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
          selectAnnotation={selectAnnotation}
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
  selectAnnotation: PropTypes.func,
};
