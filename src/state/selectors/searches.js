import { createSelector } from 'reselect';
import { PropertyValue } from 'manifesto.js';
import flatten from 'lodash/flatten';
import AnnotationList from '../../lib/AnnotationList';
import { getCanvas, getCanvases } from './canvases';
import { getWindow } from './getters';
import { getManifestLocale } from './manifests';
import { miradorSlice, EMPTY_ARRAY, EMPTY_OBJECT, normalizeCanvasId, normalizeAnnotationId } from './utils';

/**
 * Get searches from state.
 */
const getSearches = (state) => miradorSlice(state).searches;

/**
 * Returns the search result for a specific window.
 * @param {object} state
 * @param {string} windowId
 * @returns {object}
 */
export const getSearchForWindow = createSelector(
  [
    (state, { windowId }) => windowId,
    getSearches,
  ],
  (windowId, searches) => {
    if (!windowId || !searches) return EMPTY_OBJECT;
    return searches[windowId] || EMPTY_OBJECT;
  },
);

/**
 * Returns the search result for a specific companion window.
 * @param {object} state
 * @param {string} companionWindowId
 * @returns {object|undefined}
 */
const getSearchForCompanionWindow = createSelector(
  [
    getSearchForWindow,
    (state, { companionWindowId }) => companionWindowId,
  ],
  (results, companionWindowId) => {
    if (!results || !companionWindowId) return undefined;
    return results[companionWindowId] || undefined;
  },
);

/**
 * Returns an array of search responses for a specific companion window.
 * @param {object} state
 * @returns {Array}
 */
const getSearchResponsesForCompanionWindow = createSelector(
  [
    getSearchForCompanionWindow,
  ],
  (results) => {
    if (!results || !results.data) return EMPTY_ARRAY;
    return Object.values(results.data);
  },
);

/**
 * Returns the search query for a specific companion window.
 * @param {object} state
 * @param {string} windowId
 * @returns {string|undefined}
 */
export const getSearchQuery = createSelector(
  [getSearchForCompanionWindow],
  results => results?.query,
);

/**
 * Returns if search response for a companion window is fetching.
 * @param {object} state
 * @returns {boolean}
 */
export const getSearchIsFetching = createSelector(
  [getSearchResponsesForCompanionWindow],
  results => results.some(result => result.isFetching),
);

/**
 * Returns the total number of search results for a companion window.
 * @param {object} state
 * @param {string} windowId
 * @returns {number|undefined}
 */
export const getSearchNumTotal = createSelector(
  [getSearchForCompanionWindow],
  (results) => {
    if (!results?.data) return undefined;

    const resultWithWithin = Object.values(results.data).find(result => (
      !result.isFetching && result.json && result.json.within
    ));
    const total = resultWithWithin?.json?.within?.total;
    if (typeof total === 'number') return total;
    // Fallback: derive from items/resources length (first available page)
    const firstPage = Object.values(results.data).find(result => !result.isFetching && result.json);
    if (!firstPage) return undefined;
    if (Array.isArray(firstPage.json.items)) return firstPage.json.items.length;
    if (Array.isArray(firstPage.json.resources)) return firstPage.json.resources.length;
    return undefined;
  },
);

/**
 * Returns the Id of the next search.
 * @param {object} state
 * @param {string} windowId
 * @returns {number|undefined}
 */
export const getNextSearchId = createSelector(
  [getSearchForCompanionWindow],
  (results) => {
    if (!results?.data) return undefined;

    const resultWithAnUnresolvedNext = Object.values(results.data).find(result => (
      !result.isFetching
        && result.json
        && result.json.next
        && !results.data[result.json.next]
    ));

    return resultWithAnUnresolvedNext?.json?.next;
  },
);

/**
 * Return the search hits for a companion window.
 * @param {object} state
 * @returns {Array}
 */
const getSearchHitsForCompanionWindow = createSelector(
  [getSearchResponsesForCompanionWindow],
  results => flatten(results.map(result => {
    if (!result?.json || result.isFetching) return EMPTY_ARRAY;
    return result.json.hits || EMPTY_ARRAY;
  })),
);

/**
 * Convert search results to an annotation object.
 * Supports both IIIF Search v2 (resources) and v3 (items).
 */
const searchResultsToAnnotation = (results) => {
  const annotations = results.map((result) => {
    if (!result?.json || result.isFetching) return undefined;

    // IIIF Search v3 "items"
    if (result.json.items) {
      const resources = result.json.items.map(item => ({
        id: item.id,
        targetId: (item.target || '').split('#')[0],
        target: item.target,
        on: item.target,
        resource: { label: [{ '@value': item.body?.value || '' }] },
      }));
      return { id: result.json.id || '', resources: resources || [] };
    }

    // Legacy IIIF Search v2 "resources"
    if (result.json.resources) {
      const anno = new AnnotationList(result.json);
      return { id: anno.id || '', resources: anno.resources || [] };
    }

    return { id: result.json?.id || '', resources: [] };
  }).filter(Boolean);

  return {
    id: annotations.find(a => a.id)?.id || '',
    resources: flatten(annotations.map(a => a.resources || [])),
  };
};

/**
 * Returns search annotations for a companion window.
 * @param {object} state
 * @returns {object}
 */
export const getSearchAnnotationsForCompanionWindow = createSelector(
  [getSearchResponsesForCompanionWindow],
  results => results ? searchResultsToAnnotation(results) : { resources: [] },
);

