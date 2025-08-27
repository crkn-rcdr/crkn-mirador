import { compose } from 'redux';
import { connect } from 'react-redux';
import { withPlugins } from '../extend/withPlugins';
import { GalleryView } from '../components/GalleryView';
import { getCanvases, getSequenceViewingDirection, getWindow } from '../state/selectors';

/**
 * mapStateToProps - to hook up connect
 * @memberof WindowViewer
 * @private
 */
const mapStateToProps = (state, { windowId }) => (
  {
    canvases: getCanvases(state, { windowId }),
    viewingDirection: getSequenceViewingDirection(state, { windowId }),
    // Force updates when selection changes (even if GalleryView itself doesn't use it)
    currentCanvasId: (getWindow(state, { windowId }) || {}).canvasId,
  }
);

const enhance = compose(
  connect(mapStateToProps),
  withPlugins('GalleryView'),
  // further HOC go here
);

export default enhance(GalleryView);
