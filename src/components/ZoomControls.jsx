import AddCircleIcon from '@mui/icons-material/AddCircleOutlineSharp';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import RestoreZoomIcon from './icons/RestoreZoomIcon';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';

const StyledZoomControlsWrapper = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  position: 'absolute',
  background: theme.palette.background.paper,
  borderRadius: '25px',
  left: '1rem',
  top: '0rem',
  zIndex: 50,
  boxShadow: '0px 10px 15px -3px rgba(0,0,0,0.1)',
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
