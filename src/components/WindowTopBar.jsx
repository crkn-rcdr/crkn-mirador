import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/MenuSharp';
import CloseIcon from '@mui/icons-material/CloseSharp';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import WindowTopMenu from '../containers/WindowTopMenu';
import WindowTopBarPluginArea from '../containers/WindowTopBarPluginArea';
import WindowTopBarPluginMenu from '../containers/WindowTopBarPluginMenu';
import WindowTopBarTitle from '../containers/WindowTopBarTitle';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import FullScreenButton from '../containers/FullScreenButton';
import WindowMaxIcon from './icons/WindowMaxIcon';
import WindowMinIcon from './icons/WindowMinIcon';
import ns from '../config/css-ns';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';
import SearchPanelControls from '../containers/SearchPanelControls';

const Root = styled(AppBar, { name: 'WindowTopBar', slot: 'root' })(({ theme }) => ({
  zIndex: 1100,
  backgroundColor: 'transparent',
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar, { name: 'WindowTopBar', slot: 'toolbar' })(({ ownerState, theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.72)' : 'rgba(255,255,255,0.82)',
  borderTop: '2px solid',
  borderTopColor: ownerState?.focused ? theme.palette.primary.main : 'transparent',
  minHeight: 32,
  paddingLeft: theme.spacing(0.5),
  paddingRight: theme.spacing(0.5),
  backdropFilter: 'blur(6px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  ...(ownerState?.windowDraggable && {
    cursor: 'move',
  }),
}));

// Shared pill-style toggle group (matches Gallery and Window styling)
const PillGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.72)' : 'rgba(255,255,255,0.82)',
  color: theme.palette.text.primary,
  border: 'none',
  borderRadius: 50,
  boxShadow: theme.shadows[2],
  padding: 6,
  gap: 4,
  '& .MuiToggleButton-root': {
    margin: 0,
    minWidth: 28,
    padding: '1px 4px',
    fontSize: '0.72rem',
    lineHeight: 1,
    border: 'none',
    borderRadius: 50,
  },
  '& .MuiToggleButton-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiToggleButton-root.Mui-selected': {
    border: 'none',
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
  },
  '& .MuiToggleButton-root.Mui-selected:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

/**
 * WindowTopBar
 */
export function WindowTopBar({
  removeWindow, windowId, toggleWindowSideBar,
  maximizeWindow = () => {}, maximized = false, minimizeWindow = () => {}, allowClose = true, allowMaximize = true,
  focusWindow = () => {}, allowFullscreen = false, allowTopMenuButton = true, allowWindowSideBar = true,
  component = 'nav',
  // New optional controls
  viewMode = undefined,
  onChangeViewMode = undefined,
  hasSearchService = false,
}) {
  const { t } = useTranslation();
  const ownerState = arguments[0]; // eslint-disable-line prefer-rest-params

  return (
    <Root component={component} aria-label={t('windowNavigation')} position="relative" color="default" enableColorOnDark>
      <StyledToolbar
        disableGutters
        onMouseDown={focusWindow}
        ownerState={ownerState}
        className={classNames(ns('window-top-bar'))}
        variant="dense"
      >
        {allowWindowSideBar && (
          <MiradorMenuButton
            aria-label={t('toggleWindowSideBar')}
            onClick={toggleWindowSideBar}
            className={ns('window-menu-btn')}
          >
            <MenuIcon />
          </MiradorMenuButton>
        )}
        <WindowTopBarTitle windowId={windowId} />

        {/* Inline search controls (only when search service exists) */}
        {hasSearchService && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 320, maxWidth: 800, marginLeft: 8, marginRight: 8 }}>
            <SearchPanelControls companionWindowId={`${windowId}-topbar`} windowId={windowId} />
          </div>
        )}
        {allowTopMenuButton && (
          <WindowTopMenu
          windowId={windowId}
          open={true}
          />
        )}
        {/* View toggle (optional) */}
        {onChangeViewMode && (
          <PillGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(e, val) => { if (val) onChangeViewMode(val); }}
            aria-label={t('windowViewMode')}
            sx={{ marginRight: 1 }}
          >
            <ToggleButton value="both" aria-label={t('splitView')}>
              <SplitscreenIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="primary" aria-label={t('primaryOnly')}>
              <ViewDayIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="gallery" aria-label={t('galleryOnly')}>
              <ViewModuleIcon fontSize="small" />
            </ToggleButton>
          </PillGroup>
        )}

        <WindowTopBarPluginArea windowId={windowId} />
        <WindowTopBarPluginMenu windowId={windowId} />
        {allowFullscreen && (
          <FullScreenButton className={ns('window-menu-btn')} />
        )}
        {allowClose && (
          <MiradorMenuButton
            aria-label={t('closeWindow')}
            className={classNames(ns('window-close'), ns('window-menu-btn'))}
            onClick={removeWindow}
          >
            <CloseIcon />
          </MiradorMenuButton>
        )}
      </StyledToolbar>
    </Root>
  );
}

WindowTopBar.propTypes = {
  allowClose: PropTypes.bool,
  allowFullscreen: PropTypes.bool,
  allowMaximize: PropTypes.bool,
  allowTopMenuButton: PropTypes.bool,
  allowWindowSideBar: PropTypes.bool,
  component: PropTypes.elementType,
  focused: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  focusWindow: PropTypes.func,
  maximized: PropTypes.bool,
  maximizeWindow: PropTypes.func,
  minimizeWindow: PropTypes.func,
  removeWindow: PropTypes.func.isRequired,
  toggleWindowSideBar: PropTypes.func.isRequired,
  windowDraggable: PropTypes.bool, // eslint-disable-line react/no-unused-prop-types
  windowId: PropTypes.string.isRequired,
  viewMode: PropTypes.oneOf(['both', 'primary', 'gallery']),
  onChangeViewMode: PropTypes.func,
  hasSearchService: PropTypes.bool,
};
