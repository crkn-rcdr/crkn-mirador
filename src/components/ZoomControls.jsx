import AddCircleIcon from '@mui/icons-material/AddCircleOutlineSharp';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import RestoreZoomIcon from './icons/RestoreZoomIcon';
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
  borderRadius: 24,
  padding: '6px',
  zIndex: 50,
  boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
}));

export function ZoomControls({ viewer, zoomToWorld, showZoomControls = true }) {
  const { t } = useTranslation();

  if (!showZoomControls || !viewer) return null;

  const handleZoomIn = () => {
    if (!viewer.viewport) return;
    viewer.viewport.zoomBy(1.2);
    viewer.viewport.applyConstraints();
  };

  const handleZoomOut = () => {
    if (!viewer.viewport) return;
    viewer.viewport.zoomBy(0.8);
    viewer.viewport.applyConstraints();
  };

  const handleReset = () => {
    if (zoomToWorld) zoomToWorld();
  };

  return (
    <StyledZoomControlsWrapper>
      <MiradorMenuButton aria-label={t('zoomIn')} onClick={handleZoomIn}>
        <AddCircleIcon />
      </MiradorMenuButton>
      <MiradorMenuButton aria-label={t('zoomOut')} onClick={handleZoomOut}>
        <RemoveCircleIcon />
      </MiradorMenuButton>
      <MiradorMenuButton aria-label={t('zoomReset')} onClick={handleReset}>
        <RestoreZoomIcon />
      </MiradorMenuButton>
    </StyledZoomControlsWrapper>
  );
}

ZoomControls.propTypes = {
  viewer: PropTypes.object,
  zoomToWorld: PropTypes.func.isRequired,
  showZoomControls: PropTypes.bool,
};

ZoomControls.defaultProps = {
  showZoomControls: true,
};
