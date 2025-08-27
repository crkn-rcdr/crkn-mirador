import { compose } from 'redux';
import { connect } from 'react-redux';
import { withPlugins } from '../extend/withPlugins';
import { SearchHit } from '../components/SearchHit';
import * as actions from '../state/actions';
import {
  getCanvasLabel,
  getVisibleCanvasIds,
  getResourceAnnotationForSearchHit,
  getResourceAnnotationLabel,
  getSelectedContentSearchAnnotationIds,
  getSelectedAnnotationId,
  getCanvases,
  getCurrentCanvas,
} from '../state/selectors';

/** */
const mapStateToProps = (state, {
  annotationId, hit = { annotations: [] }, companionWindowId, windowId,
}) => {
  const realAnnoId = annotationId || hit.annotations[0];
  const hitAnnotation = getResourceAnnotationForSearchHit(
    state,
    { annotationUri: realAnnoId, companionWindowId, windowId },
  );

  const annotationLabel = getResourceAnnotationLabel(state, {
    annotationUri: realAnnoId,
    companionWindowId,
    windowId,
  });

  const selectedCanvasIds = getVisibleCanvasIds(state, { windowId });
  const selectedContentSearchAnnotationsIds = getSelectedContentSearchAnnotationIds(state, { companionWindowId, windowId });
  const windowSelectedAnnotationId = getSelectedAnnotationId(state, { windowId });
  const allAnnoIds = [annotationId, ...hit.annotations];

  const canvases = getCanvases(state, { windowId });
  const currentCanvas = getCurrentCanvas(state, { windowId });

  return {
    adjacent: hitAnnotation && selectedCanvasIds.includes(hitAnnotation.targetId),
    annotation: hitAnnotation,
    annotationId: realAnnoId,
    annotationLabel: annotationLabel[0],
    canvasLabel: hitAnnotation && getCanvasLabel(state, { canvasId: hitAnnotation.targetId, windowId }),
    selected: selectedContentSearchAnnotationsIds[0] && allAnnoIds.includes(selectedContentSearchAnnotationsIds[0]),
    windowSelected: windowSelectedAnnotationId && allAnnoIds.includes(windowSelectedAnnotationId),
    canvases,
    currentCanvas,
  };
};

/** */
const mapDispatchToProps = (dispatch, { windowId }) => ({
  selectAnnotation: (...args) => dispatch(actions.selectAnnotation(windowId, ...args)),
  setCanvas: (...args) => dispatch(actions.setCanvas(windowId, ...args)),
  focusOnCanvas: (canvasId) => {
    dispatch(actions.setWindowViewType(windowId, 'single'));
    dispatch(actions.setCanvas(windowId, canvasId));
  },
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('SearchHit'),
);

export default enhance(SearchHit);
