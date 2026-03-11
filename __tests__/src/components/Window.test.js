import { MosaicWindowContext } from 'react-mosaic-component2';
import { render, screen } from '@tests/utils/test-utils';
import { waitFor } from '@testing-library/react';

import { Window } from '../../../src/components/Window';

/** create wrapper */
function createWrapper(props, state, renderOptions) {
  return render(
    <Window
      windowId="xyz"
      manifestId="foo"
      classes={{}}
      {...props}
    />,
    {
      preloadedState: {
        windows: {
          xyz: {
            collectionDialogOn: false,
            companionWindowIds: [],
          },
        },
      },
    },
    { renderOptions },
  );
}

describe('Window', () => {
  it('should render outer element', () => {
    createWrapper();
    expect(screen.getByLabelText('Window:')).toHaveClass('mirador-window');
  });
  it('should render <WindowTopBar>', () => {
    createWrapper();
    expect(screen.getByRole('navigation', { accessibleName: 'Window navigation' })).toBeInTheDocument();
  });
  it('should render <PrimaryWindow>', () => {
    createWrapper();
    expect(document.querySelector('.mirador-primary-window')).toBeInTheDocument(); // eslint-disable-line testing-library/no-node-access
  });
  // See ErrorContent.test.js for futher testing of this functionality
  it('renders alert box when there is an error', async () => {
    createWrapper({ manifestError: 'Invalid JSON' });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  describe('when workspaceType is mosaic', () => {
    it('calls the context mosaicWindowActions connectDragSource method to make WindowTopBar draggable', () => {
      const connectDragSource = vi.fn(component => component);
      render(
        <MosaicWindowContext.Provider value={{ mosaicWindowActions: { connectDragSource } }}>
          <Window
            windowId="xyz"
            manifestId="foo"
            classes={{}}
            windowDraggable
            workspaceType="mosaic"
          />
        </MosaicWindowContext.Provider>,
        {
          preloadedState: {
            windows: {
              xyz: {
                collectionDialogOn: false,
                companionWindowIds: [],
              },
            },
          },
        },
      );
      expect(connectDragSource).toHaveBeenCalled();
    });
    it('does not call the context mosaicWindowActions connectDragSource when the windowDraggable is set to false', () => {
      const connectDragSource = vi.fn(component => component);
      render(
        <MosaicWindowContext.Provider value={{ mosaicWindowActions: { connectDragSource } }}>
          <Window
            windowId="xyz"
            manifestId="foo"
            classes={{}}
            windowDraggable={false}
            workspaceType="mosaic"
          />
        </MosaicWindowContext.Provider>,
        {
          preloadedState: {
            windows: {
              xyz: {
                collectionDialogOn: false,
                companionWindowIds: [],
              },
            },
          },
        },
      );
      expect(connectDragSource).not.toHaveBeenCalled();
    });
  });

  it('disables split-handle resizing in mobile layout', async () => {
    const originalGetBoundingClientRect = HTMLElement.prototype.getBoundingClientRect;
    HTMLElement.prototype.getBoundingClientRect = vi.fn(() => ({
      bottom: 900,
      height: 900,
      left: 0,
      right: 500,
      toJSON: () => {},
      top: 0,
      width: 500,
      x: 0,
      y: 0,
    }));

    const { container } = createWrapper();

    await waitFor(() => {
      expect(container.querySelector('.mosaic-split')).toBeNull(); // eslint-disable-line testing-library/no-node-access, testing-library/no-container
    });

    HTMLElement.prototype.getBoundingClientRect = originalGetBoundingClientRect;
  });
});
