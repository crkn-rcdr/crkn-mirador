import * as OpenSeadragon from 'openseadragon';

/**
 * OpenSeadragonCanvasOverlay - adapted from https://github.com/altert/OpenSeadragonCanvasOverlay
 * Used for rendering annotations on top of an OpenSeadragon viewer.
 */
export default class OpenSeadragonCanvasOverlay {
  constructor(viewer, ref) {
    this.viewer = viewer;
    this.ref = ref;

    this.containerWidth = 0;
    this.containerHeight = 0;
    this.imgAspectRatio = 1;
    this.clearBeforeRedraw = true;
  }

  /** Returns the canvas element */
  get canvas() {
    return this.canvasDiv?.firstElementChild;
  }

  /** Returns the container div */
  get canvasDiv() {
    return this.ref.current;
  }

  /** Returns 2D drawing context */
  get context2d() {
    return this.canvas?.getContext('2d');
  }

  /** Clears the canvas */
  clear() {
    if (!this.context2d) return;
    this.context2d.clearRect(0, 0, this.containerWidth, this.containerHeight);
  }

  /** Resizes the canvas to match viewer container */
  resize() {
    if (!this.viewer || !this.canvasDiv || !this.canvas) return;

    if (this.containerWidth !== this.viewer.container.clientWidth) {
      this.containerWidth = this.viewer.container.clientWidth;
      this.canvasDiv.setAttribute('width', this.containerWidth);
      this.canvas.setAttribute('width', this.containerWidth);
    }

    if (this.containerHeight !== this.viewer.container.clientHeight) {
      this.containerHeight = this.viewer.container.clientHeight;
      this.canvasDiv.setAttribute('height', this.containerHeight);
      this.canvas.setAttribute('height', this.containerHeight);
    }

    // Set viewport origin
    this.viewportOrigin = new OpenSeadragon.Point(0, 0);
    const boundsRect = this.viewer.viewport.getBoundsNoRotateWithMargins(true);
    this.viewportOrigin.x = boundsRect.x;
    this.viewportOrigin.y = boundsRect.y * this.imgAspectRatio;

    this.viewportWidth = boundsRect.width;
    this.viewportHeight = boundsRect.height * this.imgAspectRatio;

    const image = this.viewer.world.getItemAt(0);
    if (!image) return;

    this.imgWidth = image.source.dimensions.x;
    this.imgHeight = image.source.dimensions.y;
    this.imgAspectRatio = this.imgWidth / this.imgHeight;
  }

  /**
   * Updates the canvas by applying transformations and running the provided draw function
   * @param {Function} update - callback to render annotations
   */
  canvasUpdate(update) {
    const context = this.context2d;
    if (!context || !this.viewer) return;

    const viewportZoom = this.viewer.viewport.getZoom(true);
    const image = this.viewer.world.getItemAt(0);
    if (!image) return;

    const zoom = image.viewportToImageZoom(viewportZoom);

    const x = ((this.viewportOrigin.x / this.imgWidth - this.viewportOrigin.x) / this.viewportWidth) * this.containerWidth;
    const y = ((this.viewportOrigin.y / this.imgHeight - this.viewportOrigin.y) / this.viewportHeight) * this.containerHeight;

    if (this.clearBeforeRedraw) this.clear();
    context.translate(x, y);
    context.scale(zoom, zoom);

    const center = this.viewer.viewport.getCenter();

    // Handle flipping
    const flip = this.viewer.viewport.getFlip();
    if (flip) {
      context.translate(center.x * 2, 0);
      context.scale(-1, 1);
    }

    // Handle rotation
    const rotation = this.viewer.viewport.getRotation();
    if (rotation !== 0) {
      context.translate(center.x, center.y);
      context.rotate((rotation * Math.PI) / 180);
      context.translate(-center.x, -center.y);
    }

    // Execute provided drawing callback
    update?.();

    // Reset transform
    context.setTransform(1, 0, 0, 1, 0, 0);
  }
}
