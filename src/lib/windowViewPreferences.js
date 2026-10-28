const WINDOW_VIEW_TYPE_STORAGE_KEY = 'mirador.windowViewTypePreference';
const WINDOW_SIDEBAR_OPEN_STORAGE_KEY = 'mirador.windowSideBarOpenPreference';
const WINDOW_DISPLAY_MODE_STORAGE_KEY = 'mirador.windowDisplayModePreference';
const WINDOW_THUMBNAIL_SIZE_STORAGE_KEY = 'mirador.windowThumbnailSizePreference';

const hasStorage = () => (
  typeof window !== 'undefined'
  && typeof window.localStorage !== 'undefined'
);

/**
 * Read the persisted default window view preference.
 * @returns {string|undefined}
 */
export function readPersistedWindowViewType() {
  if (!hasStorage()) return undefined;

  try {
    const value = window.localStorage.getItem(WINDOW_VIEW_TYPE_STORAGE_KEY);
    return value || undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Persist the default window view preference.
 * @param {string} viewType
 */
export function persistWindowViewType(viewType) {
  if (!hasStorage() || !viewType) return;

  try {
    window.localStorage.setItem(WINDOW_VIEW_TYPE_STORAGE_KEY, viewType);
  } catch (e) {
    // Ignore storage failures (e.g. private mode restrictions)
  }
}

/**
 * Read the persisted window sidebar-open preference.
 * @returns {boolean|undefined}
 */
export function readPersistedWindowSideBarOpen() {
  if (!hasStorage()) return undefined;

  try {
    const value = window.localStorage.getItem(WINDOW_SIDEBAR_OPEN_STORAGE_KEY);
    if (value === null) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;

    const parsed = JSON.parse(value);
    return typeof parsed === 'boolean' ? parsed : undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Persist the window sidebar-open preference.
 * @param {boolean} sideBarOpen
 */
export function persistWindowSideBarOpen(sideBarOpen) {
  if (!hasStorage() || typeof sideBarOpen !== 'boolean') return;

  try {
    window.localStorage.setItem(
      WINDOW_SIDEBAR_OPEN_STORAGE_KEY,
      sideBarOpen ? 'true' : 'false',
    );
  } catch (e) {
    // Ignore storage failures (e.g. private mode restrictions)
  }
}

/**
 * Read the persisted split/gallery display mode preference.
 * @returns {'both'|'gallery'|undefined}
 */
export function readPersistedWindowDisplayMode() {
  if (!hasStorage()) return undefined;

  try {
    const value = window.localStorage.getItem(WINDOW_DISPLAY_MODE_STORAGE_KEY);
    return value === 'both' || value === 'gallery' ? value : undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Persist split/gallery display mode preference.
 * @param {'both'|'gallery'} viewMode
 */
export function persistWindowDisplayMode(viewMode) {
  if (!hasStorage()) return;
  if (viewMode !== 'both' && viewMode !== 'gallery') return;

  try {
    window.localStorage.setItem(WINDOW_DISPLAY_MODE_STORAGE_KEY, viewMode);
  } catch (e) {
    // Ignore storage failures (e.g. private mode restrictions)
  }
}

/**
 * Read the persisted thumbnail size preference.
 * @returns {'s'|'m'|'l'|'fit'|undefined}
 */
export function readPersistedWindowThumbnailSize() {
  if (!hasStorage()) return undefined;

  try {
    const value = window.localStorage.getItem(WINDOW_THUMBNAIL_SIZE_STORAGE_KEY);
    return ['s', 'm', 'l', 'fit'].includes(value) ? value : undefined;
  } catch (e) {
    return undefined;
  }
}

/**
 * Persist thumbnail size preference.
 * @param {'s'|'m'|'l'|'fit'} thumbnailSize
 */
export function persistWindowThumbnailSize(thumbnailSize) {
  if (!hasStorage()) return;
  if (!['s', 'm', 'l', 'fit'].includes(thumbnailSize)) return;

  try {
    window.localStorage.setItem(WINDOW_THUMBNAIL_SIZE_STORAGE_KEY, thumbnailSize);
  } catch (e) {
    // Ignore storage failures (e.g. private mode restrictions)
  }
}
