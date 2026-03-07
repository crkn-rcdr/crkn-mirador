import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
// Replace MUI Menu icon with Bootstrap icon
// MUI Close icon replaced with Bootstrap icon
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
import ns from '../config/css-ns';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BiIcon from './BiIcon';
import SearchPanelControls from '../containers/SearchPanelControls';

const TOPBAR_FONT_STACK = '"Roboto", "Helvetica Neue", Arial, sans-serif';

const Root = styled(AppBar, { name: 'WindowTopBar', slot: 'root' })(() => ({
  zIndex: 1100,
  backgroundColor: 'transparent',
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar, { name: 'WindowTopBar', slot: 'toolbar' })(({ ownerState, theme }) => ({
  '--topbar-control-size': '40px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1f2328' : '#f3f5f6',
  borderTop: '2px solid',
  borderTopColor: ownerState?.focused ? theme.palette.primary.main : 'transparent',
  minHeight: 74,
  paddingLeft: theme.spacing(1.25),
  paddingRight: theme.spacing(1.25),
  justifyContent: 'flex-start',
  gap: theme.spacing(0.9),
  backdropFilter: 'none',
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.22 : 0.09)}`,
  fontFamily: TOPBAR_FONT_STACK,
  '& .MuiTypography-root, & .MuiInputBase-input, & .MuiInputLabel-root, & .view-label, & .count, & .MuiButtonBase-root': {
    fontFamily: TOPBAR_FONT_STACK,
  },
  '& .MuiIconButton-root': {
    width: 'var(--topbar-control-size)',
    height: 'var(--topbar-control-size)',
    borderRadius: 10,
    color: theme.palette.text.secondary,
    border: 'none',
    backgroundColor: 'transparent',
    transition: 'color 140ms ease, transform 80ms ease',
  },
  '& .MuiIconButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
  '& .MuiIconButton-root:active': {
    transform: 'scale(0.98)',
  },
  '& .mirador-window-close:hover': {
    color: theme.palette.error.main,
    backgroundColor: 'transparent',
  },
  ...(ownerState?.windowDraggable && {
    cursor: 'move',
  }),
  [theme.breakpoints.down('lg')]: {
    minHeight: 70,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    gap: theme.spacing(0.75),
    '& .MuiIconButton-root': {
      width: 37,
      height: 37,
      borderRadius: 11,
    },
  },
}));

const PillGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  border: 'none',
  borderRadius: 0,
  marginTop: 0,
  padding: 0,
  gap: theme.spacing(1.2),

  '& .MuiToggleButton-root': {
    margin: 0,
    minWidth: 0,
    height: 42,
    padding: '0 0 8px',
    lineHeight: 1.1,
    border: 'none',
    borderRadius: 0,
    borderBottom: `3px solid transparent`,
    transition: 'color 120ms ease, border-color 120ms ease, transform 60ms ease',
    color: theme.palette.text.secondary,
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(0.55),
    whiteSpace: 'nowrap',
  },

  '& .MuiToggleButton-root .view-label': {
    fontSize: '0.92rem',
    lineHeight: 1.1,
    fontWeight: 500,
    color: theme.palette.text.secondary,
    textTransform: 'none',
    letterSpacing: 0,
    whiteSpace: 'nowrap',
  },

  '& .MuiToggleButton-root .bi': {
    fontSize: '1.24rem',
    lineHeight: 1,
    display: 'inline-block',
  },
  '& .MuiToggleButton-root .MuiSvgIcon-root': {
    fontSize: '1.05rem',
  },

  '& .MuiToggleButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },

  '& .MuiToggleButton-root:active': {
    transform: 'scale(0.98)',
  },

  '& .MuiToggleButton-root.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    borderBottomColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
  '& .MuiToggleButton-root.Mui-selected .bi, & .MuiToggleButton-root.Mui-selected .MuiSvgIcon-root': {
    color: theme.palette.primary.main,
  },
  '& .MuiToggleButton-root.Mui-selected .view-label': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '& .MuiToggleButton-root.Mui-selected:hover': {
    backgroundColor: 'transparent',
  },
}));

const LeftGroup = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flex: '1 1 420px',
  gap: theme.spacing(1),
  minWidth: 240,
  maxWidth: 560,
  '& .MuiTypography-root': {
    color: theme.palette.text.primary,
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.25,
    letterSpacing: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const SearchSlot = styled('div')(({ theme }) => ({
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.26 : 0.16)}`,
  borderRadius: 0,
  display: 'flex',
  flex: '1 1 520px',
  gap: theme.spacing(0.25),
  maxWidth: 760,
  minWidth: 320,
  padding: theme.spacing(0, 0, 0),
  '& form': {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    minWidth: 0,
    paddingBottom: 0,
    paddingRight: 0,
  },
  '& .MuiAutocomplete-root': {
    width: '100%',
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontWeight: 400,
    letterSpacing: 0,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputBase-root': {
    fontSize: '0.99rem',
    fontWeight: 400,
    alignItems: 'center',
    '&:before': {
      borderBottom: 'none',
    },
    '&:after': {
      borderBottom: 'none',
    },
    '&:hover:not(.Mui-disabled):before': {
      borderBottom: 'none',
    },
  },
  '& .MuiInputBase-input': {
    paddingTop: theme.spacing(0.85),
    paddingBottom: theme.spacing(0.55),
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(0, 5px) scale(0.82)',
    transformOrigin: 'left top',
  },
  '& .MuiInputAdornment-positionEnd': {
    alignSelf: 'center',
    marginTop: 0,
  },
  '& .MuiInputAdornment-positionEnd .MuiIconButton-root': {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: 'none',
    backgroundColor: 'transparent',
  },
  '& .MuiInputAdornment-positionEnd .MuiIconButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
  '& .MuiInputAdornment-positionEnd .MuiIconButton-root .bi': {
    fontSize: '1rem',
  },
  '& .MuiCircularProgress-root': {
    transform: 'scale(0.6)',
  },
  '& .MuiAutocomplete-endAdornment': {
    right: 0,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '& .MuiAutocomplete-popupIndicator': {
    display: 'none',
  },
  '& .MuiAutocomplete-clearIndicator': {
    display: 'none',
  },
  '& .count': {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    minWidth: 44,
    textAlign: 'center',
  },
  [theme.breakpoints.down('md')]: {
    flexBasis: 360,
    minWidth: 260,
  },
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    minWidth: 0,
    order: 3,
    width: '100%',
    '& form': {
      minWidth: 0,
    },
  },
}));

