import { render, screen } from '@tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { SearchPanelNavigation } from '../../../src/components/SearchPanelNavigation';

/**
 * Helper function to create a shallow wrapper around SearchPanelNavigation
 */
function createWrapper(props) {
  return render(
    <SearchPanelNavigation
      companionWindowId="cw"
      direction="ltr"
      windowId="window"
      selectAnnotation={vi.fn()}
      setCurrentCanvas={vi.fn()}
      {...props}
    />,
  );
}

describe('SearchPanelNavigation', () => {
  describe('when searchHits are available', () => {
    it('renders text with buttons', async () => {
      const selectAnnotation = vi.fn();
      const user = userEvent.setup();
      createWrapper({
        searchHits: [{ annotations: ['1'] }, { annotations: ['2'] }, { annotations: ['3'] }],
        selectAnnotation,
        selectedContentSearchAnnotation: ['2'],
      });
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
      expect(screen.getAllByRole('button').length).toEqual(2);
      await user.click(screen.getByRole('button', { name: 'Previous result' }));
      expect(selectAnnotation).toHaveBeenCalledWith('1');
      await user.click(screen.getByRole('button', { name: 'Next result' }));
      expect(selectAnnotation).toHaveBeenLastCalledWith('2');
    });
    it('buttons disabled when no next/prev', () => {
      createWrapper({
        searchHits: [{ annotations: ['1'] }],
        selectedContentSearchAnnotation: ['1'],
      });
      expect(screen.getByRole('button', { name: 'Previous result' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Next result' })).toBeDisabled();
    });

    it('disables the last result with a disabled colour and cursor', async () => {
      const user = userEvent.setup();
      const selectAnnotation = vi.fn();
      createWrapper({
        searchHits: [{ annotations: ['1'] }, { annotations: ['2'] }],
        selectedContentSearchAnnotation: ['1'],
        selectAnnotation,
      });

      await user.click(screen.getByRole('button', { name: 'Next result' }));

      const next = screen.getByRole('button', { name: 'Next result' });
      expect(next).toBeDisabled();
      expect(next).toHaveStyle({ cursor: 'not-allowed', pointerEvents: 'auto' });
      expect(getComputedStyle(next).color).toBe('rgba(0, 0, 0, 0.26)');
      await user.click(next);
      expect(selectAnnotation).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('button', { name: 'Previous result' })).toBeEnabled();
    });

    it('keeps next enabled at the loaded boundary when another search page exists', async () => {
      const fetchSearch = vi.fn();
      const user = userEvent.setup();
      createWrapper({
        searchHits: [{ annotations: ['1'] }],
        selectedContentSearchAnnotation: ['1'],
        nextSearch: 'https://example.org/search?page=2',
        query: 'news',
        fetchSearch,
      });

      await user.click(screen.getByRole('button', { name: 'Next result' }));

      expect(fetchSearch).toHaveBeenCalledWith('window', 'cw', 'https://example.org/search?page=2', 'news');
    });

    it('navigates to the manifest canvas when search annotations use an alias hostname', async () => {
      const canvasId = 'http://www-iiif-pres-dev.canadiana.ca/manifest/69429/m1/canvas/69429/c2';
      const focusOnCanvas = vi.fn();
      const user = userEvent.setup();
      createWrapper({
        searchHits: [{ annotations: ['1'] }, { annotations: ['2'] }],
        selectedContentSearchAnnotation: ['1'],
        searchAnnotations: [{ id: '2', targetId: canvasId.replace('www-', 'www2-') }],
        canvases: [{ id: canvasId }],
        currentCanvas: { id: 'http://www-iiif-pres-dev.canadiana.ca/manifest/69429/m1/canvas/69429/c1' },
        focusOnCanvas,
      });

      await user.click(screen.getByRole('button', { name: 'Next result' }));

      expect(focusOnCanvas).toHaveBeenCalledWith(canvasId);
    });
  });
});
