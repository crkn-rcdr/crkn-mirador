// components/GalleryViewThumbnail.jsx
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import AnnotationIcon from '@mui/icons-material/CommentSharp';
import SearchIcon from '@mui/icons-material/SearchSharp';
import { InView } from 'react-intersection-observer';
import IIIFThumbnail from '../containers/IIIFThumbnail';

const Root = styled('div', { name: 'GalleryView', slot: 'thumbnail' })(
  ({ ownerState, theme }) => ({
    '&:focus': { outline: 'none' },
    '&:hover': { backgroundColor: theme.palette.action.hover },
    ...(ownerState?.selected ? { boxShadow: `inset 0 0 0 2px ${theme.palette.primary.main}` } : {}),
    ...(ownerState?.highlighted ? { boxShadow: `inset 0 0 0 2px ${theme.palette.info.main}` } : {}),
    cursor: 'pointer',
    margin: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(1),
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  }),
);

const Chips = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  position: 'absolute',
  right: theme.spacing(1),
  bottom: theme.spacing(1),
}));

export function GalleryViewThumbnail({
  canvas,
  selected = false,
  highlighted = false,
  setCanvas,
  focusOnCanvas,
  annotationsCount = undefined,
  requestCanvasAnnotations = () => {},
  searchAnnotationsCount = 0,
  config = { height: 100, width: null },
  thumbSize = 'm',      // 's' | 'm' | 'l'
  tileW,                // new: inner cell width from Grid (already minus gap)
  tileH,                // new: inner cell height from Grid (already minus gap)
}) {
  const myRef = useRef();
  const wasSelected = useRef(false);
  const [requestedAnnotations, setRequestedAnnotations] = useState(false);

  useEffect(() => {
    if (selected && !wasSelected.current) {
      myRef.current?.scrollIntoView({ block: 'nearest' });
    }
    wasSelected.current = selected;
  }, [selected]);

  // Prefer tile-based sizing from Grid to avoid mismatch/overlap.
  const pad = 16; // Root padding (8 top + 8 bottom) with MUI spacing(1)
  const maxHeight = (typeof tileH === 'number' && tileH > 0)
    ? Math.max(1, tileH - pad)
    : Math.max(1, Math.round(((typeof config.height === 'number' ? config.height : 100) * ((thumbSize === 'l') ? 4.0 : 2.0))));

  const maxWidth = (typeof tileW === 'number' && tileW > 0)
    ? Math.max(1, tileW - pad)
    : (config.width == null ? null : Math.max(1, Math.round(config.width * ((thumbSize === 'l') ? 4.0 : 2.0))));

  const handleIntersection = (inView) => {
    if (!inView) return;
    if (requestedAnnotations || annotationsCount === undefined || annotationsCount > 0) return;
    setRequestedAnnotations(true);
    requestCanvasAnnotations();
  };

  const handleSelect = () => {
    if (selected) focusOnCanvas();
    else setCanvas(canvas.id);
  };

  const ownerState = { selected, highlighted };

  return (
    <InView onChange={handleIntersection}>
      <Root
        ownerState={ownerState}
        key={canvas.id || canvas.index}
        onClick={handleSelect}
        ref={myRef}
        role="button"
        tabIndex={0}
      >
        <IIIFThumbnail
          resource={canvas}
          labelled
          variant="outside"
          maxHeight={maxHeight}
          maxWidth={maxWidth}
        >
          <Chips>
            {searchAnnotationsCount > 0 && (
              <Chip icon={<SearchIcon fontSize="small" />} label={searchAnnotationsCount} size="small" />
            )}
            {annotationsCount > 0 && (
              <Chip icon={<AnnotationIcon fontSize="small" />} label={annotationsCount} size="small" />
            )}
          </Chips>
        </IIIFThumbnail>
      </Root>
    </InView>
  );
}

GalleryViewThumbnail.propTypes = {
  annotationsCount: PropTypes.number,
  canvas: PropTypes.object.isRequired,
  config: PropTypes.shape({ height: PropTypes.number, width: PropTypes.number }),
  focusOnCanvas: PropTypes.func.isRequired,
  requestCanvasAnnotations: PropTypes.func,
  searchAnnotationsCount: PropTypes.number,
  selected: PropTypes.bool,
  highlighted: PropTypes.bool,
  setCanvas: PropTypes.func.isRequired,
  thumbSize: PropTypes.oneOf(['s','m','l']),
  tileW: PropTypes.number,
  tileH: PropTypes.number,
};

export default React.memo(GalleryViewThumbnail, (prev, next) => (
  prev.selected === next.selected &&
  prev.highlighted === next.highlighted &&
  prev.searchAnnotationsCount === next.searchAnnotationsCount &&
  prev.annotationsCount === next.annotationsCount &&
  prev.config?.height === next.config?.height &&
  prev.config?.width === next.config?.width &&
  (prev.canvas?.id || prev.canvas?.index) === (next.canvas?.id || next.canvas?.index) &&
  prev.thumbSize === next.thumbSize &&
  prev.tileW === next.tileW &&
  prev.tileH === next.tileH
));
