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
  backgroundColor:  theme.palette.background.paper,
  height: "100%",
  justifyContent: "space-around",
  alignContent: "flex-start"
}));

/**
 * Renders a GalleryView overview of the manifest.
 */
export function GalleryView({ canvases, viewingDirection = '', windowId }) {
  const htmlDir = viewingDirection === 'right-to-left' ? 'rtl' : 'ltr';
  return (
    <Root
      aria-label="gallery section"
      dir={htmlDir}
      square
      elevation={0}
      id={`${windowId}-gallery`}
    >
      {
        canvases.map(canvas => (
          <GalleryViewThumbnail
            key={canvas.id}
            windowId={windowId}
            canvas={canvas}
          />
        ))
      }
    </Root>
  );
}

GalleryView.propTypes = {
  canvases: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  viewingDirection: PropTypes.string,
  windowId: PropTypes.string.isRequired,
};
