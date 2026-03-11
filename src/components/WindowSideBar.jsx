import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import { useTranslation } from 'react-i18next';
import WindowSideBarButtons from '../containers/WindowSideBarButtons';

const VIEWER_FLOATING_CONTROLS_Z_INDEX = 100000000;
const SIDEBAR_OVERLAY_Z_INDEX = VIEWER_FLOATING_CONTROLS_Z_INDEX + 2;

const Root = styled(Drawer, { name: 'WindowSideBar', slot: 'root' })(() => ({
  border: 'none !important',
  borderRadius: '0 7px 7px 0',
  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
  flexShrink: 0,
  order: -1000,
  zIndex: SIDEBAR_OVERLAY_Z_INDEX,
}));

const Nav = styled('nav', { name: 'WindowSideBar', slot: 'nav' })({
  border: 'none !important',
  borderRadius: '7px 0 0 7px',
  position: 'relative !important',
  width: 48,
});

/**
 * WindowSideBar
 */
export function WindowSideBar({
  classes = {}, direction, windowId, sideBarOpen = false,
}) {
  const { t } = useTranslation();
  return (
    <Root
      variant="persistent"
      className={classes.drawer}
      anchor={direction === 'rtl' ? 'right' : 'left'}
      PaperProps={{
        'aria-label': t('sidebarPanelsNavigation'),
        component: Nav,
        variant: 'outlined',
      }}
      SlideProps={{ direction: direction === 'rtl' ? 'left' : 'right', mountOnEnter: true, unmountOnExit: true }}
      open={sideBarOpen}
    >
      <WindowSideBarButtons windowId={windowId} />
    </Root>
  );
}

WindowSideBar.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string),
  direction: PropTypes.string.isRequired,
  sideBarOpen: PropTypes.bool,
  windowId: PropTypes.string.isRequired,
};
