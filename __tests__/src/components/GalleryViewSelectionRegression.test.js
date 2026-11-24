import { render, screen } from '@tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { Utils } from 'manifesto.js';
import { select } from 'redux-saga/effects';
import { expectSaga } from 'redux-saga-test-plan';
import manifestJson from '../../fixtures/version-2/019.json';
import { getCanvasWorld } from '../../utils/mirador-wrappers';
import { GalleryViewThumbnail } from '../../../src/components/GalleryViewThumbnail';
import { OpenSeadragonViewer } from '../../../src/components/OpenSeadragonViewer';
import { setCurrentAnnotationsOnCurrentCanvas } from '../../../src/state/sagas/windows';
import ActionTypes from '../../../src/state/actions/action-types';
import {
  getCanvasForAnnotation,
  getSearchForWindow,
  getSelectedAnnotationId,
  getWindow,
} from '../../../src/state/selectors';

const canvases = Utils.parseManifest(manifestJson).getSequences()[0].getCanvases();

describe('Gallery view page selection with active search result (Issue #115)', () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it('deselects a stale selectedAnnotationId before switching canvas when clicking a non-selected gallery thumbnail', async () => {
    const callOrder = [];
    const deselectAnnotation = vi.fn((annoId) => callOrder.push(['deselect', annoId]));
    const setCanvas = vi.fn((canvasId) => callOrder.push(['setCanvas', canvasId]));
    const focusOnCanvas = vi.fn();
    const user = userEvent.setup();

    render(
      <GalleryViewThumbnail
        canvas={canvases[0]}
        selected={false}
        selectedAnnotationId="https://example.org/anno/hit-3"
        deselectAnnotation={deselectAnnotation}
        focusOnCanvas={focusOnCanvas}
        setCanvas={setCanvas}
        windowId="win-1"
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(deselectAnnotation).toHaveBeenCalledWith('https://example.org/anno/hit-3');
    expect(setCanvas).toHaveBeenCalledWith(canvases[0].id);
    expect(callOrder).toEqual([
      ['deselect', 'https://example.org/anno/hit-3'],
      ['setCanvas', canvases[0].id],
    ]);
    expect(focusOnCanvas).not.toHaveBeenCalled();
  });

  it('does not deselect selectedAnnotationId when clicking the already-selected gallery thumbnail', async () => {
    const deselectAnnotation = vi.fn();
    const setCanvas = vi.fn();
    const focusOnCanvas = vi.fn();
    const user = userEvent.setup();

    render(
      <GalleryViewThumbnail
        canvas={canvases[0]}
        selected
        selectedAnnotationId="https://example.org/anno/hit-3"
        deselectAnnotation={deselectAnnotation}
        focusOnCanvas={focusOnCanvas}
        setCanvas={setCanvas}
        windowId="win-1"
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(deselectAnnotation).not.toHaveBeenCalled();
    expect(focusOnCanvas).toHaveBeenCalled();
    expect(setCanvas).not.toHaveBeenCalled();
  });

  it('does not hijack setCanvas back to a stale selectedAnnotationId when OpenSeadragonViewer remounts on a different canvas', () => {
    const setCanvas = vi.fn();
    const staleAnnoOnCanvas2 = {
      id: 'https://example.org/anno/hit-3',
      target: `${canvases[1].id}#xywh=10,20,100,40`,
      targetId: canvases[1].id,
    };

    render(
      <OpenSeadragonViewer
        windowId="win-1"
        viewType="single"
        canvases={canvases}
        visibleCanvases={[canvases[0]]}
        currentCanvasId={canvases[0].id}
        canvasWorld={getCanvasWorld([canvases[0]])}
        searchAnnotations={[staleAnnoOnCanvas2]}
        selectedAnnotationId={staleAnnoOnCanvas2.id}
        setCanvas={setCanvas}
        updateViewport={vi.fn()}
      />,
      {
        preloadedState: {
          manifests: {
            'manifest-1': { id: 'manifest-1', json: manifestJson },
          },
          windows: {
            'win-1': {
              id: 'win-1',
              manifestId: 'manifest-1',
              canvasId: canvases[0].id,
              visibleCanvases: [canvases[0].id],
              selectedAnnotationId: staleAnnoOnCanvas2.id,
            },
          },
        },
      },
    );

    expect(setCanvas).not.toHaveBeenCalledWith(canvases[1].id);
  });

  it('clears a stale selectedAnnotationId in setCurrentAnnotationsOnCurrentCanvas when navigating to a different canvas', () => {
    const action = {
      type: ActionTypes.SET_CANVAS,
      visibleCanvases: ['https://example.org/canvas/1'],
      windowId: 'win-1',
    };

    return expectSaga(setCurrentAnnotationsOnCurrentCanvas, action)
      .provide([
        [select(getSearchForWindow, { windowId: 'win-1' }), { 'win-1-topbar': { query: 'test' } }],
        [select(getWindow, { windowId: 'win-1' }), { id: 'win-1', topBarSearchQuery: 'test' }],
        [select(getSelectedAnnotationId, { windowId: 'win-1' }), 'https://example.org/anno/hit-3'],
        [select(getCanvasForAnnotation, { annotationId: 'https://example.org/anno/hit-3', windowId: 'win-1' }), { id: 'https://example.org/canvas/5' }],
      ])
      .put({
        annotationId: 'https://example.org/anno/hit-3',
        type: ActionTypes.DESELECT_ANNOTATION,
        windowId: 'win-1',
      })
      .run();
  });
});
