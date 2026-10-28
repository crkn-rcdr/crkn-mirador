import { createSelector } from 'reselect';
import { getSearchAnnotationsForWindow } from './index';

const normalizeId = (id) => (id || '').toString().split('#')[0];

/**
 * Factory selector:
 * Builds Map<canvasId, { count: number, items: Array }>
 * from content-search annotations for the given window.
 */
export const makeSelectSearchIndex = () => createSelector(
  [(state, { windowId }) => getSearchAnnotationsForWindow(state, { windowId }) || []],
  (anns) => {
    const map = new Map();
    for (let i = 0; i < anns.length; i += 1) {
      const res = anns[i]?.resources;
      if (!Array.isArray(res)) continue;
      for (let j = 0; j < res.length; j += 1) {
        const r = res[j];
        const cid = normalizeId(r?.targetId);
        if (!cid) continue;
        const entry = map.get(cid);
        if (entry) { entry.count += 1; entry.items.push(r); }
        else { map.set(cid, { count: 1, items: [r] }); }
      }
    }
    return map;
  }
);
