import MiradorCanvas from '../../lib/MiradorCanvas';
import MiradorManifest from '../../lib/MiradorManifest';

/** */
export const getMiradorCanvasWrapper = () => (
  (canvas) => canvas && new MiradorCanvas(canvas)
);

/** */
export const getMiradorManifestWrapper = () => (
  (manifest) => manifest && new MiradorManifest(manifest)
);
