import { fireEvent, render, screen } from '@tests/utils/test-utils';
import { Utils } from 'manifesto.js';

import manifestJson from '../../fixtures/version-2/019.json';
import { GalleryView } from '../../../src/components/GalleryView';

vi.mock(
  'react-virtualized-auto-sizer',
  () => ({
    default: ({ children }) => children({ height: 600, width: 220 }),
  }),
);

vi.mock(
  '../../../src/containers/GalleryViewThumbnail',
  () => ({
    default: ({ canvas }) => (
      <button type="button" data-testid="gallery-thumb">
        {canvas?.id || canvas?.index}
      </button>
    ),
  }),
);

vi.mock(
  '../../../src/containers/WindowViewSettings',
  () => ({
    default: ({ windowId }) => <div data-testid="deep-zoom-settings">{windowId}</div>,
  }),
);

/** create wrapper */
function createWrapper(props) {
  return render(
    <GalleryView
      canvases={Utils.parseManifest(manifestJson).getSequences()[0].getCanvases().slice(0, 3)}
      windowId="1234"
      {...props}
    />,
  );
}

describe('GalleryView', () => {
  const thumbnailSizePreferenceKey = 'mirador.windowThumbnailSizePreference';

  beforeEach(() => {
    window.localStorage.removeItem(thumbnailSizePreferenceKey);
  });

  it('renders thumbnails for canvases', () => {
    createWrapper();
    expect(screen.getAllByTestId('gallery-thumb')).toHaveLength(3);
  });

  it('follows page navigation forward and backward in the virtualized thumbnails', () => {
    const canvases = Array.from({ length: 40 }, (_, index) => ({
      id: `http://www-iiif-pres-dev.canadiana.ca/manifest/69429/m1/canvas/69429/c${index}`,
      index,
      width: 100,
      height: 140,
    }));
    const first = canvases[0];
    const last = canvases[canvases.length - 1];
    const { rerender } = createWrapper({ canvases, currentCanvasId: first.id });

    rerender(<GalleryView canvases={canvases} currentCanvasId={last.id.replace('www-', 'www2-')} windowId="1234" />);
    expect(screen.getByText(last.id)).toBeInTheDocument();
    expect(screen.queryByText(first.id)).not.toBeInTheDocument();

    rerender(<GalleryView canvases={canvases} currentCanvasId={first.id} windowId="1234" />);
    expect(screen.getByText(first.id)).toBeInTheDocument();
    expect(screen.queryByText(last.id)).not.toBeInTheDocument();
  });

  it('follows page navigation in the horizontal bottom strip', () => {
    const canvases = Array.from({ length: 40 }, (_, index) => ({
      id: `https://example.org/canvas/${index}`,
      index,
      width: 100,
      height: 140,
    }));
    const first = canvases[0];
    const last = canvases[canvases.length - 1];
    const { rerender } = createWrapper({ canvases, currentCanvasId: first.id, isBottomStrip: true });

    rerender(<GalleryView canvases={canvases} currentCanvasId={last.id} windowId="1234" isBottomStrip />);
    expect(screen.getByText(last.id)).toBeInTheDocument();
    expect(screen.queryByText(first.id)).not.toBeInTheDocument();
  });

  it('shows deep zoom layout controls in split mode', () => {
    createWrapper({ showDeepZoomLayoutControls: true });
    expect(screen.queryByText('Deep zoom layout')).not.toBeInTheDocument();
    expect(screen.getByTestId('deep-zoom-settings')).toBeInTheDocument();
    const slider = screen.getByRole('slider', { name: 'Thumbnail size' });
    const deepZoomControls = screen.getByTestId('deep-zoom-settings');
    expect(
      slider.compareDocumentPosition(deepZoomControls) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('hides deep zoom layout controls when split mode is not active', () => {
    createWrapper({ showDeepZoomLayoutControls: false });
    expect(screen.queryByTestId('deep-zoom-settings')).not.toBeInTheDocument();
  });

  it('groups thumbnails in pairs for split book mode', () => {
    const { container } = createWrapper({ showDeepZoomLayoutControls: true, viewType: 'book' });
    expect(container.querySelectorAll('.mirador-book-pair-group').length).toBeGreaterThan(0); // eslint-disable-line testing-library/no-node-access
  });

  it('restores thumbnail size from persisted preference', () => {
    window.localStorage.setItem(thumbnailSizePreferenceKey, 'l');
    createWrapper();

    const slider = screen.getByRole('slider', { name: 'Thumbnail size' });
    expect(slider).toHaveAttribute('aria-valuenow', '2');
  });

  it('persists thumbnail size when changed', () => {
    createWrapper();

    const largerButton = screen.getByRole('button', { name: 'Larger thumbnails' });
    fireEvent.click(largerButton);

    expect(window.localStorage.getItem(thumbnailSizePreferenceKey)).toEqual('m');
  });
});
