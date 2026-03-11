// components/GalleryViewThumbnail.jsx
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import BiIcon from './BiIcon';
import { useTranslation } from 'react-i18next';
import { InView } from 'react-intersection-observer';
import IIIFThumbnail from '../containers/IIIFThumbnail';

const Root = styled('div', { name: 'GalleryView', slot: 'thumbnail' })(
  ({ ownerState, theme }) => ({
    '&:focus': { outline: 'none' },
    '&:hover': { backgroundColor: theme.palette.action.hover },
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    // Margin here caused overflow beyond grid cells; spacing comes from Grid gap.
    margin: 0,
    border: '2px solid transparent',
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(1),
    paddingTop: ownerState?.isMobileStrip ? theme.spacing(1.25) : theme.spacing(1),
    position: 'relative',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'visible',
    transition: 'background-color 120ms ease',
    ...(ownerState?.selected && {
      borderColor: theme.palette.primary.main,
    }),
  }),
);

const Chips = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  position: 'absolute',
  right: theme.spacing(1),
  bottom: theme.spacing(1),
}));

const TopLeft = styled('div')(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(1),
  top: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(0.5),
  pointerEvents: 'none',
  zIndex: 2,
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
  matchingTerms = [],
  config = { height: 100, width: null },
  thumbSize = 'm',      // 's' | 'm' | 'l'
  tileW,                // new: inner cell width from Grid (already minus gap)
  tileH,                // new: inner cell height from Grid (already minus gap)
  isMobileStrip = false,
}) {
  const myRef = useRef();
  const [requestedAnnotations, setRequestedAnnotations] = useState(false);
  const { t } = useTranslation();

  // Prefer tile-based sizing from Grid to avoid mismatch/overlap.
  const pad = isMobileStrip ? 20 : 16; // add top breathing room in strip to avoid visual clipping
  const baseLabelReserve = thumbSize === 's' ? 40 : 44;
  const labelReserve = isMobileStrip ? (baseLabelReserve + 8) : baseLabelReserve;
  const maxHeight = (typeof tileH === 'number' && tileH > 0)
    ? Math.max(1, tileH - pad - labelReserve)
    : Math.max(1, Math.round(((typeof config.height === 'number' ? config.height : 100) * ((thumbSize === 'l') ? 4.0 : 2.0))) - labelReserve);

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

  const ownerState = { selected, highlighted, isMobileStrip };

  return (
    <InView onChange={handleIntersection}>
      <Root
        ownerState={ownerState}
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
          {/* Search results count (top-left, high contrast) */}
          {searchAnnotationsCount > 0 && (
            <TopLeft>
              <Tooltip title={t('searchHitsCount', { count: searchAnnotationsCount })} arrow>
                <Chip
                  icon={<BiIcon name="search" size={'0.7rem'} />}
                  label={searchAnnotationsCount}
                  size="small"
                  aria-label={t('searchHitsCount', { count: searchAnnotationsCount })}
                  sx={(theme) => ({
                    pointerEvents: 'auto',
                    height: 20,
                    borderRadius: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    // Softer translucent background and always-light icon/text for better contrast
                    bgcolor: theme.palette.mode === 'dark'
                      ? 'rgba(20,20,20,0.55)'
                      : 'rgba(0,0,0,0.45)',
                    color: theme.palette.common.white,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                    backdropFilter: 'blur(2px)',
                    '& .MuiChip-icon': {
                      mr: 0.5,
                      color: (theme.palette.highlights && theme.palette.highlights.primary) || '#ffff00',
                      opacity: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      lineHeight: '0.5 !important',
                      '& .bi': { fontSize: '0.7rem', lineHeight: 1, verticalAlign: 'middle' },
                    },
                    '& .MuiChip-label': {
                      px: 0.5,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: 0.15,
                      lineHeight: 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: (theme.palette.highlights && theme.palette.highlights.primary) || '#ffff00',
                    },
                  })}
                />
              </Tooltip>
            </TopLeft>
          )}

          {/* Search term pills (left) */}
          {Array.isArray(matchingTerms) && matchingTerms.length > 0 && (
            <div style={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              display: 'flex',
              gap: 4,
              flexWrap: 'nowrap',
              maxWidth: '60%',
              pointerEvents: 'none',
            }}>
              {matchingTerms.slice(0, 3).map((t) => (
                <Chip
                  key={t}
                  size="small"
                  label={t}
                  sx={{
                    pointerEvents: 'none',
                    height: 20,
                    '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' },
                    bgcolor: 'highlights.primary',
                    color: 'common.white',
                  }}
                />
              ))}
              {matchingTerms.length > 3 && (
                <Chip
                  size="small"
                  label={`+${matchingTerms.length - 3}`}
                  sx={{ pointerEvents: 'none', height: 20, '& .MuiChip-label': { px: 0.75, fontSize: '0.7rem' } }}
                />
              )}
            </div>
          )}
          <Chips>
            {annotationsCount > 0 && (
              <Chip icon={<BiIcon name="chat-dots" size={12} />} label={annotationsCount} size="small" />
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
  matchingTerms: PropTypes.arrayOf(PropTypes.string),
  isMobileStrip: PropTypes.bool,
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
  prev.isMobileStrip === next.isMobileStrip &&
  prev.thumbSize === next.thumbSize &&
  prev.tileW === next.tileW &&
  prev.tileH === next.tileH
));
