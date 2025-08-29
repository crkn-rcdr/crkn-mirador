import {
  all, call, put, takeEvery,
} from 'redux-saga/effects';
import { v4 as uuid } from 'uuid';
import { fetchManifests } from './iiif';
import { fetchWindowManifest } from './windows';
import { addWindow } from '../actions';
import ActionTypes from '../actions/action-types';

/** */
export function* importState(action) {
  yield all([
    ...Object.entries(action.state.windows || {})
      .map(([_, window]) => call(fetchWindowManifest, { id: window.id, payload: window })),
    ...Object.entries(action.state.manifests || {})
      .filter(([_, manifest]) => !manifest.json)
      .map(([_, manifest]) => call(fetchManifests, manifest.id)),
  ]);
}

/** Add windows from the imported config */
export function* importConfig({ config: { thumbnailNavigation, windows } }) {
  if (!windows || windows.length === 0) return;

  const thunks = yield all(
    windows.map((miradorWindow) => {
      const windowId = `window-${uuid()}`;
      const manifestId = miradorWindow.manifestId || miradorWindow.loadedManifest;
      // Allow `contentSearch: { query: "..." }` in window config.
      // If provided, seed the WindowTopBar search (without forcing the left sidebar open).
      // Keep supporting `defaultSearchQuery` (legacy) to seed the left sidebar search panel.
      const { contentSearch, ...restWindow } = (miradorWindow || {});
      const defaultSearchQuery = restWindow.defaultSearchQuery || undefined;
      const topBarSearchQuery = contentSearch && contentSearch.query ? contentSearch.query : undefined;

      return call(addWindow, {
        // these are default values ...
        id: windowId,
        manifestId,
        thumbnailNavigationPosition: thumbnailNavigation && thumbnailNavigation.defaultPosition,
        // ... overridden by values from the window configuration ...
        ...restWindow,
        ...(defaultSearchQuery ? { defaultSearchQuery } : {}),
        ...(topBarSearchQuery ? { topBarSearchQuery } : {}),
      });
    }),
  );

  yield all(thunks.map(thunk => put(thunk)));
}

/** */
export function* fetchCollectionManifests(action) {
  const { collectionPath, manifestId } = action;
  yield call(fetchManifests, manifestId, ...collectionPath);
}

/** */
export default function* appSaga() {
  yield all([
    takeEvery(ActionTypes.IMPORT_MIRADOR_STATE, importState),
    takeEvery(ActionTypes.IMPORT_CONFIG, importConfig),
    takeEvery(ActionTypes.SHOW_COLLECTION_DIALOG, fetchCollectionManifests),
  ]);
}
