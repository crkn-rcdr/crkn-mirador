import PropTypes from 'prop-types';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeftSharp';
import ChevronRightIcon from '@mui/icons-material/ChevronRightSharp';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';

/** Helper to parse canvasId from annotation target */
function getCanvasIdFromAnnotation(annotation) {
  if (!annotation?.targetId) return null;
  const [canvasId] = annotation.targetId.split('#');
  return canvasId;
}

/**
 * SearchPanelNavigation
 */
export function SearchPanelNavigation({
  numTotal,
  searchHits = [],
  selectedContentSearchAnnotation = [],
  direction,
  selectAnnotation,
  setCurrentCanvas,
  windowId,
  viewer,
  canvases = [],
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

  const goToSearchResult = (hitIndex) => {
    if (hitIndex < 0 || hitIndex >= searchHits.length) return;
    console.log("dv", hitIndex); // ✅ debug log

    const annotation = searchHits[hitIndex].annotations[0];
    selectAnnotation(annotation);

    const canvasId = getCanvasIdFromAnnotation(annotation);
    if (canvasId) {
      // Update Redux
      setCurrentCanvas(windowId, canvasId);

      // Jump viewer directly
      if (viewer) {
        const pageIndex = canvases.findIndex(c => c.id === canvasId);
        if (pageIndex >= 0) viewer.goToPage(pageIndex);
      }
    }
  };

  if (searchHits.length === 0) return null;

  const hasNextResult = safeHitIndex < searchHits.length - 1;
  const hasPreviousResult = safeHitIndex > 0;
  const iconStyle = direction === 'rtl' ? { transform: 'rotate(180deg)' } : {};

  let lengthText = searchHits.length;
  if (searchHits.length < numTotal) lengthText += '+';

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
        {t('pagination', { current: safeHitIndex + 1, total: lengthText })}
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
  selectAnnotation: PropTypes.func.isRequired,
  setCurrentCanvas: PropTypes.func.isRequired,
  selectedContentSearchAnnotation: PropTypes.arrayOf(PropTypes.string),
  windowId: PropTypes.string.isRequired,
  viewer: PropTypes.object,
  canvases: PropTypes.arrayOf(PropTypes.object),
};
