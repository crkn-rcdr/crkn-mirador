import { createSelector } from 'reselect';
import {
  getManifestTitle,
} from './manifests';
import { getConfig } from './config';
import { getWindows, getWindow, getWindowIds } from './getters';
import { getWorkspaceType } from './workspace';
import { getSequenceViewingHint, getSequenceBehaviors } from './sequences';
import { readPersistedWindowViewType } from '../../lib/windowViewPreferences';

/**
 * Resolve the allowed view types for a window.
 */
function resolveAllowedWindowViewTypes(manifestViewingHint, manifestBehaviors = [], { views = [], defaultView }) {
  return (views || []).reduce((allowedViews, view) => {
    if (
      view.key === defaultView
      || !view.behaviors
      || view.behaviors.some(b => (
        manifestViewingHint === b || manifestBehaviors.includes(b)
      ))
    ) allowedViews.push(view.key);

    return allowedViews;
  }, []);
}

/** Return true when a window view type controls deep zoom layout (not gallery-only mode). */
function isDeepZoomLayoutViewType(viewType) {
  return !!(viewType && viewType !== 'gallery');
}

/**
 * Returns the window configuration based.
 * @param {object} state
 * @param {string} windowId
 * @returns {object}
 */
export const getWindowConfig = createSelector(
  [getConfig, getWindow],
  ({ window: defaultConfig }, windowConfig = {}) => ({ ...defaultConfig, ...windowConfig }),
);

/**
 * Returns the manifest titles for all open windows.
 * @param {object} state
 * @returns {object}
 */
export function getWindowTitles(state) {
  const result = {};

  Object.keys(getWindows(state)).forEach((windowId) => {
    result[windowId] = getManifestTitle(state, { windowId });
  });

  return result;
}

/**
 * Returns an array containing the maximized windowIds.
 * @param {object} state
 * @return {Array}
 */
export const getMaximizedWindowsIds = createSelector(
  [getWindows],
  windows => Object.values(windows)
    .filter(window => window.maximized === true)
    .map(window => window.id),
);

/**
 * Returns type of view in a certain window.
 * @param {object} state
 * @param {object} props
 * @param {string} props.manifestId
 * @param {string} props.windowId
 * @param {string}
 */
export const getWindowViewType = createSelector(
  [
    getWindow,
    getWindowConfig,
    getSequenceViewingHint,
    getSequenceBehaviors,
  ],
  (window, windowConfig, manifestViewingHint, manifestBehaviors = []) => {
    const { defaultView, views = [] } = windowConfig || {};
    const allowedWindowViews = resolveAllowedWindowViewTypes(
      manifestViewingHint,
      manifestBehaviors,
      windowConfig || {},
    );
    const defaultDeepZoomView = isDeepZoomLayoutViewType(defaultView)
      ? defaultView
      : allowedWindowViews.find(isDeepZoomLayoutViewType);

    if (window && isDeepZoomLayoutViewType(window.view)) return window.view;

    const persistedWindowView = readPersistedWindowViewType();
    if (
      persistedWindowView
      && isDeepZoomLayoutViewType(persistedWindowView)
      && allowedWindowViews.includes(persistedWindowView)
    ) return persistedWindowView;

    const config = (views || []).find(view => (
      isDeepZoomLayoutViewType(view.key)
      && view.behaviors
      && view.behaviors.some(b => manifestViewingHint === b || manifestBehaviors.includes(b))
    ));

    return (config && config.key) || defaultDeepZoomView || defaultView;
  },
);

/**
 * Returns the window view type for a given window.
 * @param {object} state
 * @param {string} windowId
 * @returns {string} 'single' | 'book' | 'scroll' 
 */
export const getAllowedWindowViewTypes = createSelector(
  [
    getSequenceViewingHint,
    getSequenceBehaviors,
    getWindowConfig,
  ],
  (manifestViewingHint, manifestBehaviors, windowConfig) => resolveAllowedWindowViewTypes(
    manifestViewingHint,
    manifestBehaviors,
    windowConfig || {},
  ).filter(isDeepZoomLayoutViewType),
);

/**
 * Return the draggability of a window.
 * @param {object} state
 * @param {object} props
 * @returns {boolean}
 */
export const getWindowDraggability = createSelector(
  [
    getWorkspaceType,
    getWindow,
    state => getWindowIds(state).length > 1,
  ],
  (workspaceType, window, manyWindows) => {
    if (workspaceType === 'elastic') return true;
    return manyWindows && window && window.maximized === false;
  },
);
