import { compose } from 'redux';
import { connect } from 'react-redux';
import { withPlugins } from '../extend/withPlugins';
import { SearchResults } from '../components/SearchResults';
import * as actions from '../state/actions';
import {
  getNextSearchId,
  getSearchQuery,
  getSearchIsFetching,
  getSearchNumTotal,
  getSortedSearchHitsForCompanionWindow,
  getSortedSearchAnnotationsForCompanionWindow,
  getCanvases,
} from '../state/selectors';
import { OSDReferences } from '../plugins/OSDReferences';

/**
 * mapStateToProps - pulls everything needed from Redux
 */
const mapStateToProps = (state, { companionWindowId, windowId }) => ({
  isFetching: getSearchIsFetching(state, { companionWindowId, windowId }),
  nextSearch: getNextSearchId(state, { companionWindowId, windowId }),
  query: getSearchQuery(state, { companionWindowId, windowId }),
  searchAnnotations: getSortedSearchAnnotationsForCompanionWindow(state, { companionWindowId, windowId }),
  searchHits: getSortedSearchHitsForCompanionWindow(state, { companionWindowId, windowId }),
  searchNumTotal: getSearchNumTotal(state, { companionWindowId, windowId }),
  canvases: getCanvases(state, { windowId }),
  viewer: OSDReferences.get(windowId), // get OpenSeadragon instance for this window
});

/**
 * mapDispatchToProps - wire up Redux actions
 */
const mapDispatchToProps = (dispatch, { windowId }) => ({
  fetchSearch: (...args) => dispatch(actions.fetchSearch(...args)),
  setCanvas: (pageIndex) => dispatch(actions.setCanvas(windowId, pageIndex)),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('SearchResults'),
)(SearchResults);
