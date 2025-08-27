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
const mapStateToProps = (state, { windowId }) => {
  const raw = getCanvases(state, { windowId }) || [];
  // ✅ Filter anything falsy or missing an identifier up front
  const canvases = raw.filter(c => c && (c.id || typeof c.index !== 'undefined'));
  return {
    canvases,
    viewingDirection: getSequenceViewingDirection(state, { windowId }),
    // Force updates when selection changes
    currentCanvasId: (getWindow(state, { windowId }) || {}).canvasId,
  };
};

const enhance = compose(
  connect(mapStateToProps),
  withPlugins('GalleryView'),
  // further HOC go here
);

export default enhance(GalleryView);
