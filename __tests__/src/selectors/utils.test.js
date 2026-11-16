import { normalizeCanvasId } from '../../../src/state/selectors/utils';

describe('normalizeCanvasId', () => {
  it('matches ARK canvas identities across Presentation API hosts and protocols', () => {
    const path = '/manifest/69429/m1/canvas/69429/c1';
    expect(normalizeCanvasId(`http://www2-iiif-pres-dev.canadiana.ca${path}#xywh=1,2,3,4`))
      .toBe(normalizeCanvasId(`https://www-iiif-pres-dev.canadiana.ca${path}`));
  });

  it('preserves manifest and canvas ARKs when comparing resources', () => {
    expect(normalizeCanvasId('https://example.org/manifest/69429/m1/canvas/69429/c1'))
      .not.toBe(normalizeCanvasId('https://example.org/manifest/69429/m2/canvas/69429/c1'));
    expect(normalizeCanvasId('https://example.org/manifest/69429/m1/canvas/69429/c1'))
      .not.toBe(normalizeCanvasId('https://example.org/manifest/69429/m1/canvas/69429/c2'));
  });

  it('does not discard host identity for ordinary non-ARK canvas URLs', () => {
    expect(normalizeCanvasId('https://one.example.org/canvas/1'))
      .not.toBe(normalizeCanvasId('https://two.example.org/canvas/1'));
  });

  it('retains existing encoded-slash and trailing-slash normalization', () => {
    expect(normalizeCanvasId('https://example.org/canvas%2F1/#xywh=1,2,3,4'))
      .toBe(normalizeCanvasId('http://example.org/canvas/1'));
  });
});
