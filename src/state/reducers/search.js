import omit from 'lodash/omit';
import flatten from 'lodash/flatten';
import ActionTypes from '../actions/action-types';
import { normalizeAnnotationId } from '../selectors/utils';

/**
 * searchReducer
 */
export const searchesReducer = (state = {}, action) => {
  const searchStruct = (state[action.windowId] || {})[action.companionWindowId] || {};
  switch (action.type) {
    case ActionTypes.REQUEST_SEARCH:
      if (searchStruct.query !== action.query) {
        // new query
        return {
          ...state,
          [action.windowId]: {
            ...state[action.windowId],
            [action.companionWindowId]: {
              ...searchStruct,
              data: {
                [action.searchId]: {
                  isFetching: true,
                },
              },
              query: action.query,
              selectedContentSearchAnnotation: [],
            },
          },
        };
      }

      // paginating through a query
      return {
        ...state,
        [action.windowId]: {
          ...state[action.windowId],
          [action.companionWindowId]: {
            ...searchStruct,
            data: {
              ...searchStruct.data,
              [action.searchId]: {
                isFetching: true,
              },
            },
          },
        },
      };
    case ActionTypes.RECEIVE_SEARCH:
      return {
        ...state,
        [action.windowId]: {
          ...state[action.windowId],
          [action.companionWindowId]: {
            ...searchStruct,
            data: {
              ...searchStruct.data,
              [action.searchId]: {
                isFetching: false,
                json: action.searchJson,
              },
            },
          },
        },
      };
    case ActionTypes.RECEIVE_SEARCH_FAILURE:
      return {
        ...state,
        [action.windowId]: {
          ...state[action.windowId],
          [action.companionWindowId]: {
            ...searchStruct,
            data: {
              ...searchStruct.data,
              [action.searchId]: {
                error: action.error,
                isFetching: false,
              },
            },
          },
        },
      };
    case ActionTypes.REMOVE_SEARCH:
      return {
        ...state,
        [action.windowId]: Object.keys(state[action.windowId]).reduce((object, key) => {
          if (key !== action.companionWindowId) {
            object[key] = state[action.windowId][key]; // eslint-disable-line no-param-reassign
          }
          return object;
        }, {}),
      };
    case ActionTypes.SET_CONTENT_SEARCH_CURRENT_ANNOTATIONS:
      return {
        ...state,
        [action.windowId]: {
          ...state[action.windowId],
          [action.companionWindowId]: {
            ...searchStruct,
            selectedContentSearchAnnotationIds: action.annotationIds,
          },
        },
      };
    case ActionTypes.SELECT_ANNOTATION:
      if (!state[action.windowId]) return state;

      return {
        ...state,
        [action.windowId]: Object.keys(state[action.windowId]).reduce((object, key) => {
          const search = state[action.windowId][key];
          const norm = (s) => normalizeAnnotationId(s);
          const normBase = (s) => norm(s).split('#')[0];
          const targetId = action.annotationId;

          const matchAnno = (r) => {
            if (!r) return false;
            const rid = r['@id'] || r.id;
            if (!rid) return false;
            return norm(rid) === norm(targetId) || normBase(rid) === normBase(targetId);
          };

          const searchHasAnnotation = search.data && Object.values(search.data).some(resp => {
            if (!resp.json) return false;
            // v2 (old) shape with `resources`
            if (resp.json.resources) {
              return flatten([resp.json.resources]).some(matchAnno);
            }
            // Content Search API v2 (AnnotationPage with `items`)
            if (Array.isArray(resp.json.items)) {
              return resp.json.items.some(matchAnno);
            }
            // hits fallback
            if (Array.isArray(resp.json.hits)) {
              return resp.json.hits.some(hit => (hit.annotations || []).some(a => {
                const aId = typeof a === 'object' ? (a.id || a['@id']) : a;
                return norm(aId) === norm(targetId) || normBase(aId) === normBase(targetId);
              }));
            }
            return false;
          });

          if (searchHasAnnotation) {
            object[key] = { // eslint-disable-line no-param-reassign
              ...search,
              selectedContentSearchAnnotationIds: [action.annotationId],
            };
          } else {
            object[key] = search; // eslint-disable-line no-param-reassign
          }
          return object;
        }, {}),
      };
    case ActionTypes.IMPORT_MIRADOR_STATE:
      return {};
    case ActionTypes.REMOVE_WINDOW:
      return omit(state, action.windowId);
    case ActionTypes.REMOVE_COMPANION_WINDOW:
      if (!state[action.windowId]) return state;

      return {
        ...state,
        [action.windowId]: {
          ...omit(state[action.windowId], action.id),
        },
      };
    default: return state;
  }
};
