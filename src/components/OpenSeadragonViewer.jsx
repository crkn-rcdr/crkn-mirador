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
  const [internalIndex, setInternalIndex] = useState(0);

  const canvasIndex = useSelector(state => getCanvasIndex(state, { windowId }));

  const canvasKeys = canvases.map(c => c.id).join('|');
  const nonTiledKeys = nonTiledImages.map(c => c.id).join('|');

  /** Fetch tile sources */
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
  }, [canvasKeys, nonTiledKeys, canvases, nonTiledImages]);

  /** Initialize OSD */
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
  }, [windowId, osdConfig, updateViewport]);

  /** Open tile sources */
  useEffect(() => {
    if (!viewerRef.current || tileSources.length === 0) return;

    viewerRef.current.open(tileSources);

    viewerRef.current.addOnceHandler('open', () => {
      const world = viewerRef.current.world;
      if (world.getItemCount() > 0) {
        viewerRef.current.viewport.fitBounds(world.getHomeBounds(), true);
        viewerRef.current.viewport.minZoomLevel = viewerRef.current.viewport.getZoom() * 0.5;
        viewerRef.current.viewport.maxZoomLevel = viewerRef.current.viewport.getZoom() * 40;

        if (canvasIndex >= 0) viewerRef.current.goToPage(canvasIndex);
        setInternalIndex(canvasIndex);
      }
    });
  }, [tileSources, canvasIndex]);

  /** Sync viewer when current canvas in Redux changes */
  useEffect(() => {
    if (!viewerRef.current || canvasIndex < 0 || internalIndex === canvasIndex) return;
    viewerRef.current.goToPage(canvasIndex);
    setInternalIndex(canvasIndex);
  }, [canvasIndex, internalIndex]);

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
    searchAnnotations,
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
};
