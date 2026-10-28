import { compose } from 'redux';
import { connect } from 'react-redux';
import flatten from 'lodash/flatten';
import { withPlugins } from '../extend/withPlugins';
import { OpenSeadragonViewer } from '../components/OpenSeadragonViewer';
import * as actions from '../state/actions';
import {
  getVisibleCanvasNonTiledResources,
  getCurrentCanvas,
  getCanvasLabel,
  getViewer,
  getConfig,
  getCompanionWindowsForContent,
  getCurrentCanvasWorld,
  getCanvases,
  getCanvasIndex,
  getMiradorCanvasWrapper,
  getVisibleCanvases,
  getWindowViewType,
  getSearchAnnotationsForWindow,
  getSelectedAnnotationId,
} from '../state/selectors';

/**
 * mapStateToProps - used to hook up connect to action creators
 * @memberof Window
 * @private
 */
const mapStateToProps = (state, { windowId }) => {
  const canvasWorld = getCurrentCanvasWorld(state, { windowId });
  const allCanvases = getCanvases(state, { windowId }) || [];
  const visibleCanvases = getVisibleCanvases(state, { windowId }) || [];
  const getMiradorCanvas = getMiradorCanvasWrapper(state);
  const currentCanvas = getCurrentCanvas(state, { windowId });
  return {
    canvasWorld,
    drawAnnotations: getConfig(state).window.forceDrawAnnotations
      || getCompanionWindowsForContent(state, { content: 'annotations', windowId }).length > 0
      || getCompanionWindowsForContent(state, { content: 'search', windowId }).length > 0,
    // All canvases (wrapped) for reference
    canvases: allCanvases.map(getMiradorCanvas),
    // Visible canvases drive rendering
    visibleCanvases: visibleCanvases.map(getMiradorCanvas),
    viewType: getWindowViewType(state, { windowId }),
    currentCanvasId: (currentCanvas || {}).id,
    searchAnnotations: getSearchAnnotationsForWindow(state, { windowId }) || [],
    selectedAnnotationId: getSelectedAnnotationId(state, { windowId }),
    label: getCanvasLabel(state, {
      canvasId: (getCurrentCanvas(state, { windowId }) || {}).id,
      windowId,
    }),
    nonTiledImages: getVisibleCanvasNonTiledResources(state, { windowId }),
    osdConfig: getConfig(state).osdConfig,
    viewerConfig: getViewer(state, { windowId }),
    canvasIndex: getCanvasIndex(state, { windowId }),
  };
};

/**
 * mapDispatchToProps - used to hook up connect to action creators
 * @memberof ManifestListItem
 * @private
 */
const mapDispatchToProps = (dispatch, { windowId }) => ({
  updateViewport: actions.updateViewport,
  setCanvas: (...args) => dispatch(actions.setCanvas(windowId, ...args)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('OpenSeadragonViewer'),
);

export default enhance(OpenSeadragonViewer);
