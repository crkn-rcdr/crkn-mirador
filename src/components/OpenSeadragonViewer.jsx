import { useRef, useEffect, useMemo, useCallback } from 'react';
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
  infoResponses = [],
  canvasWorld,
  nonTiledImages = [],
  updateViewport,
  ...rest
}) {
  const { t } = useTranslation();
  const viewerRef = useRef(null);
  const containerRef = useRef(null);

  /** Build initial tileSources ONCE (placement + layering baked in). */
  const initialTileSources = useMemo(() => {
    const sources = [];

    // IIIF tiled images
    infoResponses.forEach((infoResponse) => {
      const cr = canvasWorld.contentResource(infoResponse.id);
      if (!cr) return;

      const [x0, y0, x1] = canvasWorld.contentResourceToWorldCoordinates(cr);
      const width = x1 - x0;
      const index = canvasWorld.layerIndexOfImageResource(cr);
      const opacity = canvasWorld.layerOpacityOfImageResource(cr);

      sources.push({
        tileSource: infoResponse.json, // IIIF info.json
        x: x0,
        y: y0,
        width,
        opacity,
        index,
        crossOriginPolicy: 'Anonymous',
      });
    });

    // Non-tiled images (plain image URLs)
    nonTiledImages.forEach((cr) => {
      const type = cr.getProperty('type');
      const format = cr.getProperty('format') || '';
      if (!(type === 'Image' || type === 'dctypes:Image' || format.startsWith('image/'))) return;

      const [x0, y0, x1] = canvasWorld.contentResourceToWorldCoordinates(cr);
      const width = x1 - x0;
      const index = canvasWorld.layerIndexOfImageResource(cr);
      const opacity = canvasWorld.layerOpacityOfImageResource(cr);

      sources.push({
        tileSource: cr.id, // direct image URL
        x: x0,
        y: y0,
        width,
        opacity,
        index,
        crossOriginPolicy: 'Anonymous',
      });
    });

    return sources;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // load once

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

      /* Built-in controls (all of them) */
      showNavigationControl: true,
      showZoomControl: true,
      showHomeControl: true,
      showFullPageControl: true,
      showRotationControl: true,
      showFlipControl: true,
      showSequenceControl: true,
      showNavigator: false,

      /* Make zoom feel snappy and allow enough headroom */
      blendTime: 0,
      immediateRender: true,
      preserveOverlays: true,
      maxZoomPixelRatio: (osdConfig && osdConfig.maxZoomPixelRatio) || 8, // plenty of zoom-in range
      zoomPerClick: (osdConfig && osdConfig.zoomPerClick) || 1.3,          // sensible default
      zoomPerScroll: (osdConfig && osdConfig.zoomPerScroll) || 1.2,

      /* our sources */
      tileSources: initialTileSources,

      ...osdConfig, // allow caller to override if they really want to
    });

    // If caller disabled zoom accidentally (e.g., zoomPerClick: 1), fix it.
    if (!viewer.zoomPerClick || viewer.zoomPerClick <= 1.001) {
      viewer.zoomPerClick = 1.3;
    }

    viewerRef.current = viewer;
    OSDReferences.set(windowId, viewer);

    // Keep parent state in sync
    viewer.addHandler('viewport-change', onViewportChange);

    // Define home/world so built-in zoom buttons have a valid target range
    viewer.addHandler('open', () => {
      const world = viewer.world;
      if (world.getItemCount() > 0) {
        const bounds = world.getHomeBounds();
        viewer.viewport.fitBounds(bounds, true);

        // Optional: ensure min/max aren't clamping at home
        // (only set if caller didn't specify explicit min/max)
        if (viewer.viewport && viewer.viewport.minZoomLevel == null) {
          // allow zooming out a bit below "home"
          viewer.viewport.minZoomLevel = viewer.viewport.getZoom() * 0.5;
        }
        if (viewer.viewport && viewer.viewport.maxZoomLevel == null) {
          // allow zooming in well beyond "home"
          viewer.viewport.maxZoomLevel = viewer.viewport.getZoom() * 40;
        }
      }
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowId]); // only once

  const pluginProps = {
    canvasWorld,
    drawAnnotations,
    infoResponses,
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
  infoResponses: PropTypes.arrayOf(PropTypes.object),
  label: PropTypes.string,
  nonTiledImages: PropTypes.array,
  osdConfig: PropTypes.object,
  updateViewport: PropTypes.func.isRequired,
  viewerConfig: PropTypes.object,
  windowId: PropTypes.string.isRequired,
};
