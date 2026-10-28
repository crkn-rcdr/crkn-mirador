import settings from '../../config/settings';

/**
 * Returns a slice of the mirador redux state based on settings.
 * Otherwise the entire Redux state is returned.
 * @param {object} state
 * @returns {object}
 */
export function miradorSlice(state) {
  if (settings.state.slice) return state[settings.state.slice];

  return state;
}

export const EMPTY_ARRAY = Object.freeze([]);
export const EMPTY_OBJECT = Object.freeze({});

/**
 * Normalize canvas identifier for robust comparison across formats, protocols,
 * and URL-encoded vs unencoded slashes (%2f vs /).
 * @param {string} id
 * @returns {string}
 */
export function normalizeCanvasId(id) {
  if (!id) return '';
  let str = String(id).trim();
  str = str.split('#')[0];
  str = str.replace(/^https?:/, '');
  try {
    str = decodeURIComponent(str);
  } catch (e) {
    /* ignore malformed URI */
  }
  str = str.replace(/\/+/g, '/');
  return str.replace(/\/+$/, '');
}

/**
 * Normalize annotation identifier for robust comparison.
 * @param {string} id
 * @returns {string}
 */
export function normalizeAnnotationId(id) {
  if (!id) return '';
  let str = String(id).trim();
  try {
    str = decodeURIComponent(str);
  } catch (e) {
    /* ignore */
  }
  return str;
}