const RightGroup = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flex: '0 0 auto',
  gap: theme.spacing(0.55),
  marginLeft: 'auto',
  '& .mirador-window-menu-btn': {
    height: 'var(--topbar-control-size)',
    marginTop: 0,
    width: 'var(--topbar-control-size)',
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
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
  showSearchUnavailable = false,
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
          <LeftGroup>
            <MiradorMenuButton
              aria-label={t('toggleWindowSideBar')}
              onClick={toggleWindowSideBar}
              className={ns('window-menu-btn')}
            >
              <BiIcon name="list" size={16} />
            </MiradorMenuButton>
            <WindowTopBarTitle windowId={windowId} />
          </LeftGroup>
        )}
        {!allowWindowSideBar && (
          <LeftGroup>
            <WindowTopBarTitle windowId={windowId} />
          </LeftGroup>
        )}

        {/* Inline search controls (or unavailable message after manifest load) */}
        {(hasSearchService || showSearchUnavailable) && (
          <SearchSlot>
            <SearchPanelControls
              companionWindowId={`${windowId}-topbar`}
              windowId={windowId}
              showUnavailableMessage={showSearchUnavailable}
            />
          </SearchSlot>
        )}
        <RightGroup>
          {allowTopMenuButton && (
            <WindowTopMenu
              windowId={windowId}
              open
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
            >
              <ToggleButton value="both" aria-label={t('splitView')}>
                <BiIcon name="layout-split" size={16} />
                <span className="view-label">{t('splitView')}</span>
              </ToggleButton>
              <ToggleButton value="gallery" aria-label={t('galleryOnly')}>
                <BiIcon name="grid-3x3-gap" size={16} />
                <span className="view-label">{t('galleryOnly')}</span>
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
              <BiIcon name="x-lg" size={16} />
            </MiradorMenuButton>
          )}
        </RightGroup>
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
  viewMode: PropTypes.oneOf(['both', 'gallery']),
  onChangeViewMode: PropTypes.func,
  hasSearchService: PropTypes.bool,
  showSearchUnavailable: PropTypes.bool,
};
