import { useState } from 'react';
import PropTypes from 'prop-types';
import { styled, alpha } from '@mui/material/styles';
// Replace MUI Menu icon with Bootstrap icon
// MUI Close icon replaced with Bootstrap icon
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
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

const Root = styled(AppBar, { name: 'WindowTopBar', slot: 'root' })(({ theme }) => ({
  zIndex: 1100,
  backgroundColor: theme.palette.mode === 'dark' ? '#1f2328' : '#ffffff',
  boxShadow: 'none',
}));

const StyledToolbar = styled(Toolbar, { name: 'WindowTopBar', slot: 'toolbar' })(({ ownerState, theme }) => ({
  '--topbar-control-size': '40px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1f2328' : '#ffffff',
  borderTop: '2px solid',
  borderTopColor: ownerState?.focused ? theme.palette.primary.main : 'transparent',
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'center',
  minHeight: 74,
  paddingLeft: theme.spacing(1.25),
  paddingRight: theme.spacing(1.25),
  justifyContent: 'flex-start',
  gap: theme.spacing(1.5),
  rowGap: theme.spacing(0.45),
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
    paddingRight: theme.spacing(1.25),
    gap: theme.spacing(1),
    rowGap: theme.spacing(0.45),
    '& .MuiIconButton-root': {
      width: 37,
      height: 37,
      borderRadius: 11,
    },
  },
  [theme.breakpoints.down('sm')]: {
    minHeight: 'auto',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.6),
    gap: theme.spacing(0.75),
    rowGap: theme.spacing(0.45),
  },
}));

const TopRow = styled('div')(({ theme }) => ({
  width: '100%',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const SecondaryRow = styled('div')(({ theme }) => ({
  width: '100%',
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.1),
  minHeight: 40,
  marginTop: 0,
  [theme.breakpoints.down('sm')]: {
    minHeight: 'auto',
    flexWrap: 'wrap',
    rowGap: theme.spacing(0.6),
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
  gap: theme.spacing(1.6),

  '& .MuiToggleButton-root': {
    margin: 0,
    minWidth: 0,
    height: 'var(--topbar-control-size)',
    padding: 0,
    lineHeight: 1.1,
    border: 'none',
    borderRadius: 0,
    borderBottom: `1px solid transparent`,
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
    fontSize: '1rem',
    lineHeight: 1.1,
    fontWeight: 400,
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
    fontWeight: 500,
  },
  '& .MuiToggleButton-root.Mui-selected:hover': {
    backgroundColor: 'transparent',
  },
}));

const LeftGroup = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flex: '1 1 auto',
  gap: theme.spacing(1.5),
  minWidth: 0,
  maxWidth: 'none',
  '&.title-hidden': {
    flex: '0 0 auto',
    gap: theme.spacing(0.75),
    maxWidth: 'none',
    minWidth: 'auto',
  },
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
  [theme.breakpoints.down('lg')]: {
    flex: '1 1 260px',
    minWidth: 0,
    maxWidth: 'none',
  },
  [theme.breakpoints.down('sm')]: {
    flex: '1 1 auto',
    minWidth: 0,
    maxWidth: '100%',
    gap: theme.spacing(0.75),
    '& .MuiTypography-root': {
      fontSize: '0.92rem',
    },
  },
}));

const SearchSlot = styled('div')(({ theme, ownerState }) => ({
  alignSelf: 'flex-end',
  alignItems: 'center',
  backgroundColor: 'transparent',
  border: 'none',
  borderBottom: ownerState?.showUnavailable
    ? 'none'
    : `1px solid ${alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.26 : 0.16)}`,
  borderRadius: 0,
  display: 'flex',
  flex: '1 1 520px',
  gap: theme.spacing(0.25),
  height: 'var(--topbar-control-size)',
  maxWidth: 'none',
  minWidth: 320,
  marginTop: 1,
  marginLeft: theme.spacing(0.5),
  marginRight: theme.spacing(1.75),
  padding: 0,
  '& form': {
    alignItems: 'center',
    display: 'flex',
    flex: 1,
    height: '100%',
    minWidth: 0,
    margin: 0,
    paddingBottom: '0 !important',
    paddingRight: '0 !important',
  },
  '& .MuiAutocomplete-root': {
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  '& .MuiAutocomplete-root, & .MuiAutocomplete-root:focus-within, & .MuiFormControl-root, & .MuiInputBase-root, & .MuiInputBase-root.Mui-focused, & .MuiInputBase-input, & .MuiInputBase-input:focus, & .MuiInputBase-input:focus-visible': {
    boxShadow: 'none !important',
    outline: 'none !important',
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem !important',
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1.2,
    transform: 'translate(0, 12px) scale(1) !important',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.text.secondary,
  },
  '& .MuiInputBase-root': {
    fontSize: '0.875rem',
    fontWeight: 400,
    height: '100%',
    lineHeight: 1.25,
    minHeight: '100%',
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
    paddingTop: 0,
    paddingBottom: 0,
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(0, 1px) scale(0.82) !important',
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
    color: theme.palette.primary.main,
    position: 'relative',
    top: -6,
  },
  '& .MuiInputAdornment-positionEnd .MuiIconButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.dark,
  },
  '& .MuiInputAdornment-positionEnd .MuiIconButton-root .bi': {
    fontSize: '1rem',
    color: theme.palette.primary.main,
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
  [theme.breakpoints.down('lg')]: {
    flex: '1 1 300px',
    minWidth: 220,
    marginLeft: 0,
  },
  [theme.breakpoints.down('sm')]: {
    flex: '1 1 auto',
    height: 'var(--topbar-control-size)',
    maxWidth: 'none',
    marginBottom: 0,
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    minWidth: 0,
    width: 'auto',
    '& form': {
      minWidth: 0,
    },
  },
}));

const RightGroup = styled('div')(({ theme }) => ({
  alignItems: 'center',
  alignSelf: 'center',
  display: 'flex',
  flex: '0 1 auto',
  flexShrink: 0,
  gap: theme.spacing(1.45),
  marginLeft: 'auto',
  minWidth: 'max-content',
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(0.25),
  '& .mirador-window-menu-btn': {
    height: 'var(--topbar-control-size)',
    marginTop: 0,
    width: 'var(--topbar-control-size)',
  },
  '& .mirador-window-close': {
    marginRight: theme.spacing(0.15),
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
    paddingLeft: theme.spacing(1.1),
    marginLeft: 0,
  },
}));

const ControlCluster = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: theme.spacing(0.15),
  minWidth: 0,
  '& .cluster-label': {
    color: alpha(theme.palette.text.primary, 0.72),
    fontSize: '0.67rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    lineHeight: 1,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  '& .cluster-helper': {
    color: theme.palette.text.secondary,
    fontSize: '0.67rem',
    lineHeight: 1.1,
    whiteSpace: 'nowrap',
  },
  [theme.breakpoints.down('sm')]: {
    '& .cluster-label, & .cluster-helper': {
      fontSize: '0.62rem',
    },
  },
}));

