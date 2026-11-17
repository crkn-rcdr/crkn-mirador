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
  str = str.replace(/\/+$/, '');
  // ARK-backed canvas paths identify the same resource across Presentation API hosts.
  const arkCanvasPath = str.match(/\/manifest\/\d+\/[^/?]+\/canvas\/\d+\/[^/?]+$/);
  return arkCanvasPath ? arkCanvasPath[0] : str;
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

/**
 * Normalizes development URLs to match current window hostname prefix (www- vs www2-)
 * and active port (e.g. :8088).
 * @param {string} url
 * @returns {string}
 */
export function normalizeDevUrl(url) {
  if (typeof window === 'undefined' || !window.location || typeof url !== 'string') return url;
  try {
    const parsed = new URL(url, window.location.origin);
    const winHost = window.location.hostname;

    // Align cluster prefix (www- vs www2-) across dev, beta, and prod environments
    if (winHost.startsWith('www-') && parsed.hostname.startsWith('www2-')) {
      parsed.hostname = parsed.hostname.replace('www2-', 'www-');
    } else if (winHost.startsWith('www2') && parsed.hostname.startsWith('www-')) {
      parsed.hostname = parsed.hostname.replace('www-', 'www2-');
    }

    const isDev = winHost.includes('-dev.canadiana.ca') || winHost.endsWith('.local') ||
                  parsed.hostname.includes('-dev.canadiana.ca') || parsed.hostname.endsWith('.local') ||
                  winHost === 'localhost' || winHost === '127.0.0.1';
    if (isDev) {
      if ((winHost.includes('-dev.canadiana.ca') || winHost === 'localhost' || winHost === '127.0.0.1') &&
          !parsed.hostname.includes('-dev.canadiana.ca') && parsed.hostname.includes('canadiana.ca')) {
        parsed.hostname = parsed.hostname.replace(/\.canadiana\.ca$/, '-dev.canadiana.ca');
      }
      if (window.location.protocol) {
        parsed.protocol = window.location.protocol;
      }
      if (window.location.port && !parsed.port && parsed.protocol.startsWith('http')) {
        parsed.port = window.location.port;
      }
    }
    return parsed.toString();
  } catch (e) {}
  return url;
}
