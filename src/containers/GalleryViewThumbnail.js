import { compose } from 'redux';
import { connect } from 'react-redux';
import flatten from 'lodash/flatten';
import * as actions from '../state/actions';
import { GalleryViewThumbnail } from '../components/GalleryViewThumbnail';
import {
  getSearchAnnotationsForWindow,
  getCurrentCanvas,
  getConfig,
  getPresentAnnotationsOnSelectedCanvases,
  getCompanionWindowsForContent,
} from '../state/selectors';

const normalizeId = (id) => (id || '').toString().split('#')[0];

const safeFlatResources = (searchAnnotations) => {
  const out = [];
  for (let i = 0; i < searchAnnotations.length; i += 1) {
    const res = searchAnnotations[i]?.resources;
    if (!Array.isArray(res)) continue;
    for (let j = 0; j < res.length; j += 1) {
      const r = res[j];
      // keep only plain objects that look like content search resources
      if (r && typeof r === 'object') out.push(r);
    }
  }
  return out;
};

/** */
const mapStateToProps = (state, { canvas, windowId }) => {
  // if canvas is momentarily missing, short-circuit safely
  if (!canvas) {
    return {
      annotationsCount: undefined,
      config: getConfig(state).galleryView,
      searchAnnotationsCount: 0,
      selected: false,
      highlighted: false,
    };
  }

  const currentCanvas = getCurrentCanvas(state, { windowId });
  const searchAnnotations = getSearchAnnotationsForWindow(state, { windowId }) || [];
  const selectedAnnotationId = state.windows?.[windowId]?.selectedAnnotationId;

  // ✅ FLATTEN SAFELY (no undefined entries)
  const flatResources = safeFlatResources(searchAnnotations);

  // ✅ FILTER SAFELY (guard targetId and normalize)
  const thisCanvasId = normalizeId(canvas.id);
  const canvasResources = flatResources.filter(r => {
    const targetCanvasId = normalizeId(r?.targetId);
    return !!targetCanvasId && targetCanvasId === thisCanvasId;
  });

  const hasOpenAnnotationsWindow =
    (getCompanionWindowsForContent(state, { content: 'annotations', windowId }) || []).length > 0;

  // tolerate @id or id on the resource that carries the annotation id
  const highlighted = !!selectedAnnotationId && canvasResources.some(r => {
    const rid = r?.['@id'] || r?.id;
    return !!rid && rid === selectedAnnotationId;
  });

  // compute annotationsCount only when the annotations panel is open
  const annotationsCount = !hasOpenAnnotationsWindow ? undefined : (() => {
    const present = getPresentAnnotationsOnSelectedCanvases(state, { canvasId: canvas.id }) || [];
    let total = 0;
    for (let i = 0; i < present.length; i += 1) {
      const res = Array.isArray(present[i]?.resources) ? present[i].resources : [];
      for (let j = 0; j < res.length; j += 1) {
        const t = res[j]?.targetId;
        if (t && normalizeId(t) === thisCanvasId) total += 1;
      }
    }
    return total;
  })();

  return {
    annotationsCount,
    config: getConfig(state).galleryView,
    searchAnnotationsCount: canvasResources.length,
    selected: !!currentCanvas && normalizeId(currentCanvas.id) === thisCanvasId,
    highlighted,
  };
};



/**
 * mapDispatchToProps - used to hook up connect to action creators
 * @memberof WindowViewer
 * @private
 */
const mapDispatchToProps = (dispatch, { canvas, id, windowId }) => ({
  focusOnCanvas: () => dispatch(actions.setWindowViewType(windowId, 'single')),
  requestCanvasAnnotations: () => (
    dispatch(actions.requestCanvasAnnotations(windowId, canvas.id))
  ),
  setCanvas: (...args) => dispatch(actions.setCanvas(windowId, ...args)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  // further HOC go here
);

export default enhance(GalleryViewThumbnail);
