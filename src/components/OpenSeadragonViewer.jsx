import {
  Children, cloneElement, isValidElement, useCallback, useRef, useEffect, useState,
} from 'react';
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

const DEFAULT_OSD_CONFIG = {};
const TRANSPARENT_NAV_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
const TRANSPARENT_NAV_IMAGES = Object.fromEntries(
  ['zoomIn', 'zoomOut', 'home', 'fullpage', 'rotateleft', 'rotateright', 'flip', 'previous', 'next']
    .map(name => [name, {
      DOWN: TRANSPARENT_NAV_IMAGE,
      GROUP: TRANSPARENT_NAV_IMAGE,
      HOVER: TRANSPARENT_NAV_IMAGE,
      REST: TRANSPARENT_NAV_IMAGE,
    }]),
);

function isTouchLikeControlEvent(event) {
  return event.type.startsWith('touch') || event.pointerType === 'touch' || event.pointerType === 'pen';
}

function getTouchControlAction(viewer, title) {
  const zoomPerClick = viewer.zoomPerClick || 1.3;
  const rotationIncrement = viewer.rotationIncrement || 90;

  const actions = {
    'Flip horizontal': () => {
      if (viewer.viewport?.toggleFlip) viewer.viewport.toggleFlip();
      else if (viewer.viewport?.setFlip && viewer.viewport?.getFlip) viewer.viewport.setFlip(!viewer.viewport.getFlip());
    },
    'Flip Horizontally': () => {
      if (viewer.viewport?.toggleFlip) viewer.viewport.toggleFlip();
      else if (viewer.viewport?.setFlip && viewer.viewport?.getFlip) viewer.viewport.setFlip(!viewer.viewport.getFlip());
    },
    'Go home': () => {
      viewer.viewport?.goHome();
      viewer.viewport?.applyConstraints?.();
    },
    'Rotate left': () => {
      if (!viewer.viewport) return;
      const direction = viewer.viewport.flipped ? 1 : -1;
      viewer.viewport.setRotation(viewer.viewport.getRotation() + (direction * rotationIncrement));
      viewer.viewport.applyConstraints?.();
    },
    'Rotate right': () => {
      if (!viewer.viewport) return;
      const direction = viewer.viewport.flipped ? -1 : 1;
      viewer.viewport.setRotation(viewer.viewport.getRotation() + (direction * rotationIncrement));
      viewer.viewport.applyConstraints?.();
    },
    'Zoom in': () => {
      viewer.viewport?.zoomBy(zoomPerClick);
      viewer.viewport?.applyConstraints?.();
    },
    'Zoom out': () => {
      viewer.viewport?.zoomBy(1 / zoomPerClick);
      viewer.viewport?.applyConstraints?.();
    },
  };

  return actions[title];
}

function installTouchControlFallback(viewer) {
  const controlElements = Array.from(viewer.container?.querySelectorAll('div[title]') || []);
  const cleanup = [];

  controlElements.forEach(element => {
    const action = getTouchControlAction(viewer, element.getAttribute('title'));
    if (!action) return;

    let lastRun = 0;

    const stopNativeTouch = event => {
      if (!isTouchLikeControlEvent(event)) return;
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation?.();
    };

    const runAction = event => {
      if (!isTouchLikeControlEvent(event)) return;
      stopNativeTouch(event);

      const now = Date.now();
      if (now - lastRun < 250) return;
      lastRun = now;
      action();
    };

    element.addEventListener('pointerdown', stopNativeTouch, true);
    element.addEventListener('pointerup', runAction, true);
    element.addEventListener('touchstart', stopNativeTouch, { capture: true, passive: false });
    element.addEventListener('touchend', runAction, { capture: true, passive: false });

    cleanup.push(() => {
      element.removeEventListener('pointerdown', stopNativeTouch, true);
      element.removeEventListener('pointerup', runAction, true);
      element.removeEventListener('touchstart', stopNativeTouch, true);
      element.removeEventListener('touchend', runAction, true);
    });
  });

  return () => cleanup.forEach(remove => remove());
}

const StyledSection = styled('section')({
  cursor: 'grab',
  flex: 1,
  position: 'relative',
  '& .openseadragon-container .openseadragon-navigation': {
    zIndex: 1000,
    pointerEvents: 'auto',
  },
});

/**
 * Expand a search-hit rect so we keep more context and avoid over-zooming tiny matches.
 */
