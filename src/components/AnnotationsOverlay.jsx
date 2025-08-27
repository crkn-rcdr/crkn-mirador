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
  canvasWorld,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!viewer) return;

    // Create overlay <canvas>
    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.width = viewer.container.clientWidth;
    canvas.height = viewer.container.clientHeight;
    canvas.style.pointerEvents = "none"; // don't block drag/zoom
    viewer.container.appendChild(canvas);
    overlayRef.current = canvas;
    const ctx = canvas.getContext("2d");

    function draw() {
      if (!overlayRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 🔍 Which canvas is currently displayed?
      const pageIndex = viewer.currentPage();
      const currentCanvasId = canvasWorld?.canvasIds?.[pageIndex];

      searchAnnotations.forEach((annoWrapper) => {
        (annoWrapper.resources || []).forEach((anno) => {
          const { canvasId, rect } = parseTarget(anno);
          if (!rect || canvasId !== currentCanvasId) return; // 🚫 skip others

          const [x, y, w, h] = rect;

          const rectImg = new OpenSeadragon.Rect(x, y, w, h);
          const vpRect = viewer.world
            .getItemAt(0)
            .imageToViewportRectangle(rectImg);
          const screenRect = viewer.viewport.viewportToViewerElementRectangle(
            vpRect
          );

          // Highlight fill
          ctx.fillStyle = "rgba(255, 255, 0, 0.4)";
          ctx.fillRect(
            screenRect.x,
            screenRect.y,
            screenRect.width,
            screenRect.height
          );
        });
      });
    }

    draw();

    // Re-draw when viewport changes or viewer resizes
    viewer.addHandler("viewport-change", draw);
    viewer.addHandler("resize", () => {
      canvas.width = viewer.container.clientWidth;
      canvas.height = viewer.container.clientHeight;
      draw();
    });

    return () => {
      viewer.removeHandler("viewport-change", draw);
      viewer.container.removeChild(canvas);
      overlayRef.current = null;
    };
  }, [viewer, searchAnnotations, canvasWorld]);

  return null;
}
