import PropTypes from 'prop-types';
// Using Bootstrap icons
import { useEffect, useRef, useState } from 'react';
import { styled, alpha } from '@mui/material/styles';
import BiIcon from './BiIcon';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import { OSDReferences } from '../plugins/OSDReferences';
import { normalizeCanvasId, normalizeAnnotationId } from '../state/selectors/utils';

const TOPBAR_FONT_STACK = '"Roboto", "Helvetica Neue", Arial, sans-serif';

/** Helper to parse canvasId from annotation target */
function getCanvasIdFromAnnotation(annotation, searchAnnotations = [], canvases = []) {
  if (!annotation) return null;
  // If annotation is an object with target properties
  if (typeof annotation === 'object') {
    if (annotation.targetId) return String(annotation.targetId).split('#')[0];
    if (annotation.target) return String(annotation.target).split('#')[0];
    if (Array.isArray(annotation.on) && annotation.on[0]) return String(annotation.on[0]).split('#')[0];
    if (typeof annotation.on === 'string') return annotation.on.split('#')[0];
  }
  const annoId = typeof annotation === 'object' ? (annotation.id || annotation['@id']) : String(annotation);
  if (!annoId) return null;

  const annoList = Array.isArray(searchAnnotations)
    ? searchAnnotations
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

  // Fallback: check if the annoId itself matches or contains a canvas URI
  const cand = normalizeCanvasId(annoId);
  if (canvases && canvases.length > 0) {
    const matchedCanvas = canvases.find(c => {
      const cNorm = normalizeCanvasId(c.id || c['@id']);
      return cNorm === cand || cand.includes(cNorm);
    });
    if (matchedCanvas) return matchedCanvas.id || matchedCanvas['@id'];
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
  setContentSearchCurrentAnnotation,
  setCurrentCanvas,
  focusOnCanvas,
  fetchSearch,
  windowId,
  companionWindowId,
  viewer,
  canvases = [],
  currentCanvas,
  nextSearch,
  query,
  viewType,
  isV2 = false,
  skipInitialSelect = false,
}) {
  const { t } = useTranslation();

  // Find current hit index matching selectedContentSearchAnnotation
  const currentHitIndex = (selectedContentSearchAnnotation && selectedContentSearchAnnotation.length > 0)
    ? searchHits.findIndex(val => {
        const selectedId = selectedContentSearchAnnotation[0];
        if (!selectedId) return false;
        const hitAnnos = Array.isArray(val.annotations) ? val.annotations : [val.annotation || val.id].filter(Boolean);
        return hitAnnos.some(a => {
          const aId = typeof a === 'object' ? (a.id || a['@id']) : a;
          return normalizeAnnotationId(aId) === normalizeAnnotationId(selectedId);
        });
      })
    : -1;

  const [activeHitIndex, setActiveHitIndex] = useState(0);
  const navigatingRef = useRef(false);

  useEffect(() => {
    // Only sync from Redux when the user hasn't just explicitly navigated
    if (currentHitIndex >= 0 && !navigatingRef.current) {
      setActiveHitIndex(currentHitIndex);
    }
  }, [currentHitIndex]);

  const safeHitIndex = navigatingRef.current
    ? Math.min(activeHitIndex, Math.max(0, searchHits.length - 1))
    : (currentHitIndex >= 0
      ? currentHitIndex
      : Math.min(activeHitIndex, Math.max(0, searchHits.length - 1)));

  const prevLoadedCountRef = useRef(searchHits.length);
  const lastQueryRef = useRef(query);
  const [pendingNext, setPendingNext] = useState(false);

  useEffect(() => {
    if (lastQueryRef.current !== query) {
      lastQueryRef.current = query;
      prevLoadedCountRef.current = 0;
      setActiveHitIndex(0);
    }

    // Auto-select first hit on initial load unless explicitly skipped
    if (!pendingNext && prevLoadedCountRef.current === 0 && searchHits.length > 0) {
      prevLoadedCountRef.current = searchHits.length;
      if (skipInitialSelect) return; // do not jump on config-seeded queries
      const firstHit = searchHits[0];
      const rawAnno = Array.isArray(firstHit?.annotations) ? firstHit.annotations[0] : firstHit?.annotation;
      const firstAnnoId = typeof rawAnno === 'object' ? (rawAnno.id || rawAnno['@id']) : rawAnno;
      if (firstAnnoId) {
        setActiveHitIndex(0);
        selectAnnotation(firstAnnoId);
        if (typeof setContentSearchCurrentAnnotation === 'function') {
          setContentSearchCurrentAnnotation([firstAnnoId]);
        }
        const canvasId = getCanvasIdFromAnnotation(firstAnnoId, searchAnnotations, canvases);
        if (canvasId) {
          const normTarget = normalizeCanvasId(canvasId);
          const targetCanvas = (canvases || []).find(c => normalizeCanvasId(c.id || c['@id'] || c.canvas?.id) === normTarget);
          const targetCanvasId = targetCanvas ? (targetCanvas.id || targetCanvas['@id']) : canvasId;
          const currentCanvasId = currentCanvas ? (currentCanvas.id || currentCanvas['@id']) : '';
          const normCurrentCanvas = normalizeCanvasId(currentCanvasId);

          if (normTarget && normCurrentCanvas && normTarget !== normCurrentCanvas) {
            if (typeof focusOnCanvas === 'function') focusOnCanvas(targetCanvasId);
            else if (typeof setCurrentCanvas === 'function') setCurrentCanvas(windowId, targetCanvasId);
          }
        }
      }
      return;
    }

    if (pendingNext && searchHits.length > prevLoadedCountRef.current) {
      // select first new hit
      const newIndex = prevLoadedCountRef.current; // first of newly fetched page
      const newHit = searchHits[newIndex];
      const rawAnno = Array.isArray(newHit?.annotations) ? newHit.annotations[0] : newHit?.annotation;
      const annotationId = typeof rawAnno === 'object' ? (rawAnno.id || rawAnno['@id']) : rawAnno;
      if (annotationId) {
        setActiveHitIndex(newIndex);
        selectAnnotation(annotationId);
        if (typeof setContentSearchCurrentAnnotation === 'function') {
          setContentSearchCurrentAnnotation([annotationId]);
        }
        const canvasId = getCanvasIdFromAnnotation(annotationId, searchAnnotations, canvases);
        if (canvasId) {
          const normTarget = normalizeCanvasId(canvasId);
          const targetCanvas = (canvases || []).find(c => normalizeCanvasId(c.id || c['@id'] || c.canvas?.id) === normTarget);
          const targetCanvasId = targetCanvas ? (targetCanvas.id || targetCanvas['@id']) : canvasId;
          const currentCanvasId = currentCanvas ? (currentCanvas.id || currentCanvas['@id']) : '';
          const normCurrentCanvas = normalizeCanvasId(currentCanvasId);

          if (normTarget && normCurrentCanvas && normTarget !== normCurrentCanvas) {
            if (typeof focusOnCanvas === 'function') focusOnCanvas(targetCanvasId);
            else if (typeof setCurrentCanvas === 'function') setCurrentCanvas(windowId, targetCanvasId);
          }
        }
      }
      setPendingNext(false);
      prevLoadedCountRef.current = searchHits.length;
    } else if (!pendingNext) {
      prevLoadedCountRef.current = searchHits.length;
    }
  }, [searchHits, pendingNext, searchAnnotations, canvases, selectAnnotation, setContentSearchCurrentAnnotation, setCurrentCanvas, focusOnCanvas, windowId, skipInitialSelect, query, currentCanvas]);

  const goToSearchResult = (hitIndex) => {
    if (hitIndex < 0) return;
    if (hitIndex >= searchHits.length) {
      if (nextSearch) {
        setPendingNext(true);
        fetchSearch(windowId, companionWindowId, nextSearch, query);
      }
      return;
    }
    const hit = searchHits[hitIndex];
    if (!hit) return;
    const rawAnno = Array.isArray(hit.annotations) ? hit.annotations[0] : hit.annotation;
    const annotationId = typeof rawAnno === 'object' ? (rawAnno.id || rawAnno['@id']) : rawAnno;
    if (!annotationId) return;

    // Mark that the user is explicitly navigating — prevents the useEffect
    // from resetting activeHitIndex back to the stale currentHitIndex
    navigatingRef.current = true;
    setActiveHitIndex(hitIndex);
    selectAnnotation(annotationId);
    if (typeof setContentSearchCurrentAnnotation === 'function') {
      setContentSearchCurrentAnnotation([annotationId]);
    }

    // Allow Redux state to settle, then re-enable sync from currentHitIndex
    Promise.resolve().then(() => {
      setTimeout(() => { navigatingRef.current = false; }, 100);
    });

    const canvasId = getCanvasIdFromAnnotation(annotationId, searchAnnotations, canvases);
    if (canvasId) {
      const normTarget = normalizeCanvasId(canvasId);
      const targetCanvas = (canvases || []).find(c => normalizeCanvasId(c.id || c['@id'] || c.canvas?.id) === normTarget);
      const targetCanvasId = targetCanvas ? (targetCanvas.id || targetCanvas['@id']) : canvasId;

      const currentCanvasId = currentCanvas ? (currentCanvas.id || currentCanvas['@id']) : '';
      const normCurrentCanvas = normalizeCanvasId(currentCanvasId);

      // Only switch canvas if moving to a different canvas
      if (normTarget && normCurrentCanvas && normTarget !== normCurrentCanvas) {
        if (typeof focusOnCanvas === 'function') {
          focusOnCanvas(targetCanvasId);
        } else if (typeof setCurrentCanvas === 'function') {
          setCurrentCanvas(windowId, targetCanvasId);
        }
      }
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
  setContentSearchCurrentAnnotation: PropTypes.func,
  setCurrentCanvas: PropTypes.func.isRequired,
  focusOnCanvas: PropTypes.func,
  fetchSearch: PropTypes.func,
  selectedContentSearchAnnotation: PropTypes.arrayOf(PropTypes.string),
  windowId: PropTypes.string.isRequired,
  companionWindowId: PropTypes.string,
  viewer: PropTypes.object,
  canvases: PropTypes.arrayOf(PropTypes.object),
  currentCanvas: PropTypes.object,
  nextSearch: PropTypes.string,
  query: PropTypes.string,
  viewType: PropTypes.string,
  isV2: PropTypes.bool,
  skipInitialSelect: PropTypes.bool,
};
