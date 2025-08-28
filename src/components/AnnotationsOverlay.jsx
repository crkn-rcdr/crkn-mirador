import React, { useEffect, useRef } from "react";
import OpenSeadragon from "openseadragon";

/** Parse annotation target into canvasId + xywh */
function parseTarget(annotation) {
  const targetId = annotation?.targetId;
  if (!targetId) return {};
  const [canvasId, fragment] = targetId.split("#");
  if (!fragment || !fragment.startsWith("xywh=")) return { canvasId };
  const rect = fragment
    .replace("xywh=", "")
    .split(",")
    .map((n) => parseInt(n, 10));
  return { canvasId, rect };
}

/**
 * AnnotationsOverlay: Draws highlight boxes + labels on OSD canvas overlay
 */
export function AnnotationsOverlay({
  viewer,
  searchAnnotations = [],
  currentCanvasId,
  canvasWorld,
}) {
  const overlayRef = useRef(null);

  /** Initialize overlay canvas once */
  useEffect(() => {
    if (!viewer || !viewer.container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    const containerEl = viewer.container;
    canvas.width = containerEl?.clientWidth || 0;
    canvas.height = containerEl?.clientHeight || 0;
    canvas.style.pointerEvents = "none";
    containerEl?.appendChild(canvas);
    overlayRef.current = canvas;

    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!overlayRef.current || !viewer.world.getItemCount()) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ids = (canvasWorld?.canvasIds || []).map(s => (s || '').toString());
      searchAnnotations.forEach((annoWrapper) => {
        (annoWrapper.resources || []).forEach((anno) => {
          const { canvasId, rect } = parseTarget(anno);
          if (!rect) return;

          // draw only if this canvas is visible in current world
          const idx = ids.findIndex(id => id.split('#')[0] === (canvasId || '').split('#')[0]);
          if (idx < 0 || idx >= viewer.world.getItemCount()) return;

          const [x, y, w, h] = rect;
          const item = viewer.world.getItemAt(idx);
          if (!item?.imageToViewportRectangle) return;

          const rectImg = new OpenSeadragon.Rect(x, y, w, h);
          const vpRect = item.imageToViewportRectangle(rectImg);
          const screenRect = viewer.viewport.viewportToViewerElementRectangle(vpRect);

          ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
          ctx.fillRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
        });
      });
    };

    const handleResize = () => {
      if (!overlayRef.current || !viewer?.container) return;
      canvas.width = viewer.container?.clientWidth || 0;
      canvas.height = viewer.container?.clientHeight || 0;
      draw();
    };

    viewer.addHandler("viewport-change", draw);
    viewer.addHandler("resize", handleResize);
    viewer.addHandler("open", draw); // redraw when new image opens

    return () => {
      viewer.removeHandler("viewport-change", draw);
      viewer.removeHandler("resize", handleResize);
      viewer.removeHandler("open", draw);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      overlayRef.current = null;
    };
  }, [viewer, searchAnnotations, currentCanvasId, canvasWorld]);

  /** Redraw whenever annotations or current canvas changes */
  useEffect(() => {
    if (!overlayRef.current || !viewer?.world?.getItemAt(0)) return;
    const ctx = overlayRef.current.getContext("2d");
    ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);

    searchAnnotations.forEach((annoWrapper) => {
      (annoWrapper.resources || []).forEach((anno) => {
        const { canvasId, rect } = parseTarget(anno);
        if (!rect || canvasId !== currentCanvasId) return;

        const [x, y, w, h] = rect;
        const item = viewer.world.getItemAt(0);
        if (!item?.imageToViewportRectangle) return;

        const rectImg = new OpenSeadragon.Rect(x, y, w, h);
        const vpRect = item.imageToViewportRectangle(rectImg);
        const screenRect = viewer.viewport.viewportToViewerElementRectangle(vpRect);

        ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
        ctx.fillRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
      });
    });
  }, [searchAnnotations, currentCanvasId, viewer, canvasWorld]);

  return null;
}
