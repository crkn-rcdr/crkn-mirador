import { screen, fireEvent, render } from '@tests/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { WindowTopBar } from '../../../src/components/WindowTopBar';

import FullscreenContext from '../../../src/contexts/FullScreenContext';

/** create wrapper */
function Subject({ ...props }) {
  return (
    <FullscreenContext.Provider value={vi.fn()}>
      <WindowTopBar
        windowId="xyz"
        classes={{}}
        focusWindow={() => {}}
        maximized={false}
        maximizeWindow={() => {}}
        minimizeWindow={() => {}}
        removeWindow={() => {}}
        {...props}
      />
    </FullscreenContext.Provider>
  );
}

describe('WindowTopBar', () => {
  let user;
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders all default components', () => {
    render(<Subject />);
    expect(screen.getByRole('navigation', { name: 'Window navigation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Toggle sidebar' })).toBeInTheDocument();
    expect(screen.queryByText('Deep zoom layout')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close window' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Full screen' })).not.toBeInTheDocument();
  });

  it('uses allow flags to override defaults', () => {
    render(<Subject
      allowWindowSideBar={false}
      allowClose={false}
      allowTopMenuButton={false}
      allowFullscreen
    />);
    expect(screen.queryByRole('button', { name: 'Toggle sidebar' })).not.toBeInTheDocument();
    expect(screen.queryByText('Deep zoom layout')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close window' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Full screen' })).toBeInTheDocument();
  });

  it('triggers window focus when clicked', () => {
    const focusWindow = vi.fn();
    render(<Subject focusWindow={focusWindow} />);
    const toolbar = screen.getByRole('navigation', { name: 'Window navigation' }).firstChild; // eslint-disable-line testing-library/no-node-access
    expect(toolbar).toBeInTheDocument();
    // we specifically need mouseDown not click for MUI Toolbar here
    fireEvent.mouseDown(toolbar);
    expect(focusWindow).toHaveBeenCalledTimes(1);
  });

  it('passes correct callback to toggleWindowSideBar button', async () => {
    const toggleWindowSideBar = vi.fn();
    render(
      <Subject allowWindowSideBar toggleWindowSideBar={toggleWindowSideBar} />,
      { preloadedState: { windows: { xyz: { sideBarOpen: false } } } },
    );
    const button = screen.getByRole('button', { name: 'Toggle sidebar' });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(toggleWindowSideBar).toHaveBeenCalledTimes(1);
  });

  it('passes correct callback to closeWindow button', async () => {
    const removeWindow = vi.fn();
    render(<Subject allowClose removeWindow={removeWindow} />);
    const button = screen.getByRole('button', { name: 'Close window' });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(removeWindow).toHaveBeenCalledTimes(1);
  });

  it('passes correct callback to view mode toggle buttons', async () => {
    const onChangeViewMode = vi.fn();
    render(<Subject viewMode="both" onChangeViewMode={onChangeViewMode} />);

    const button = screen.getByRole('button', { name: 'Gallery only' });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(onChangeViewMode).toHaveBeenCalledWith('gallery');
  });

  it('close button is configurable', () => {
    render(<Subject allowClose={false} />);
    const button = screen.queryByRole('button', { name: 'Close window' });
    expect(button).not.toBeInTheDocument();
  });

  it('maximize button is configurable', () => {
    render(<Subject allowMaximize={false} />);
    const button = screen.queryByRole('button', { name: 'Maximize window' });
    expect(button).not.toBeInTheDocument();
  });

  it('does not render a title when hideWindowTitle is true', () => {
    render(<Subject hideWindowTitle />);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('shows a localized unavailable search message when content search is missing', () => {
    render(<Subject showSearchUnavailable />);

    expect(screen.getByText('Search is not available')).toBeInTheDocument();
  });

  it('renders only split and gallery view toggles with labels below icons', async () => {
    render(<Subject viewMode="both" onChangeViewMode={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Split view' })).toHaveTextContent('Split view');
    expect(screen.getByRole('button', { name: 'Gallery only' })).toHaveTextContent('Gallery only');
    expect(screen.queryByRole('button', { name: 'Primary only' })).not.toBeInTheDocument();
  });

  it('does not render deep zoom layout controls in the top bar', () => {
    render(<Subject viewMode="gallery" />);

    expect(screen.queryByText('Deep zoom layout')).not.toBeInTheDocument();
    expect(screen.queryByText('Available in Split mode')).not.toBeInTheDocument();
  });
});