/**
 * Returns sorted search hits based on canvas order.
 */
export const getSortedSearchHitsForCompanionWindow = createSelector(
  [
    getSearchHitsForCompanionWindow,
    getCanvases,
    getSearchAnnotationsForCompanionWindow,
  ],
  (searchHits, canvases, annotation) => {
    if (!canvases?.length) return EMPTY_ARRAY;
    // Fallback for Content Search API v2 responses that omit `hits` and only provide annotations
    const baseHits = (searchHits && searchHits.length > 0)
      ? searchHits
      : (annotation?.resources || []).map(r => ({ annotations: [r.id] }));
    if (!baseHits.length) return EMPTY_ARRAY;
    const canvasIds = canvases.map(c => normalizeCanvasId(c.id || c['@id']));

    return baseHits.concat().sort((a, b) => {
      const hitA = annotation.resources.find(r => r.id === a.annotations?.[0]);
      const hitB = annotation.resources.find(r => r.id === b.annotations?.[0]);
      const aTarget = normalizeCanvasId(hitA?.targetId || hitA?.target || hitA?.on);
      const bTarget = normalizeCanvasId(hitB?.targetId || hitB?.target || hitB?.on);
      return canvasIds.indexOf(aTarget) - canvasIds.indexOf(bTarget);
    });
  },
);

/**
 * Sorts search annotations based on canvas order.
 */
export function sortSearchAnnotationsByCanvasOrder(searchAnnotations, canvases) {
  if (!searchAnnotations?.resources?.length || !canvases?.length) return EMPTY_ARRAY;
  const canvasIds = canvases.map(c => normalizeCanvasId(c.id || c['@id']));

  return searchAnnotations.resources.concat().sort((a, b) => {
    const aTarget = normalizeCanvasId(a.targetId || a.target || a.on);
    const bTarget = normalizeCanvasId(b.targetId || b.target || b.on);
    return canvasIds.indexOf(aTarget) - canvasIds.indexOf(bTarget);
  });
}

/**
 * Returns sorted search annotations for companion window.
 */
export const getSortedSearchAnnotationsForCompanionWindow = createSelector(
  [
    getSearchAnnotationsForCompanionWindow,
    getCanvases,
  ],
  (searchAnnotations, canvases) => sortSearchAnnotationsByCanvasOrder(searchAnnotations, canvases),
);

/**
 * Returns search annotations for window.
 */
export const getSearchAnnotationsForWindow = createSelector(
  [getSearchForWindow],
  (results) => {
    if (!results) return EMPTY_ARRAY;

    const allAnnotations = Object.values(results)
      .map(companion => Object.values(companion.data))
      .flat()
      .map(result => searchResultsToAnnotation([result]))
      .filter(Boolean);

    return flatten(allAnnotations.map(a => a.resources || []));
  },
);

/**
 * Returns ids of selected content search annotations.
 */
export const getSelectedContentSearchAnnotationIds = createSelector(
  [getWindow, getSearchForCompanionWindow],
  (window, search) => search?.selectedContentSearchAnnotationIds || [],
);

/**
 * Returns resource annotation for a search hit.
 */
export const getResourceAnnotationForSearchHit = createSelector(
  [getSearchAnnotationsForCompanionWindow, (state, { annotationUri }) => annotationUri],
  (annotation, annotationUri) => annotation.resources.find(r => r.id === annotationUri) || {},
);

/**
 * Returns resource annotation label.
 */
export const getResourceAnnotationLabel = createSelector(
  [getResourceAnnotationForSearchHit, getManifestLocale],
  (resourceAnnotation, locale) => {
    if (!resourceAnnotation?.resource?.label) return EMPTY_ARRAY;
    return PropertyValue.parse(resourceAnnotation.resource.label).getValues(locale);
  },
);

/**
 * Returns annotation by ID.
 */
const getAnnotationById = createSelector(
  [getSearchAnnotationsForWindow, (state, { annotationId }) => annotationId],
  (annotations, annotationId) => {
    if (!annotations || !annotationId) return {};
    const list = Array.isArray(annotations)
      ? (annotations[0]?.resources ? flatten(annotations.map(a => a.resources || [])) : annotations)
      : (annotations?.resources || []);
    const norm = (s) => normalizeAnnotationId(s);
    const normBase = (s) => norm(s).split('#')[0];
    return list.find(r => {
      if (!r) return false;
      const rId = r.id || r['@id'];
      if (!rId) return false;
      return norm(rId) === norm(annotationId) || normBase(rId) === normBase(annotationId);
    }) || {};
  },
);

/**
 * Returns canvas for annotation.
 */
export const getCanvasForAnnotation = createSelector(
  [getAnnotationById, (state, { windowId }) => canvasId => getCanvas(state, { canvasId, windowId })],
  (annotation, getCanvasById) => {
    let raw = '';
    if (typeof annotation?.target === 'string') raw = annotation.target;
    else if (typeof annotation?.targetId === 'string') raw = annotation.targetId;
    else if (Array.isArray(annotation?.on) && typeof annotation.on[0] === 'string') raw = annotation.on[0];
    else if (typeof annotation?.on === 'string') raw = annotation.on;
    else if (annotation?.resource && typeof annotation.resource.on === 'string') raw = annotation.resource.on;
    const canvasId = raw.toString().split('#')[0];
    return canvasId ? getCanvasById(canvasId) : undefined;
  },
);
