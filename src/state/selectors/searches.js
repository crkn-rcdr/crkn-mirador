import { createSelector } from 'reselect';
import { PropertyValue } from 'manifesto.js';
import flatten from 'lodash/flatten';
import AnnotationList from '../../lib/AnnotationList';
import { getCanvas, getCanvases } from './canvases';
import { getWindow } from './getters';
import { getManifestLocale } from './manifests';
import { miradorSlice, EMPTY_ARRAY, EMPTY_OBJECT } from './utils';

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
    return resultWithWithin?.json?.within?.total;
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
        targetId: item.target,
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
    if (!canvases?.length || !searchHits?.length) return EMPTY_ARRAY;
    const canvasIds = canvases.map(c => c.id);

    return searchHits.concat().sort((a, b) => {
      const hitA = annotation.resources.find(r => r.id === a.annotations?.[0]);
      const hitB = annotation.resources.find(r => r.id === b.annotations?.[0]);
      return canvasIds.indexOf(hitA?.targetId || '') - canvasIds.indexOf(hitB?.targetId || '');
    });
  },
);

/**
 * Sorts search annotations based on canvas order.
 */
export function sortSearchAnnotationsByCanvasOrder(searchAnnotations, canvases) {
  if (!searchAnnotations?.resources?.length || !canvases?.length) return EMPTY_ARRAY;
  const canvasIds = canvases.map(c => c.id);

  return searchAnnotations.resources.concat().sort(
    (a, b) => canvasIds.indexOf(a.targetId || '') - canvasIds.indexOf(b.targetId || ''),
  );
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
    const resources = flatten(annotations.map(a => a.resources || []));
    return resources.find(r => r.id === annotationId) || {};
  },
);

/**
 * Returns canvas for annotation.
 */
export const getCanvasForAnnotation = createSelector(
  [getAnnotationById, (state, { windowId }) => canvasId => getCanvas(state, { canvasId, windowId })],
  (annotation, getCanvasById) => {
    const canvasId = annotation?.targetId;
    return canvasId ? getCanvasById(canvasId) : undefined;
  },
);
