import PropTypes from 'prop-types';
// Using Bootstrap icons
import { useEffect, useRef, useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import BiIcon from './BiIcon';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';

const TOPBAR_FONT_STACK = '"Roboto", "Helvetica Neue", Arial, sans-serif';

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

const NavPill = styled('div')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 2,
  backgroundColor: 'transparent',
  border: 'none',
  borderLeft: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.3 : 0.16)}`,
  borderRadius: 0,
  marginLeft: 6,
  padding: '1px 0 1px 6px',
  fontFamily: TOPBAR_FONT_STACK,
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  color: theme.palette.text.primary,
  '& .count': {
    minWidth: 38,
    padding: '0 2px',
    textAlign: 'center',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: 0,
  },
  '&& .MuiIconButton-root': {
    width: 32,
    height: 32,
    borderRadius: 9,
    border: 'none',
    boxShadow: 'none',
    backgroundColor: 'transparent',
    color: theme.palette.text.secondary,
  },
  '&& .MuiIconButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
}));

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
  skipInitialSelect = false,
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
    // Auto-select first hit on initial load unless explicitly skipped
    if (!pendingNext && prevLoadedCountRef.current === 0 && searchHits.length > 0) {
      prevLoadedCountRef.current = searchHits.length;
      if (skipInitialSelect) return; // do not jump on config-seeded queries
      const firstAnno = searchHits[0]?.annotations?.[0];
      if (firstAnno) {
        selectAnnotation(firstAnno);
        const canvasId = getCanvasIdFromAnnotation(firstAnno, searchAnnotations);
        if (canvasId) setCurrentCanvas(windowId, canvasId);
      }
      return;
    }

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
  }, [searchHits, pendingNext, searchAnnotations, selectAnnotation, setCurrentCanvas, windowId, skipInitialSelect]);

  const goToSearchResult = (hitIndex) => {
    if (hitIndex < 0) return;
    if (hitIndex >= searchHits.length) {
      if (nextSearch) {
        setPendingNext(true);
        fetchSearch(windowId, companionWindowId, nextSearch, query);
      }
      return;
    }
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
    <NavPill>
      <MiradorMenuButton
        aria-label={t('searchPreviousResult')}
        disabled={!hasPreviousResult}
        onClick={() => goToSearchResult(safeHitIndex - 1)}
      >
        <BiIcon name="chevron-left" size={16} style={iconStyle} />
      </MiradorMenuButton>
      <Typography component="span" variant="body2" className="count" sx={{ unicodeBidi: 'plaintext' }}>
        {isV2
          ? (safeHitIndex + 1)
          : `${safeHitIndex + 1} / ${lengthText}`}
      </Typography>
      <MiradorMenuButton
        aria-label={t('searchNextResult')}
        disabled={!hasNextResult}
        onClick={() => goToSearchResult(safeHitIndex + 1)}
      >
        <BiIcon name="chevron-right" size={16} style={iconStyle} />
      </MiradorMenuButton>
    </NavPill>
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
  skipInitialSelect: PropTypes.bool,
};
