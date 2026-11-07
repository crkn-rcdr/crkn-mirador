import { compose } from 'redux';
import { connect } from 'react-redux';
import { withPlugins } from '../extend/withPlugins';
import * as actions from '../state/actions';
import { MinimalWindow } from '../components/MinimalWindow';
import { getWindowConfig, getSequenceTreeStructure } from '../state/selectors';

/** mapStateToProps */
const mapStateToProps = (state, { windowId }) => {
  const config = getWindowConfig(state, { windowId });
  const treeStructure = getSequenceTreeStructure(state, { windowId });
  const hasToc = Boolean(treeStructure && treeStructure.nodes && treeStructure.nodes.length > 0);

  return {
    allowClose: config.allowClose,
    allowWindowSideBar: (config.allowWindowSideBar !== false) && hasToc,
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
