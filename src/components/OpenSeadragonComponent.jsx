import Openseadragon from 'openseadragon';
import PropTypes from 'prop-types';
import {
  useEffect, useId, useRef, useReducer,
  useState, useCallback,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslation } from 'react-i18next';
import OpenSeadragonViewerContext from '../contexts/OpenSeadragonViewerContext';

/** Handle setting up OSD for use in mirador + react */
function OpenSeadragonComponent({
  children = undefined,
  Container = 'div',
  osdConfig = {},
  viewerConfig = {},
  onUpdateViewport = () => {},
  setViewer = () => {},
  style = {},
  ...passThruProps
}) {
  const id = useId();
  const ref = useRef();
  const [grabbing, setGrabbing] = useState(false);
  const viewerRef = useRef(undefined);
  const initialViewportSet = useRef(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Debounced moveHandler for mirador-style mouse-move events
  const moveHandler = useDebouncedCallback(useCallback((event) => {
    viewerRef.current?.raiseEvent('mouse-move', event);
  }, [viewerRef]), 10);

  const onViewportChange = useCallback((event) => {
    const { viewport } = event.eventSource;
    if (!initialViewportSet.current) return;

    onUpdateViewport({
      bounds: viewport.getBounds(),
      flip: viewport.getFlip(),
      rotation: viewport.getRotation(),
      x: Math.round(viewport.centerSpringX.target.value),
      y: Math.round(viewport.centerSpringY.target.value),
      zoom: viewport.zoomSpring.target.value,
    });
  }, [onUpdateViewport]);

  const setInitialBounds = useCallback(({ viewport }) => {
    if (initialViewportSet.current) return;
    initialViewportSet.current = true;

    if (viewerConfig.x != null && viewerConfig.y != null) {
      viewport.panTo(new Openseadragon.Point(viewerConfig.x, viewerConfig.y), true);
    }
    if (viewerConfig.zoom != null) {
      viewport.zoomTo(viewerConfig.zoom, new Openseadragon.Point(viewerConfig.x, viewerConfig.y), true);
    }
    if (viewerConfig.rotation != null && viewerConfig.rotation !== viewport.getRotation()) {
      viewport.setRotation(viewerConfig.rotation);
    }
    if (viewerConfig.flip != null && (viewerConfig.flip || false) !== viewport.getFlip()) {
      viewport.setFlip(viewerConfig.flip);
    }

    if (!viewerConfig.x && !viewerConfig.y && !viewerConfig.zoom) {
      if (viewerConfig.bounds) {
        viewport.fitBounds(new Openseadragon.Rect(...viewerConfig.bounds), true);
      } else {
        viewport.goHome(true);
      }
    }
  }, [viewerConfig]);

  // Update viewport if viewerConfig changes
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const { viewport } = viewer;
    if (!initialViewportSet.current) {
      setInitialBounds(viewer);
      return;
    }

    if (viewerConfig.x != null && viewerConfig.y != null
      && (Math.round(viewerConfig.x) !== Math.round(viewport.centerSpringX.target.value)
      || Math.round(viewerConfig.y) !== Math.round(viewport.centerSpringY.target.value))) {
      viewport.panTo(new Openseadragon.Point(viewerConfig.x, viewerConfig.y), false);
    }

    if (viewerConfig.zoom != null && viewerConfig.zoom !== viewport.zoomSpring.target.value) {
      viewport.zoomTo(viewerConfig.zoom, new Openseadragon.Point(viewerConfig.x, viewerConfig.y), false);
    }

    if (viewerConfig.rotation != null && viewerConfig.rotation !== viewport.getRotation()) {
      viewport.setRotation(viewerConfig.rotation);
    }

    if (viewerConfig.flip != null && (viewerConfig.flip || false) !== viewport.getFlip()) {
      viewport.setFlip(viewerConfig.flip);
    }

    if (viewerConfig.bounds && !viewerConfig.x && !viewerConfig.y && !viewerConfig.zoom) {
      const rect = new Openseadragon.Rect(...viewerConfig.bounds);
      if (rect.equals(viewport.getBounds())) {
        viewport.fitBounds(rect, false);
      }
    }
  }, [viewerConfig, setInitialBounds]);

  // Initialize OpenSeadragon viewer
  useEffect(() => {
    const viewer = Openseadragon({
      element: ref.current,
      ...osdConfig,
    });

    viewer.addHandler('canvas-drag', () => setGrabbing(true));
    viewer.addHandler('canvas-drag-end', () => setGrabbing(false));

    viewer.addHandler('canvas-double-click', ({ position, shift }) => {
      if (!osdConfig.zoomPerDoubleClick) return;
      const currentZoom = viewer.viewport.getZoom();
      const zoomRatio = (shift ? 1 / osdConfig.zoomPerDoubleClick : osdConfig.zoomPerDoubleClick);
      viewer.viewport.zoomTo(currentZoom * zoomRatio, viewer.viewport.pointFromPixel(position), false);
    });

    ['zoom', 'pan', 'animation', 'animation-finish'].forEach(event =>
      viewer.addHandler(event, onViewportChange)
    );

    if (viewer.innerTracker && viewer.innerTracker.moveHandler) {
      const originalMoveHandler = viewer.innerTracker.moveHandler;
      viewer.innerTracker.moveHandler = (event) => {
        originalMoveHandler(event); // built-in behavior
        moveHandler(event);         // custom shim
      };
    }

    viewerRef.current = viewer;
    setViewer(viewer);

    viewer.addOnceHandler('tile-loaded', () => {
      initialViewportSet.current = false;
      setInitialBounds(viewer);
    });

    forceUpdate();
  }, [ref]);

  // Cleanup
  useEffect(() => () => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    if (viewer.innerTracker?.moveHandler === moveHandler) {
      viewer.innerTracker.moveHandler = () => {};
    }
    viewer.removeAllHandlers();
    viewer.destroy();
    viewerRef.current = undefined;
    setViewer(null);
  }, []);

  const { t } = useTranslation();

  // Accessibility
  useEffect(() => {
    const canvas = viewerRef?.current?.canvas?.firstElementChild;
    if (canvas) {
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', t('digitizedView'));
      canvas.setAttribute('aria-describedby', id);
    }
  }, [id, t]);

  return (
    <OpenSeadragonViewerContext.Provider value={viewerRef}>
      <Container
        id={id}
        ref={ref}
        style={{ ...style, cursor: grabbing ? 'grabbing' : 'grab' }}
        {...passThruProps}
      >
        {children}
      </Container>
    </OpenSeadragonViewerContext.Provider>
  );
}

OpenSeadragonComponent.propTypes = {
  children: PropTypes.node,
  Container: PropTypes.elementType,
  onUpdateViewport: PropTypes.func,
  osdConfig: PropTypes.object,
  setViewer: PropTypes.func,
  style: PropTypes.object,
  viewerConfig: PropTypes.shape({
    bounds: PropTypes.arrayOf(PropTypes.number),
    flip: PropTypes.bool,
    rotation: PropTypes.number,
    x: PropTypes.number,
    y: PropTypes.number,
    zoom: PropTypes.number,
  }),
};

export default OpenSeadragonComponent;
