import BiIcon from './BiIcon';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';

const StyledZoomControlsWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  position: 'absolute',
  right: '0.75rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(6px)',
  borderRadius: 3,
  padding: '6px',
  pointerEvents: 'auto',
  touchAction: 'manipulation',
  zIndex: 100000004,
  boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
  '& .MuiIconButton-root': {
    color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#707070',
    height: 40,
    width: 40,
  },
  '& .MuiIconButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.mode === 'dark' ? '#e0e0e0' : '#707070',
  },
  [theme.breakpoints.down('sm')]: {
    right: '0.5rem',
    top: '42%',
    '& .MuiIconButton-root': {
      height: 44,
      width: 44,
    },
  },
}));

export function ZoomControls({
  viewer, zoomToWorld, showZoomControls = true, updateViewport, windowId,
}) {
  const { t } = useTranslation();

  if (!showZoomControls || !viewer) return null;

  const zoomBy = (ratio, fallbackZoom) => {
    if (viewer.viewport?.zoomBy) {
      viewer.viewport.zoomBy(ratio);
      viewer.viewport.applyConstraints?.();
      return;
    }

    if (updateViewport && windowId && typeof viewer.zoom === 'number') {
      updateViewport(windowId, { zoom: viewer.zoom * fallbackZoom });
    }
  };

  const handleZoomIn = () => {
    zoomBy(1.2, 2);
  };

  const handleZoomOut = () => {
    zoomBy(0.8, 0.5);
  };

  const handleReset = () => {
    if (zoomToWorld) zoomToWorld(false);
  };

  return (
    <StyledZoomControlsWrapper>
      <MiradorMenuButton aria-label={t('zoomIn')} onClick={handleZoomIn} TooltipProps={{ disableTouchListener: true }}>
        <BiIcon name="zoom-in" size={18} />
      </MiradorMenuButton>
      <MiradorMenuButton aria-label={t('zoomOut')} onClick={handleZoomOut} TooltipProps={{ disableTouchListener: true }}>
        <BiIcon name="zoom-out" size={18} />
      </MiradorMenuButton>
      <MiradorMenuButton aria-label={t('zoomReset')} onClick={handleReset} TooltipProps={{ disableTouchListener: true }}>
        <BiIcon name="arrow-counterclockwise" size={18} />
      </MiradorMenuButton>
    </StyledZoomControlsWrapper>
  );
}

ZoomControls.propTypes = {
  viewer: PropTypes.object,
  windowId: PropTypes.string,
  zoomToWorld: PropTypes.func,
  showZoomControls: PropTypes.bool,
  updateViewport: PropTypes.func,
};

ZoomControls.defaultProps = {
  showZoomControls: true,
  updateViewport: undefined,
  windowId: undefined,
  zoomToWorld: undefined,
};
