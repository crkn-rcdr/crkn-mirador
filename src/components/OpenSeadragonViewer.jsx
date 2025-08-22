import { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import OpenSeadragon from 'openseadragon';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ns from '../config/css-ns';
import AnnotationsOverlay from '../containers/AnnotationsOverlay';
import CanvasWorld from '../lib/CanvasWorld';
import { PluginHook } from './PluginHook';
import { OSDReferences } from '../plugins/OSDReferences';

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
  viewerConfig = null,
  drawAnnotations = false,
  canvases = [],
  canvasWorld,
  nonTiledImages = [],
  updateViewport,
  setCanvas,
  ...rest
}) {
  const { t } = useTranslation();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [tileSources, setTileSources] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Build stable IDs to prevent unnecessary rebuilds
  const canvasIds = canvases.map(c => c.id).join('|');
  const nonTiledIds = nonTiledImages.map(c => c.id).join('|');

  /** Fetch and build tileSources once manifest changes */
  useEffect(() => {
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
      const sources = [];

      const infoResponsesByCanvas = await Promise.all(
        canvases.map(async canvas => {
          const services = canvas.imageServiceIds || [];
          return Promise.all(services.map(fetchInfoJson));
        })
      );

      const infoResponses = infoResponsesByCanvas.flat().filter(Boolean);
      infoResponses.forEach(resp => sources.push(resp.json));

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
  }, [canvasIds, nonTiledIds]);

  /** Report viewport changes */
  const onViewportChange = useCallback(() => {
    const vp = viewerRef.current?.viewport;
    if (!vp) return;
    updateViewport(windowId, {
      x: vp.getCenter().x,
      y: vp.getCenter().y,
      zoom: vp.getZoom(),
      rotation: vp.getRotation(),
      flip: vp.getFlip(),
    });
  }, [updateViewport, windowId]);

  /** Initialize OSD once */
  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = OpenSeadragon({
      element: containerRef.current,
      prefixUrl: '/openseadragon/images/',
      crossOriginPolicy: 'Anonymous',
      renderer: 'canvas',

      showZoomControl: true,
      showHomeControl: true,
      showFullPageControl: true,
      showRotationControl: true,
      showFlipControl: true,
      showNavigator: false,
      showSequenceControl: true,
      sequenceMode: true,

      blendTime: 0,
      immediateRender: true,
      preserveOverlays: true,
      maxZoomPixelRatio: osdConfig.maxZoomPixelRatio || 8,
      zoomPerClick: osdConfig.zoomPerClick || 1.3,
      zoomPerScroll: osdConfig.zoomPerScroll || 1.2,
      ...osdConfig,
    });

    if (!viewer.zoomPerClick || viewer.zoomPerClick <= 1.001) viewer.zoomPerClick = 1.3;

    viewerRef.current = viewer;
    OSDReferences.set(windowId, viewer);

    viewer.addHandler('viewport-change', onViewportChange);

    // Sync page changes with Mirador state
    viewer.addHandler('page', event => {
      setCurrentPageIndex(event.page);
      if (canvases[event.page] && setCanvas) setCanvas(canvases[event.page].id);
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [windowId, osdConfig, onViewportChange, canvases, setCanvas]);

  /** Open sources and go to current page */
  useEffect(() => {
    if (!viewerRef.current || tileSources.length === 0) return;

    viewerRef.current.open(tileSources);
    viewerRef.current.addOnceHandler('open', () => {
      const world = viewerRef.current.world;
      if (world.getItemCount() > 0) {
        viewerRef.current.viewport.fitBounds(world.getHomeBounds(), true);
        viewerRef.current.viewport.minZoomLevel = viewerRef.current.viewport.getZoom() * 0.5;
        viewerRef.current.viewport.maxZoomLevel = viewerRef.current.viewport.getZoom() * 40;
        // Restore current page after open
        if (currentPageIndex < tileSources.length) {
          viewerRef.current.goToPage(currentPageIndex);
        }
      }
    });
  }, [tileSources, currentPageIndex]);

  const pluginProps = {
    canvasWorld,
    drawAnnotations,
    canvases,
    label,
    nonTiledImages,
    osdConfig,
    t,
    updateViewport,
    viewerConfig,
    windowId,
    ...rest,
  };

  return (
    <StyledSection ref={containerRef} className={classNames(ns('osd-container'))}>
      {drawAnnotations && <AnnotationsOverlay viewer={viewerRef.current} windowId={windowId} />}
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
  label: PropTypes.string,
  nonTiledImages: PropTypes.array,
  osdConfig: PropTypes.object,
  updateViewport: PropTypes.func.isRequired,
  setCanvas: PropTypes.func,
  viewerConfig: PropTypes.object,
  windowId: PropTypes.string.isRequired,
};
