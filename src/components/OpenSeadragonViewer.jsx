import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import OpenSeadragon from 'openseadragon';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ns from '../config/css-ns';
import AnnotationsOverlay from '../containers/AnnotationsOverlay';
import CanvasWorld from '../lib/CanvasWorld';
import { PluginHook } from './PluginHook';
import { OSDReferences } from '../plugins/OSDReferences';
import { getCanvasIndex } from '../state/selectors';

const StyledSection = styled('section')({
  cursor: 'grab',
  flex: 1,
  position: 'relative',
  '& .openseadragon-container .openseadragon-navigation': {
    zIndex: 1000,
    pointerEvents: 'auto',
  },
});

export function OpenSeadragonViewer({
  children = null,
  label = null,
  windowId,
  osdConfig = {},
  drawAnnotations = false,
  canvases = [],
  visibleCanvases = [],
  viewType = 'single',
  currentCanvasId = undefined,
  canvasWorld,
  nonTiledImages = [],
  updateViewport,
  annotations = [],
  searchAnnotations = [],
  hoveredAnnotationIds = [],
  selectAnnotation,
  deselectAnnotation,
  hoverAnnotation,
  selectedAnnotationId,
  palette,
  highlightAllAnnotations,
  ...rest
}) {
  const { t } = useTranslation();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [tileSources, setTileSources] = useState([]);
  const [addedCount, setAddedCount] = useState(0);
  const lastZoomedAnnoRef = useRef(null);

  const canvasIndex = useSelector(state => getCanvasIndex(state, { windowId }));

  const canvasKeys = canvases.map(c => c.id).join('|');
  const nonTiledKeys = nonTiledImages.map(c => c.id).join('|');
  const visibleKeys = (visibleCanvases || []).map(c => c.id).join('|');

  /** Fetch tile sources for 'single' view (sequence of all canvases) */
  useEffect(() => {
    if (viewType !== 'single') return;
    let cancelled = false;
    const infoCache = {};

    async function fetchInfoJson(id) {
      if (!id) return null;
      if (infoCache[id]) return infoCache[id];
      try {
        const resp = await fetch(id.replace(/\/info\.json$/, '') + '/info.json');
        if (!resp.ok) throw new Error(`Bad response for ${id}`);
        const json = await resp.json();
        infoCache[id] = { id, json };
        return infoCache[id];
      } catch (e) {
        console.error('Failed to fetch info.json', id, e);
        return null;
      }
    }

    async function buildSources() {
      const targets = canvases;
      const sources = [];
      const infoResponsesByCanvas = await Promise.all(
        targets.map(async canvas => {
          const services = canvas.imageServiceIds || [];
          return Promise.all(services.map(fetchInfoJson));
        })
      );

      infoResponsesByCanvas.flat().filter(Boolean).forEach(resp => sources.push(resp.json));

      nonTiledImages.forEach(cr => {
        const type = cr.getProperty('type');
        const format = cr.getProperty('format') || '';
        if (!(type === 'Image' || type === 'dctypes:Image' || format.startsWith('image/'))) return;
        sources.push(cr.id);
      });

      if (!cancelled) setTileSources(sources);
    }

    buildSources();
    return () => { cancelled = true; };
  }, [canvasKeys, nonTiledKeys, viewType]);

  /** Fetch tile sources for 'book' and 'scroll' views */
  useEffect(() => {
    if (viewType === 'single') return;
    let cancelled = false;
    const infoCache = {};

    async function fetchInfoJson(id) {
      if (!id) return null;
      if (infoCache[id]) return infoCache[id];
      try {
        const resp = await fetch(id.replace(/\/info\.json$/, '') + '/info.json');
        if (!resp.ok) throw new Error(`Bad response for ${id}`);
        const json = await resp.json();
        infoCache[id] = { id, json };
        return infoCache[id];
      } catch (e) {
        console.error('Failed to fetch info.json', id, e);
        return null;
      }
    }

    async function buildSources() {
      const targets = (viewType === 'book' && visibleCanvases && visibleCanvases.length > 0)
        ? visibleCanvases
        : canvases;
      const sources = [];
      const infoResponsesByCanvas = await Promise.all(
        targets.map(async canvas => {
          const services = canvas.imageServiceIds || [];
          return Promise.all(services.map(fetchInfoJson));
        })
      );

      infoResponsesByCanvas.flat().filter(Boolean).forEach(resp => sources.push(resp.json));

      nonTiledImages.forEach(cr => {
        const type = cr.getProperty('type');
        const format = cr.getProperty('format') || '';
        if (!(type === 'Image' || type === 'dctypes:Image' || format.startsWith('image/'))) return;
        sources.push(cr.id);
      });

      if (!cancelled) setTileSources(sources);
    }

    buildSources();
    return () => { cancelled = true; };
  }, [viewType, visibleKeys, canvasKeys, nonTiledKeys]);

  /** Initialize OSD */
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = OpenSeadragon({
      element: containerRef.current,
      prefixUrl: '/openseadragon/images/',
      crossOriginPolicy: 'Anonymous',
      renderer: 'canvas',
      preserveViewport: true,
      showZoomControl: true,
      showHomeControl: true,
      showFullPageControl: false,
      showRotationControl: true,
      showFlipControl: true,
      showNavigator: false,
      showSequenceControl: viewType === 'single',
      sequenceMode: viewType === 'single',
      blendTime: 0,
      immediateRender: true,
      preserveOverlays: true,
      maxZoomPixelRatio: osdConfig.maxZoomPixelRatio || 8,
      zoomPerClick: osdConfig.zoomPerClick || 1.3,
      zoomPerScroll: osdConfig.zoomPerScroll || 1.2,
      ...osdConfig,
    });

    viewerRef.current = viewer;
    OSDReferences.set(windowId, viewer);

    viewer.addHandler('viewport-change', () => {
      const vp = viewer.viewport;
      if (!vp) return;
      updateViewport(windowId, {
        x: vp.getCenter().x,
        y: vp.getCenter().y,
        zoom: vp.getZoom(),
        rotation: vp.getRotation(),
        flip: vp.getFlip(),
      });
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [windowId, osdConfig, updateViewport, viewType]);

  /** Arrange and open tile sources according to viewType */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || tileSources.length === 0) return;

    const GAP = 0.05; // small spacing in world units
    const isScroll = viewType === 'scroll';
    const isBook = viewType === 'book';
    const isSingle = viewType === 'single';

    // Single: open as sequence for fast page switching (no flicker)
    if (isSingle) {
      viewer.open(tileSources);
      viewer.addOnceHandler('open', () => {
        const world = viewer.world;
        if (world.getItemCount() > 0) {
          viewer.viewport.fitBounds(world.getHomeBounds(), true);
          viewer.viewport.minZoomLevel = viewer.viewport.getZoom() * 0.5;
          viewer.viewport.maxZoomLevel = viewer.viewport.getZoom() * 40;
          if (canvasIndex >= 0) viewer.goToPage(canvasIndex);
        }
      });
      return;
    }

    // Book / Scroll: manual layout of items in the world
    viewer.world.removeAll();
    setAddedCount(0);

    let y = 0;
    let pending = tileSources.length;
    const sources = tileSources;

    sources.forEach((ts, idx) => {
      const wpx = typeof ts === 'object' ? (ts.width || ts['@width']) : undefined;
      const hpx = typeof ts === 'object' ? (ts.height || ts['@height']) : undefined;
      const ratio = (wpx && hpx) ? (wpx / hpx) : 1; // width/height

      let posX = 0;
      let posY = 0;
      let width = 1; // default width in world units

      if (isScroll) {
        posX = 0;
        posY = y;
        y += (1 / ratio) + GAP; // advance by height
      } else if (isBook) {
        posX = (idx % 2 === 0) ? 0 : 1 + GAP; // side-by-side
        posY = 0;
      }

      viewer.addTiledImage({
        tileSource: ts,
        x: posX,
        y: posY,
        width,
        success: () => {
          pending -= 1;
          setAddedCount((c) => c + 1);
          if (pending === 0) {
            const world = viewer.world;
            if (world.getItemCount() > 0) {
              // If a specific annotation is selected, skip auto-fit to avoid overriding zoom
              if (!selectedAnnotationId) {
                viewer.viewport.fitBounds(world.getHomeBounds(), true);
              }
              const current = viewer.viewport.getZoom();
              viewer.viewport.minZoomLevel = current * 0.5;
              viewer.viewport.maxZoomLevel = current * 40;
            }
          }
        },
      });
    });

    // Fallback: if nothing was added (unexpected tileSource shape), open as a sequence
    setTimeout(() => {
      try {
        if (viewer.world.getItemCount() === 0) {
          viewer.open(tileSources);
        }
      } catch (_) { /* ignore */ }
    }, 0);
  }, [tileSources, viewType]);

  /** Zoom to the selected annotation region (xywh) when selection changes */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !selectedAnnotationId) return;
    // Avoid reapplying zoom for the same selection if user pans/zooms
    if (lastZoomedAnnoRef.current === selectedAnnotationId) return;

    // find annotation resource
    const res = (searchAnnotations || []).find(r => (
      r && (r.id === selectedAnnotationId || r['@id'] === selectedAnnotationId)
    ));
    if (!res) return;

    const target = res.targetId || res.target || '';
    const [canvasIdRaw, frag] = String(target).split('#');
    if (!frag || !frag.startsWith('xywh=')) return;
    const normalize = (s) => (s || '').toString().split('#')[0];
    const canvasId = normalize(canvasIdRaw);
    const [x, y, w, h] = frag.replace('xywh=', '').split(',').map(n => parseInt(n, 10));

    const zoomOnItem = (itemIndex) => {
      const item = viewer.world.getItemAt(itemIndex);
      if (!item || !item.imageToViewportRectangle) return;
      const vpRect = item.imageToViewportRectangle(new OpenSeadragon.Rect(x, y, w, h));
      // Add slight padding for context
      const padX = vpRect.width * 0.1;
      const padY = vpRect.height * 0.1;
      const padded = new OpenSeadragon.Rect(vpRect.x - padX, vpRect.y - padY, vpRect.width + 2 * padX, vpRect.height + 2 * padY);
      viewer.viewport.fitBoundsWithConstraints(padded, true);
    };

    if (viewType === 'single') {
      // If we are already on the right page, zoom now; otherwise, zoom after the page changes
      const targetIndex = canvases.findIndex(c => normalize(c.id) === canvasId);
      if (targetIndex < 0) return;
      if (canvasIndex === targetIndex) {
        // world holds current page at item 0 in sequence mode
        const doZoom = () => { zoomOnItem(0); lastZoomedAnnoRef.current = selectedAnnotationId; };
        if (viewer.world.getItemCount() > 0) doZoom();
        else viewer.addOnceHandler('open', () => setTimeout(doZoom, 0));
      } else {
        viewer.addOnceHandler('page', () => setTimeout(() => { zoomOnItem(0); lastZoomedAnnoRef.current = selectedAnnotationId; }, 0));
      }
      return;
    }

    // book/scroll: zoom on the corresponding item index in the laid out world
    const vi = (visibleCanvases || []).findIndex(c => normalize(c.id) === canvasId);
    if (vi >= 0 && vi < (viewer.world.getItemCount() || 0)) {
      zoomOnItem(vi);
      lastZoomedAnnoRef.current = selectedAnnotationId;
    } else {
      // wait for world layout
      viewer.addOnceHandler('open', () => setTimeout(() => { zoomOnItem(vi); lastZoomedAnnoRef.current = selectedAnnotationId; }, 0));
    }
  }, [selectedAnnotationId, searchAnnotations, viewType, canvasIndex, addedCount, canvasKeys, visibleKeys]);

  /** Sync viewer when current canvas changes (no auto-zoom to item) */
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !currentCanvasId) return;

    if (viewType === 'single') {
      // Do not clamp to world.getItemCount(); in sequence mode it stays 1.
      // Let OSD handle clamping internally.
      viewer.goToPage(canvasIndex);
      return;
    }

    // Book/Scroll: do not change zoom automatically
  }, [currentCanvasId, canvasIndex, viewType]);

  // Removed auto-zoom to search hit by request

  const pluginProps = {
    canvasWorld,
    drawAnnotations,
    canvases,
    label,
    nonTiledImages,
    osdConfig,
    t,
    updateViewport,
    windowId,
    annotations,
    searchAnnotations: Array.isArray(searchAnnotations)
      ? searchAnnotations.map(r => ({ resources: [r] }))
      : [],
    hoveredAnnotationIds,
    selectAnnotation,
    deselectAnnotation,
    hoverAnnotation,
    selectedAnnotationId,
    palette,
    highlightAllAnnotations,
    ...rest,
  };

  return (
    <StyledSection ref={containerRef} className={classNames(ns('osd-container'))}>
      {/* Mount overlay only when viewer exists */}
      {drawAnnotations && viewerRef.current && (
        <AnnotationsOverlay
          viewer={viewerRef.current}
          windowId={windowId}
          {...pluginProps}
        />
      )}
      <PluginHook viewer={viewerRef.current} {...pluginProps} />
      {children}
    </StyledSection>
  );
}

OpenSeadragonViewer.propTypes = {
  canvasWorld: PropTypes.instanceOf(CanvasWorld).isRequired,
  children: PropTypes.node,
  drawAnnotations: PropTypes.bool,
  canvases: PropTypes.arrayOf(PropTypes.object),
  visibleCanvases: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
  nonTiledImages: PropTypes.array,
  osdConfig: PropTypes.object,
  updateViewport: PropTypes.func.isRequired,
  annotations: PropTypes.array,
  searchAnnotations: PropTypes.array,
  hoveredAnnotationIds: PropTypes.array,
  selectAnnotation: PropTypes.func,
  deselectAnnotation: PropTypes.func,
  hoverAnnotation: PropTypes.func,
  selectedAnnotationId: PropTypes.string,
  palette: PropTypes.object,
  highlightAllAnnotations: PropTypes.bool,
  viewType: PropTypes.oneOf(['single', 'book', 'scroll']),
  currentCanvasId: PropTypes.string,
};
