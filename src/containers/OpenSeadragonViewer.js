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
  getCanvases
} from '../state/selectors';

/**
 * mapStateToProps - used to hook up connect to action creators
 * @memberof Window
 * @private
 */
const mapStateToProps = (state, { windowId }) => {
  const canvasWorld = getCurrentCanvasWorld(state, { windowId });
  const canvases = getCanvases(state, { windowId });
  return {
    canvasWorld,
    drawAnnotations: getConfig(state).window.forceDrawAnnotations
      || getCompanionWindowsForContent(state, { content: 'annotations', windowId }).length > 0
      || getCompanionWindowsForContent(state, { content: 'search', windowId }).length > 0,
    canvases:canvases,
    label: getCanvasLabel(state, {
      canvasId: (getCurrentCanvas(state, { windowId }) || {}).id,
      windowId,
    }),
    nonTiledImages: getVisibleCanvasNonTiledResources(state, { windowId }),
    osdConfig: getConfig(state).osdConfig,
    viewerConfig: getViewer(state, { windowId }),
  };
};

/**
 * mapDispatchToProps - used to hook up connect to action creators
 * @memberof ManifestListItem
 * @private
 */
const mapDispatchToProps = {
  updateViewport: actions.updateViewport,
};

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('OpenSeadragonViewer'),
);

export default enhance(OpenSeadragonViewer);
