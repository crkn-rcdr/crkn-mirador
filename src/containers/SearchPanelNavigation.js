import { compose } from 'redux';
import { connect } from 'react-redux';
import { withPlugins } from '../extend/withPlugins';
import { SearchPanelNavigation } from '../components/SearchPanelNavigation';
import * as actions from '../state/actions';
import {
  getSelectedContentSearchAnnotationIds,
  getSearchNumTotal,
  getSortedSearchHitsForCompanionWindow,
  getNextSearchId,
  getSearchQuery,
  getSortedSearchAnnotationsForCompanionWindow,
  getThemeDirection,
  getWindowViewType,
  getManifestSearchService,
  getWindow,
} from '../state/selectors';

/**
 * mapStateToProps - used to hook up connect to state
 * @memberof SearchPanelControls
 * @private
 */
const mapStateToProps = (state, { companionWindowId, windowId }) => {
  const svc = getManifestSearchService(state, { windowId });
  const profile = (svc && (
    (typeof svc.getProfile === 'function' && svc.getProfile())
    || (typeof svc.getProperty === 'function' && svc.getProperty('profile'))
    || svc.profile
  )) || '';
  const type = (svc && (
    (typeof svc.getProperty === 'function' && svc.getProperty('type'))
    || svc.type
  )) || '';
  const isV2 = /\/api\/search\/2\//.test(String(profile)) || String(type) === 'ContentSearchService2';

  return {
    direction: getThemeDirection(state),
    numTotal: getSearchNumTotal(state, { companionWindowId, windowId }),
    searchHits: getSortedSearchHitsForCompanionWindow(state, { companionWindowId, windowId }),
    searchAnnotations: getSortedSearchAnnotationsForCompanionWindow(state, { companionWindowId, windowId }),
    nextSearch: getNextSearchId(state, { companionWindowId, windowId }),
    query: getSearchQuery(state, { companionWindowId, windowId }) || '',
    viewType: getWindowViewType(state, { windowId }),
    isV2,
    // If this is the topbar search and its current query matches
    // the configured topBarSearchQuery from settings, skip auto-selecting
    // the first result on initial load.
    skipInitialSelect: (() => {
      const win = getWindow(state, { windowId }) || {};
      const q = getSearchQuery(state, { companionWindowId, windowId }) || '';
      return (companionWindowId === `${windowId}-topbar`) && !!win.topBarSearchQuery && String(q) === String(win.topBarSearchQuery);
    })(),
    selectedContentSearchAnnotation: getSelectedContentSearchAnnotationIds(state, {
      companionWindowId,
      windowId,
    }),
  };
};

/**
 * mapDispatchToProps - to hook up connect
 * @memberof SearchPanelNavigation
 * @private
 */
const mapDispatchToProps = (dispatch, { windowId }) => ({
  selectAnnotation: (...args) => dispatch(
    actions.selectAnnotation(windowId, ...args),
  ),
  // Map to setCanvas (setCurrentCanvas is not defined in actions)
  setCurrentCanvas: (windowId2, canvasId) => dispatch(
    actions.setCanvas(windowId2, canvasId),
  ), 
  fetchSearch: (...args) => dispatch(actions.fetchSearch(...args)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withPlugins('SearchPanelNavigation'),
);

export default enhance(SearchPanelNavigation);
