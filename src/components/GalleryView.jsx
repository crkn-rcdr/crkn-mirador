import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import GalleryViewThumbnail from '../containers/GalleryViewThumbnail';

const Root = styled('div', { name: 'GalleryView', slot: 'root' })(({ theme }) => ({
  alignItems: 'flex-start',
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  overflowX: 'hidden',
  overflowY: 'auto',
  padding: '0',
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  justifyContent: 'space-around',
  alignContent: 'flex-start',
}));

export function GalleryView({ canvases = [], viewingDirection, windowId, currentCanvasId }) {
  const safeCanvases = (canvases || []).filter(c => c && (c.id || typeof c.index !== 'undefined'));

  return (
    <Root key={currentCanvasId || 'no-canvas'}>
      {safeCanvases.map((canvas) => (
        <GalleryViewThumbnail
          key={canvas.id || canvas.index}
          windowId={windowId}
          canvas={canvas}
        />
      ))}
    </Root>
  );
}

GalleryView.propTypes = {
  canvases: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  viewingDirection: PropTypes.string,
  windowId: PropTypes.string.isRequired,
  currentCanvasId: PropTypes.string,
};
