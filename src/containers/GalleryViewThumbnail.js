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

/** */
const mapStateToProps = (state, { canvas, windowId }) => {
  // ✅ If something bubbled up undefined, render a harmless tile (avoid crashes)
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

  const flatResources = flatten(
    searchAnnotations.map(a => Array.isArray(a?.resources) ? a.resources : []),
  );

  const canvasAnnotations = flatResources.filter(r => {
    const targetCanvasId = normalizeId(r?.targetId);
    return targetCanvasId && targetCanvasId === normalizeId(canvas.id);
  });

  const hasOpenAnnotationsWindow =
    (getCompanionWindowsForContent(state, { content: 'annotations', windowId }) || []).length > 0;

  const isHighlighted = !!selectedAnnotationId && canvasAnnotations.some(a => {
    const rid = a?.['@id'] || a?.id;
    return rid && rid === selectedAnnotationId;
  });

  return {
    annotationsCount: (() => {
      if (!hasOpenAnnotationsWindow) return undefined;
      const present = getPresentAnnotationsOnSelectedCanvases(state, { canvasId: canvas.id }) || [];
      return present.reduce((v, ann) => {
        const res = Array.isArray(ann?.resources) ? ann.resources : [];
        return v + res.filter(r => normalizeId(r?.targetId) === normalizeId(canvas.id)).length;
      }, 0);
    })(),
    config: getConfig(state).galleryView,
    searchAnnotationsCount: canvasAnnotations.length,
    selected: !!currentCanvas && normalizeId(currentCanvas.id) === normalizeId(canvas.id),
    highlighted: isHighlighted,
  };
};

const mapDispatchToProps = (dispatch, { canvas, windowId }) => ({
  focusOnCanvas: () => dispatch(actions.setWindowViewType(windowId, 'single')),
  requestCanvasAnnotations: () => dispatch(actions.requestCanvasAnnotations(windowId, canvas?.id)),
  setCanvas: (...args) => dispatch(actions.setCanvas(windowId, ...args)),
});

const enhance = compose(
  connect(mapStateToProps, mapDispatchToProps),
  // further HOC go here
);

export default enhance(GalleryViewThumbnail);
