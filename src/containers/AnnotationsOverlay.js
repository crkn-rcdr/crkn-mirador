import { connect } from 'react-redux';
import { compose } from 'redux';
import { withPlugins } from '../extend/withPlugins';
import { AnnotationsOverlay } from '../components/AnnotationsOverlay';
import * as actions from '../state/actions';
import {
  getWindow,
  getSearchAnnotationsForWindow,
  getCompanionWindowsForContent,
  getTheme,
  getConfig,
  getPresentAnnotationsOnSelectedCanvases,
  getSelectedAnnotationId,
  getCurrentCanvasWorld,
  getCurrentCanvas,
} from '../state/selectors';

/**
 * mapStateToProps - used to hook up connect to action creators
 * @memberof Window
 * @private
 */
const mapStateToProps = (state, { windowId }) => {
  const searchAnnotationsArray = getSearchAnnotationsForWindow(state, { windowId });

  const searchAnnotations = Array.isArray(searchAnnotationsArray)
    ? searchAnnotationsArray.map(resource => ({ resources: [resource] }))
    : [];

  const currentCanvas = getCurrentCanvas(state, { windowId });

  return {
    annotations: getPresentAnnotationsOnSelectedCanvases(state, { windowId }),
    canvasWorld: getCurrentCanvasWorld(state, { windowId }),
    currentCanvasId: currentCanvas?.id, // ✅ Add currentCanvasId here
    drawAnnotations:
      getConfig(state).window.forceDrawAnnotations ||
      getCompanionWindowsForContent(state, { content: 'annotations', windowId }).length > 0,
    drawSearchAnnotations:
      getConfig(state).window.forceDrawAnnotations ||
      getCompanionWindowsForContent(state, { content: 'search', windowId }).length > 0,
    highlightAllAnnotations: getWindow(state, { windowId })?.highlightAllAnnotations,
    hoveredAnnotationIds: getWindow(state, { windowId })?.hoveredAnnotationIds,
    palette: getTheme(state).palette,
    searchAnnotations,
    selectedAnnotationId: getSelectedAnnotationId(state, { windowId }),
  };
};

/**
 * mapDispatchToProps - used to hook up connect to action creators
 * @memberof ManifestListItem
 * @private
 */
const mapDispatchToProps = {
  deselectAnnotation: actions.deselectAnnotation,
  hoverAnnotation: actions.hoverAnnotation,
  selectAnnotation: actions.selectAnnotation,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('AnnotationsOverlay')
)(AnnotationsOverlay);
