import AddCircleIcon from '@mui/icons-material/AddCircleOutlineSharp';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircleOutlineSharp';
import { styled } from '@mui/material/styles';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import RestoreZoomIcon from './icons/RestoreZoomIcon';
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
  zIndex: '50',
  boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)"
}));


/**
 */
export function ZoomControls({
  windowId = '', updateViewport = () => {}, viewer = {}, zoomToWorld, showZoomControls = true, 
}) {
  const pluginProps = { // 
    showZoomControls, 
  };
  const { t } = useTranslation();
  /** */
  const handleZoomInClick = () => {
    updateViewport(windowId, {
      zoom: viewer.zoom * 2,
    });
  };

  /** */
  const handleZoomOutClick = () => {
    updateViewport(windowId, {
      zoom: viewer.zoom / 2,
    });
  };

  return  showZoomControls ? 
    <StyledZoomControlsWrapper>
      <MiradorMenuButton aria-label={t('zoomIn')} onClick={handleZoomInClick}>
        <AddCircleIcon />
      </MiradorMenuButton>
      <MiradorMenuButton aria-label={t('zoomOut')} onClick={handleZoomOutClick}>
        <RemoveCircleIcon />
      </MiradorMenuButton>
      <MiradorMenuButton aria-label={t('zoomReset')} onClick={() => zoomToWorld(false)}>
        <RestoreZoomIcon />
      </MiradorMenuButton>
    </StyledZoomControlsWrapper> : <></>;
}
ZoomControls.propTypes = {
  showZoomControls: PropTypes.bool,
  visible: PropTypes.bool,
  updateViewport: PropTypes.func,
  viewer: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
    zoom: PropTypes.number,
  }),
  windowId: PropTypes.string,
  zoomToWorld: PropTypes.func.isRequired,
};

ZoomControls.defaultProps = {
  showZoomControls: false,
  visible: true,
};