export function expandSearchHitRect(vpRect, itemRect, paddingRatio = 0.35, minItemCoverageRatio = 0.2) {
  if (!vpRect) return null;

  const centerX = vpRect.x + (vpRect.width / 2);
  const centerY = vpRect.y + (vpRect.height / 2);

  const paddedWidth = vpRect.width * (1 + (paddingRatio * 2));
  const paddedHeight = vpRect.height * (1 + (paddingRatio * 2));

  const minWidth = itemRect ? (itemRect.width * minItemCoverageRatio) : 0;
  const minHeight = itemRect ? (itemRect.height * minItemCoverageRatio) : 0;

  const width = Math.max(paddedWidth, minWidth);
  const height = Math.max(paddedHeight, minHeight);

  return {
    height,
    width,
    x: centerX - (width / 2),
    y: centerY - (height / 2),
  };
}

export function OpenSeadragonViewer({
  children = null,
  label = null,
  windowId,
  osdConfig = DEFAULT_OSD_CONFIG,
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
  const [viewer, setViewer] = useState(null);
  const [tileSources, setTileSources] = useState([]);
  const [addedCount, setAddedCount] = useState(0);
  const lastZoomedAnnoRef = useRef(null);

  const canvasIndex = useSelector(state => getCanvasIndex(state, { windowId }));

  const canvasKeys = canvases.map(c => c.id).join('|');
  const nonTiledKeys = nonTiledImages.map(c => c.id).join('|');
  const visibleKeys = (visibleCanvases || []).map(c => c.id).join('|');
  const ariaLabel = t('item', { label: label || '' }).trim();

  const zoomToWorld = useCallback((immediately = false) => {
    const currentViewer = viewerRef.current;
    if (!currentViewer?.viewport) return;

    if (currentViewer.world?.getItemCount?.() > 0 && currentViewer.world?.getHomeBounds) {
      currentViewer.viewport.fitBounds(currentViewer.world.getHomeBounds(), immediately);
    } else if (canvasWorld?.worldBounds) {
      currentViewer.viewport.fitBounds(new OpenSeadragon.Rect(...canvasWorld.worldBounds()), immediately);
    } else {
      currentViewer.viewport.goHome(immediately);
    }

    currentViewer.viewport.applyConstraints?.();
  }, [canvasWorld]);

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

    const navImageConfig = osdConfig.navImages
      ? {
        navImages: osdConfig.navImages,
        prefixUrl: osdConfig.prefixUrl || '/openseadragon/images/',
      }
      : (osdConfig.prefixUrl ? {} : {
        navImages: TRANSPARENT_NAV_IMAGES,
        prefixUrl: '',
      });

    const viewer = OpenSeadragon({
      element: containerRef.current,
      crossOriginPolicy: 'Anonymous',
      renderer: 'canvas',
      preserveViewport: true,
      showZoomControl: true,
      showHomeControl: true,
      showFullPageControl: false,
      showRotationControl: true,
      showFlipControl: true,
      showNavigator: false,
      autoHideControls: false,
      showSequenceControl: viewType === 'single',
      sequenceMode: viewType === 'single',
      blendTime: 0,
      immediateRender: true,
      preserveOverlays: true,
      maxZoomPixelRatio: osdConfig.maxZoomPixelRatio || 8,
      zoomPerClick: osdConfig.zoomPerClick || 1.3,
      zoomPerScroll: osdConfig.zoomPerScroll || 1.2,
      ...osdConfig,
      ...navImageConfig,
    });

    viewerRef.current = viewer;
    setViewer(viewer);
    OSDReferences.set(windowId, viewer);
    const cleanupTouchControls = installTouchControlFallback(viewer);

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
      cleanupTouchControls();
      viewer.destroy();
      viewerRef.current = null;
      setViewer(null);
      OSDReferences.set(windowId, null);
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
      const itemRect = item.getBounds ? item.getBounds() : null;
      const expandedRect = expandSearchHitRect(vpRect, itemRect);
      if (!expandedRect) return;

      const padded = new OpenSeadragon.Rect(
        expandedRect.x,
        expandedRect.y,
        expandedRect.width,
        expandedRect.height,
      );
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
    viewer,
    zoomToWorld,
    ...rest,
  };

  const enhancedChildren = Children.map(children, child => (
    isValidElement(child)
      ? cloneElement(child, { viewer, windowId, zoomToWorld })
      : child
  ));

  return (
    <StyledSection
      ref={containerRef}
      aria-label={ariaLabel}
      className={classNames(ns('osd-container'))}
    >
      {/* Mount overlay only when viewer exists */}
      {drawAnnotations && viewer && (
        <AnnotationsOverlay
          viewer={viewer}
          windowId={windowId}
          {...pluginProps}
        />
      )}
      <PluginHook viewer={viewer} {...pluginProps} />
      {enhancedChildren}
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
