import PropTypes from 'prop-types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftSharp';
import ChevronRightIcon from '@mui/icons-material/ChevronRightSharp';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';

/** Helper to parse canvasId from annotation target */
function getCanvasIdFromAnnotation(annotation, searchAnnotations = []) {
  // Accept either a resource object with targetId or an annotation id string
  if (annotation && typeof annotation === 'object' && annotation.targetId) {
    const [canvasId] = annotation.targetId.split('#');
    return canvasId;
  }
  if (typeof annotation === 'string') {
    const res = (searchAnnotations || []).find(r => (r.id === annotation) || (r['@id'] === annotation));
    if (res && res.targetId) {
      const [canvasId] = res.targetId.split('#');
      return canvasId;
    }
  }
  return null;
}

/**
 * SearchPanelNavigation
 */
import { useEffect, useRef, useState } from 'react';

export function SearchPanelNavigation({
  numTotal,
  searchHits = [],
  searchAnnotations = [],
  selectedContentSearchAnnotation = [],
  direction,
  selectAnnotation,
  setCurrentCanvas,
  fetchSearch,
  windowId,
  companionWindowId,
  viewer,
  canvases = [],
  nextSearch,
  query,
  viewType,
  isV2 = false,
}) {
  const { t } = useTranslation();

  // Defensive: find current hit index
  const currentHitIndex = selectedContentSearchAnnotation.length > 0
    ? searchHits.findIndex(val =>
        val.annotations.includes(selectedContentSearchAnnotation[0])
      )
    : -1;

  // If no current hit, default to first
  const safeHitIndex = currentHitIndex >= 0 ? currentHitIndex : 0;

  const prevLoadedCountRef = useRef(searchHits.length);
  const [pendingNext, setPendingNext] = useState(false);

  useEffect(() => {
    if (pendingNext && searchHits.length > prevLoadedCountRef.current) {
      // select first new hit
      const newIndex = prevLoadedCountRef.current; // first of newly fetched page
      const annotation = searchHits[newIndex]?.annotations?.[0];
      if (annotation) {
        selectAnnotation(annotation);
        const canvasId = getCanvasIdFromAnnotation(annotation, searchAnnotations);
        if (canvasId) setCurrentCanvas(windowId, canvasId);
      }
      setPendingNext(false);
      prevLoadedCountRef.current = searchHits.length;
    } else if (!pendingNext) {
      prevLoadedCountRef.current = searchHits.length;
    }
  }, [searchHits, pendingNext, searchAnnotations, selectAnnotation, setCurrentCanvas, windowId]);

  const goToSearchResult = (hitIndex) => {
    if (hitIndex < 0) return;
    if (hitIndex >= searchHits.length) {
      if (nextSearch) {
        setPendingNext(true);
        fetchSearch(windowId, companionWindowId, nextSearch, query);
      }
      return;
    }
    console.log("dv", hitIndex); // ✅ debug log

    const annotation = searchHits[hitIndex].annotations[0];
    selectAnnotation(annotation);

    const canvasId = getCanvasIdFromAnnotation(annotation, searchAnnotations);
    if (canvasId) {
      // Update Redux
      setCurrentCanvas(windowId, canvasId);

      // Let OSD react to canvas change; avoid duplicate goToPage calls
    }
  };

  if (searchHits.length === 0) return null;

  const hasNextResult = safeHitIndex < searchHits.length - 1 || Boolean(nextSearch);
  const hasPreviousResult = safeHitIndex > 0;
  const iconStyle = direction === 'rtl' ? { transform: 'rotate(180deg)' } : {};

  let lengthText = searchHits.length;
  if (!isV2 && typeof numTotal === 'number' && searchHits.length < numTotal) lengthText += '+';

  return (
    <Typography variant="body2" align="center">
      <MiradorMenuButton
        aria-label={t('searchPreviousResult')}
        disabled={!hasPreviousResult}
        onClick={() => goToSearchResult(safeHitIndex - 1)}
      >
        <ChevronLeftIcon style={iconStyle} />
      </MiradorMenuButton>
      <span style={{ unicodeBidi: 'plaintext' }}>
        {isV2
          ? (safeHitIndex + 1)
          : t('pagination', { current: safeHitIndex + 1, total: lengthText })}
      </span>
      <MiradorMenuButton
        aria-label={t('searchNextResult')}
        disabled={!hasNextResult}
        onClick={() => goToSearchResult(safeHitIndex + 1)}
      >
        <ChevronRightIcon style={iconStyle} />
      </MiradorMenuButton>
    </Typography>
  );
}

SearchPanelNavigation.propTypes = {
  direction: PropTypes.string.isRequired,
  numTotal: PropTypes.number,
  searchHits: PropTypes.arrayOf(PropTypes.object),
  searchAnnotations: PropTypes.arrayOf(PropTypes.object),
  selectAnnotation: PropTypes.func.isRequired,
  setCurrentCanvas: PropTypes.func.isRequired,
  fetchSearch: PropTypes.func,
  selectedContentSearchAnnotation: PropTypes.arrayOf(PropTypes.string),
  windowId: PropTypes.string.isRequired,
  companionWindowId: PropTypes.string,
  viewer: PropTypes.object,
  canvases: PropTypes.arrayOf(PropTypes.object),
  nextSearch: PropTypes.string,
  query: PropTypes.string,
  viewType: PropTypes.string,
  isV2: PropTypes.bool,
};
