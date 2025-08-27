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
  currentCanvasId, // ✅ current canvas from Redux
}) {
  const overlayRef = useRef(null);

  /** Initialize overlay canvas once */
  useEffect(() => {
    if (!viewer) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = viewer.container.clientWidth;
    canvas.height = viewer.container.clientHeight;
    canvas.style.pointerEvents = "none";
    viewer.container.appendChild(canvas);
    overlayRef.current = canvas;

    const ctx = canvas.getContext("2d");

    const draw = () => {
      if (!overlayRef.current || !viewer.world.getItemCount()) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      searchAnnotations.forEach((annoWrapper) => {
        (annoWrapper.resources || []).forEach((anno) => {
          const { canvasId, rect } = parseTarget(anno);
          if (!rect || canvasId !== currentCanvasId) return;

          const [x, y, w, h] = rect;
          const item = viewer.world.getItemAt(0);
          if (!item?.imageToViewportRectangle) return; // SAFETY

          const rectImg = new OpenSeadragon.Rect(x, y, w, h);
          const vpRect = item.imageToViewportRectangle(rectImg);
          const screenRect = viewer.viewport.viewportToViewerElementRectangle(vpRect);

          ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
          ctx.fillRect(screenRect.x, screenRect.y, screenRect.width, screenRect.height);
        });
      });
    };

    const handleResize = () => {
      if (!overlayRef.current) return;
      canvas.width = viewer.container.clientWidth;
      canvas.height = viewer.container.clientHeight;
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
  }, [viewer, searchAnnotations, currentCanvasId]);

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
  }, [searchAnnotations, currentCanvasId, viewer]);

  return null;
}
