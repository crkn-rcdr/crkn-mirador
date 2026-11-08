import { compose } from 'redux';
import { connect } from 'react-redux';
import { withPlugins } from '../extend/withPlugins';
import * as actions from '../state/actions';
import { MinimalWindow } from '../components/MinimalWindow';
import { getWindowConfig, getSequenceTreeStructure } from '../state/selectors';

const isMobile = () => typeof window !== 'undefined' && (
  (typeof window.innerWidth === 'number' && window.innerWidth <= 991)
  || (typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 991px)').matches)
);

/** mapStateToProps */
const mapStateToProps = (state, { windowId }) => {
  const config = getWindowConfig(state, { windowId });
  const treeStructure = getSequenceTreeStructure(state, { windowId });
  const hasToc = Boolean(treeStructure && treeStructure.nodes && treeStructure.nodes.length > 0);

  return {
    allowClose: config.allowClose,
    allowWindowSideBar: Boolean(hasToc && !isMobile()),
  };
};

/**
 * mapDispatchToProps - used to hook up connect to action creators
 * @memberof ManifestListItem
 * @private
 */
const mapDispatchToProps = (dispatch, { windowId }) => ({
  removeWindow: () => dispatch(actions.removeWindow(windowId)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('MinimalWindow'),
);

export default enhance(MinimalWindow);
