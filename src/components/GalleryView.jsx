// components/GalleryView.jsx
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid, areEqual } from 'react-window';
import GalleryViewThumbnail from '../containers/GalleryViewThumbnail';

const Root = styled('div', { name: 'GalleryView', slot: 'root' })(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
}));

/**
 * Tune these to match your thumbnail config + margins/padding.
 * If your config.galleryView.height is, say, 120, add ~32–48px for padding/label.
 */
const DEFAULT_TILE_H = 180;  // row height (px)
const DEFAULT_TILE_W = 160;  // column width (px)
const H_GAP = 12;            // horizontal gap between tiles
const V_GAP = 12;            // vertical gap between tiles

const Cell = React.memo(({ columnIndex, rowIndex, style, data }) => {
  const { canvases, windowId, columnCount } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= canvases.length) return null;
  const canvas = canvases[index];

  // Inject gap via style transform instead of extra wrappers to keep perf tight
  const cellStyle = {
    ...style,
    left: style.left + H_GAP / 2,
    top: style.top + V_GAP / 2,
    width: style.width - H_GAP,
    height: style.height - V_GAP,
  };

  return (
    <div style={cellStyle}>
      <GalleryViewThumbnail windowId={windowId} canvas={canvas} />
    </div>
  );
}, areEqual);

export function GalleryView({ canvases = [], windowId }) {
  const safe = (canvases || []).filter(c => c && (c.id || typeof c.index !== 'undefined'));

  return (
    <Root>
      <AutoSizer>
        {({ width, height }) => {
          if (!width || !height) return null;

          // Compute how many columns fit; avoid zero/div-by-zero
          const columnWidth = DEFAULT_TILE_W;
          const rowHeight = DEFAULT_TILE_H;
          const columnCount = Math.max(1, Math.floor(width / columnWidth));
          const rowCount = Math.ceil(safe.length / columnCount);

          // Stable item data to avoid re-renders
          const itemData = useMemo(
            () => ({ canvases: safe, windowId, columnCount }),
            [safe, windowId, columnCount]
          );

          return (
            <Grid
              width={width}
              height={height}
              columnCount={columnCount}
              rowCount={rowCount}
              columnWidth={columnWidth}
              rowHeight={rowHeight}
              itemData={itemData}
              overscanRowCount={2}
              overscanColumnCount={1}
            >
              {Cell}
            </Grid>
          );
        }}
      </AutoSizer>
    </Root>
  );
}

GalleryView.propTypes = {
  canvases: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  windowId: PropTypes.string.isRequired,
};
