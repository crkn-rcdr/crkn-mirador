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

  /* Keep the built-in controls clickable even if overlays exist */
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
  ...rest
}) {
  const { t } = useTranslation();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const [tileSources, setTileSources] = useState([]);

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

      // Fetch info.json per canvas
      const infoResponsesByCanvas = await Promise.all(
        canvases.map(async (canvas) => {
          const services = canvas.imageServiceIds || [];
          return Promise.all(services.map(fetchInfoJson));
        })
      );

      const infoResponses = infoResponsesByCanvas.flat().filter(Boolean);

      // IIIF tiled images
      infoResponses.forEach((infoResponse) => {
        const cr = canvasWorld.contentResource(infoResponse.id);
        if (!cr) return;

        const [x0, y0, x1] = canvasWorld.contentResourceToWorldCoordinates(cr);
        const width = x1 - x0;
        const index = canvasWorld.layerIndexOfImageResource(cr);
        const opacity = canvasWorld.layerOpacityOfImageResource(cr);

        sources.push({
          tileSource: infoResponse.json,
          x: x0,
          y: y0,
          width,
          opacity,
          index,
          crossOriginPolicy: 'Anonymous',
        });
      });

      // Non-tiled images
      nonTiledImages.forEach((cr) => {
        const type = cr.getProperty('type');
        const format = cr.getProperty('format') || '';
        if (!(type === 'Image' || type === 'dctypes:Image' || format.startsWith('image/'))) return;

        const [x0, y0, x1] = canvasWorld.contentResourceToWorldCoordinates(cr);
        const width = x1 - x0;
        const index = canvasWorld.layerIndexOfImageResource(cr);
        const opacity = canvasWorld.layerOpacityOfImageResource(cr);

        sources.push({
          tileSource: cr.id,
          x: x0,
          y: y0,
          width,
          opacity,
          index,
          crossOriginPolicy: 'Anonymous',
        });
      });

      if (!cancelled) setTileSources(sources);
    }

    buildSources();

    return () => {
      cancelled = true;
    };
  }, [canvases, canvasWorld, nonTiledImages]);

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

  /** Initialize OpenSeadragon once with built-in controls */
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = OpenSeadragon({
      element: containerRef.current,
      prefixUrl: '/openseadragon/images/',
      crossOriginPolicy: 'Anonymous',
      renderer: 'canvas',

      /* Built-in controls */
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

    if (!viewer.zoomPerClick || viewer.zoomPerClick <= 1.001) {
      viewer.zoomPerClick = 1.3;
    }

    viewerRef.current = viewer;
    OSDReferences.set(windowId, viewer);

    viewer.addHandler('viewport-change', onViewportChange);

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, [windowId, osdConfig, onViewportChange]);

  /** Load or update sources when they change */
  useEffect(() => {
    if (viewerRef.current && tileSources.length > 0) {
      viewerRef.current.open(tileSources);

      viewerRef.current.addHandler('open', () => {
        const world = viewerRef.current.world;
        if (world.getItemCount() > 0) {
          const bounds = world.getHomeBounds();
          viewerRef.current.viewport.fitBounds(bounds, true);

          if (viewerRef.current.viewport.minZoomLevel == null) {
            viewerRef.current.viewport.minZoomLevel = viewerRef.current.viewport.getZoom() * 0.5;
          }
          if (viewerRef.current.viewport.maxZoomLevel == null) {
            viewerRef.current.viewport.maxZoomLevel = viewerRef.current.viewport.getZoom() * 40;
          }
        }
      });
    }
  }, [tileSources]);

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
  viewerConfig: PropTypes.object,
  windowId: PropTypes.string.isRequired,
};