const TopRowActions = styled('div')(({ theme }) => ({
  alignItems: 'center',
  display: 'flex',
  flex: '0 0 auto',
  flexShrink: 0,
  gap: theme.spacing(0.7),
  marginLeft: 'auto',
  minWidth: 'max-content',
  paddingRight: theme.spacing(0.2),
  '& .mirador-window-menu-btn': {
    height: 'var(--topbar-control-size)',
    marginTop: 0,
    width: 'var(--topbar-control-size)',
  },
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.45),
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
  hideWindowTitle = false,
}) {
  const { t } = useTranslation();
  const windowViewModeLabel = t('windowViewMode');
  const [showSecondaryLayer, setShowSecondaryLayer] = useState(true);
  const ownerState = arguments[0]; // eslint-disable-line prefer-rest-params
  const hasSearch = hasSearchService || showSearchUnavailable;
  const hideHeaderToggle = hideWindowTitle && !allowClose;
  const shouldShowTopRow = !hideHeaderToggle;
  const shouldShowSecondaryRow = hideHeaderToggle || showSecondaryLayer;

  return (
    <Root component={component} aria-label={t('windowNavigation')} position="relative" color="default" enableColorOnDark>
      <StyledToolbar
        disableGutters
        onMouseDown={focusWindow}
        ownerState={ownerState}
        className={classNames(ns('window-top-bar'))}
        variant="dense"
      >
        {shouldShowTopRow && (
          <TopRow>
            {!hideWindowTitle ? (
              <LeftGroup>
                <WindowTopBarTitle windowId={windowId} />
              </LeftGroup>
            ) : (
              <LeftGroup className="title-hidden" />
            )}

            <TopRowActions>
              {!hideHeaderToggle && (
                <MiradorMenuButton
                  aria-label={showSecondaryLayer ? 'Hide header options' : 'Show header options'}
                  className={ns('window-menu-btn')}
                  onClick={() => setShowSecondaryLayer(v => !v)}
                >
                  <BiIcon name={showSecondaryLayer ? 'chevron-up' : 'chevron-down'} size={16} />
                </MiradorMenuButton>
              )}
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
            </TopRowActions>
          </TopRow>
        )}

        {shouldShowSecondaryRow && (
          <SecondaryRow>
            {allowWindowSideBar && (
              <MiradorMenuButton
                aria-label={t('toggleWindowSideBar')}
                onClick={toggleWindowSideBar}
                className={ns('window-menu-btn')}
              >
                <BiIcon name="list" size={16} />
              </MiradorMenuButton>
            )}
            {hasSearch && (
              <SearchSlot ownerState={{ showUnavailable: showSearchUnavailable }}>
                <SearchPanelControls
                  companionWindowId={`${windowId}-topbar`}
                  windowId={windowId}
                  showUnavailableMessage={showSearchUnavailable}
                />
              </SearchSlot>
            )}
            <RightGroup>
              {/* View toggle (optional) */}
              {onChangeViewMode && (
                <ControlCluster>
                  <PillGroup
                    exclusive
                    size="small"
                    value={viewMode}
                    onChange={(e, val) => { if (val) onChangeViewMode(val); }}
                    aria-label={windowViewModeLabel}
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
                </ControlCluster>
              )}

              <WindowTopBarPluginArea windowId={windowId} />
              <WindowTopBarPluginMenu windowId={windowId} />
              {allowFullscreen && !shouldShowTopRow && (
                <FullScreenButton className={ns('window-menu-btn')} />
              )}
            </RightGroup>
          </SecondaryRow>
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
  viewMode: PropTypes.oneOf(['both', 'gallery']),
  onChangeViewMode: PropTypes.func,
  hasSearchService: PropTypes.bool,
  showSearchUnavailable: PropTypes.bool,
  hideWindowTitle: PropTypes.bool,
};
