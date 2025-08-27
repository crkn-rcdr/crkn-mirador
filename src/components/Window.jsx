// components/Window.jsx
import { lazy, useContext, useCallback, useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import { MosaicWindowContext, Mosaic } from 'react-mosaic-component2';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import ns from '../config/css-ns';
import WindowTopBar from '../containers/WindowTopBar';
import PrimaryWindow from '../containers/PrimaryWindow';
import CompanionArea from '../containers/CompanionArea';
import MinimalWindow from '../containers/MinimalWindow';
import ErrorContent from '../containers/ErrorContent';
import IIIFAuthentication from '../containers/IIIFAuthentication';
import { PluginHook } from './PluginHook';

// Toggle UI (kept out of top bar)
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ViewModuleIcon from '@mui/icons-material/ViewModule'; // show gallery
import ViewDayIcon from '@mui/icons-material/ViewDay';       // hide gallery

const GalleryView = lazy(() => import('../containers/GalleryView'));

const StyledMosaic = styled(Mosaic)({
  height: '100%',
  '& .mosaic-preview': { boxShadow: 'none' },
  '& .mosaic-tile': { boxShadow: 'none' },
  '& .mosaic-window': { boxShadow: 'none', borderRadius: '4px' },
  '& .mosaic-window-toolbar': { display: 'none !important' },
});

const rowMixin = { display: 'flex', flex: '1', flexDirection: 'row', minHeight: 0 };
const columnMixin = { display: 'flex', flex: '1', flexDirection: 'column', minHeight: 0 };

const Root = styled(Paper, { name: 'Window', slot: 'root' })(({ ownerState, theme }) => ({
  ...columnMixin,
  backgroundColor: theme.palette.shades?.dark,
  borderRadius: 0,
  height: '100%',
  overflow: 'hidden',
  width: '100%',
  ...(ownerState?.maximized && {
    left: 0,
    position: 'absolute',
    top: 0,
    zIndex: theme.zIndex.modal - 1,
  }),
}));

const ContentRow = styled('div', { name: 'Window', slot: 'row' })(() => ({ ...rowMixin }));
const ContentColumn = styled('div', { name: 'Window', slot: 'column' })(() => ({ ...columnMixin }));
const StyledPrimaryWindow = styled(PrimaryWindow, { name: 'Window', slot: 'primary' })(() => ({
  ...rowMixin, height: '100%', position: 'relative',
}));
const StyledCompanionAreaBottom = styled(CompanionArea, { name: 'Window', slot: 'bottom' })(() => ({
  ...rowMixin, flex: '0', flexBasis: 'auto',
}));
const StyledCompanionAreaRight = styled('div', { name: 'Window', slot: 'right' })(() => ({
  ...rowMixin, flex: '0 1 auto',
}));

// Compact controls bar (NOT in the top bar)
const ControlsBar = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: '5px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/** Window title bar wrapper for drag controls in the mosaic view */
const DraggableNavBar = ({ children, ...props }) => {
  const { mosaicWindowActions } = useContext(MosaicWindowContext);
  return mosaicWindowActions.connectDragSource(<nav {...props}>{children}</nav>);
};

/**
 * Represents a Window in the mirador workspace
 */
export function Window({
  focusWindow = () => {}, label = null, isFetching = false, sideBarOpen = false,
  view = undefined, windowDraggable = null, windowId, workspaceType = null,
  manifestError = null,
}) {
  const { t } = useTranslation();
  const ownerState = arguments[0]; // eslint-disable-line prefer-rest-params

  const ErrorWindow = useCallback(({ error }) => (
    <MinimalWindow windowId={windowId}>
      <ErrorContent error={error} windowId={windowId} />
    </MinimalWindow>
  ), [windowId]);

  const ELEMENT_MAP = {
    a: (
      <StyledPrimaryWindow
        view={view}
        windowId={windowId}
        isFetching={isFetching}
        sideBarOpen={sideBarOpen}
      />
    ),
    b: <GalleryView windowId={windowId} />,
  };

  const componentRef = useRef(null);

  // Persisted split %
  const [splitPercentage, setSplitPercentage] = useState(() => {
    const stored = localStorage.getItem('splitPercentage');
    return stored ? Number(JSON.parse(stored)) : 0;
  });

  const [minimumPaneSizePercentage, setMinimumPaneSizePercentage] = useState(0);

  // Gallery open/closed, persisted
  const [isGalleryOpen, setIsGalleryOpen] = useState(() => {
    const persisted = localStorage.getItem('galleryOpen');
    return persisted ? JSON.parse(persisted) : true;
  });

  // Remember last open split to restore when re-opening
  const [lastOpenSplit, setLastOpenSplit] = useState(() => {
    const persisted = localStorage.getItem('galleryLastSplit');
    return persisted ? Number(JSON.parse(persisted)) : 70;
  });

  useEffect(() => {
    const width = componentRef.current?.getBoundingClientRect().width;
    if (width) {
      const minimum = (160 / width) * 100; // 160px minimum pane
      setMinimumPaneSizePercentage(minimum);
      if (splitPercentage <= 0) {
        setSplitPercentage(100 - minimum);
      }
    }
    localStorage.setItem('splitPercentage', JSON.stringify(splitPercentage));
    localStorage.setItem('galleryOpen', JSON.stringify(isGalleryOpen));
    if (isGalleryOpen && splitPercentage > 0) {
      localStorage.setItem('galleryLastSplit', JSON.stringify(splitPercentage));
      setLastOpenSplit(splitPercentage);
    }
  }, [splitPercentage, isGalleryOpen]);

  const handleChangeSplit = (newSplit) => {
    if (!isGalleryOpen) return;
    if (typeof newSplit?.splitPercentage === 'number') {
      setSplitPercentage(newSplit.splitPercentage);
    }
  };

  const toggleGallery = () => {
    setIsGalleryOpen((open) => {
      if (open) {
        // collapsing: remember current split
        if (splitPercentage > 0) {
          localStorage.setItem('galleryLastSplit', JSON.stringify(splitPercentage));
          setLastOpenSplit(splitPercentage);
        }
      } else {
        // expanding: restore last split (respect minimum)
        const width = componentRef.current?.getBoundingClientRect().width;
        const minPct = width ? (160 / width) * 100 : minimumPaneSizePercentage;
        const restored = Math.max(minPct ? (100 - minPct) : 0, lastOpenSplit || 70);
        setSplitPercentage(restored);
      }
      return !open;
    });
  };

  // Ignore shortcuts while typing
  const isTypingTarget = (el) => {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || el.isContentEditable) return true;
    const role = el.getAttribute?.('role');
    return role === 'textbox' || role === 'combobox' || role === 'searchbox' || role === 'spinbutton';
  };

  // Keyboard shortcut: "g" or Ctrl/⌘+G toggles gallery
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return;
      const key = (e.key || '').toLowerCase();
      const ctrlLike = e.ctrlKey || e.metaKey;
      if ((key === 'g' && !e.shiftKey && !e.altKey) || (ctrlLike && key === 'g')) {
        e.preventDefault();
        toggleGallery();
      }
    };
    window.addEventListener('keydown', onKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toggleGallery]);

  return (
    <ErrorBoundary FallbackComponent={ErrorWindow}>
      <Root
        ref={componentRef}
        onFocus={focusWindow}
        ownerState={ownerState}
        component="section"
        elevation={1}
        id={windowId}
        className={ns('window')}
        aria-label={t('window', { label })}
      >
        <WindowTopBar
          component={workspaceType === 'mosaic' && windowDraggable ? DraggableNavBar : undefined}
          windowId={windowId}
          windowDraggable={windowDraggable}
        />
        <IIIFAuthentication windowId={windowId} />
        {manifestError && <ErrorContent error={{ stack: manifestError }} windowId={windowId} />}

        <ContentRow>
          <ContentColumn>
            <ControlsBar>
              <Tooltip title={isGalleryOpen ? 'Hide gallery (g)' : 'Show gallery (g)'} arrow>
                <IconButton
                  size="small"
                  onClick={toggleGallery}
                  aria-label={isGalleryOpen ? 'Hide gallery' : 'Show gallery'}
                >
                  {isGalleryOpen ? <ViewDayIcon fontSize="small" /> : <ViewModuleIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </ControlsBar>

            {isGalleryOpen ? (
              <StyledMosaic
                key="with-gallery"
                renderTile={(id) => ELEMENT_MAP[id]}
                initialValue={{
                  direction: 'row',
                  first: 'a',
                  second: 'b',
                  splitPercentage,
                }}
                onChange={handleChangeSplit}
                resize={{ minimumPaneSizePercentage }}
              />
            ) : (
              <StyledMosaic
                key="no-gallery"
                renderTile={(id) => ELEMENT_MAP[id]}
                initialValue="a"
              />
            )}

            <StyledCompanionAreaBottom windowId={windowId} position="bottom" />
          </ContentColumn>

          <StyledCompanionAreaRight>
            <CompanionArea windowId={windowId} position="right" />
            <CompanionArea windowId={windowId} position="far-right" />
          </StyledCompanionAreaRight>
        </ContentRow>

        <CompanionArea windowId={windowId} position="far-bottom" />
        <PluginHook {...ownerState} />
      </Root>
    </ErrorBoundary>
  );
}

Window.propTypes = {
  focusWindow: PropTypes.func,
  isFetching: PropTypes.bool,
  label: PropTypes.string,
  manifestError: PropTypes.string,
  maximized: PropTypes.bool,
  sideBarOpen: PropTypes.bool,
  view: PropTypes.string,
  windowDraggable: PropTypes.bool,
  windowId: PropTypes.string.isRequired,
  workspaceType: PropTypes.string,
};
