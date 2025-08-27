// components/GalleryView.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid, areEqual } from 'react-window';
import GalleryViewThumbnail from '../containers/GalleryViewThumbnail';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

const Root = styled('div', { name: 'GalleryView', slot: 'root' })(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
}));

const Bar = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  padding: "2px",
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const CompactToggleButton = styled(ToggleButton)(({ theme }) => ({
  minWidth: 28,      // narrower
  padding: '2px 2px', // less padding
  fontSize: '0.75rem',
}));

// Rectangular presets (portrait-ish), and your 2×/4× scales
const SIZE_PRESETS = {
  s: { tileH: 180, tileW: 120, scale: 1.0 }, 
  m: { tileH: 270, tileW: 200, scale: 2.0 },  
  l: { tileH: 550, tileW: 390, scale: 4.0 },  
};

const GAP = 20; // total px subtracted from each cell to create visual spacing

const Cell = React.memo(({ columnIndex, rowIndex, style, data }) => {
  const { canvases, windowId, columnCount, thumbSize, tileW, tileH } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= canvases.length) return null;
  const canvas = canvases[index];

  // Apply a visual gap without changing Grid’s measured size
  const cellStyle = {
    ...style,
    left: style.left + GAP / 2,
    top: style.top + GAP / 2,
    width: style.width - GAP,
    height: style.height - GAP,
  };

  return (
    <div style={cellStyle}>
      <GalleryViewThumbnail
        windowId={windowId}
        canvas={canvas}
        thumbSize={thumbSize}
        tileW={tileW}
        tileH={tileH}
      />
    </div>
  );
}, areEqual);

export function GalleryView({ canvases = [], windowId }) {
  const safe = (canvases || []).filter(c => c && (c.id || typeof c.index !== 'undefined'));
  const [thumbSize, setThumbSize] = useState('s');
  const preset = SIZE_PRESETS[thumbSize];

  return (
    <Root>
      <Bar>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={thumbSize}
          onChange={(e, val) => { if (val) setThumbSize(val); }}
        >
          <CompactToggleButton value="s">S</CompactToggleButton>
          <CompactToggleButton value="m">M</CompactToggleButton>
          <CompactToggleButton value="l">L</CompactToggleButton>
        </ToggleButtonGroup>
      </Bar>

      <AutoSizer>
        {({ width, height }) => {
          if (!width || !height) return null;

          const columnCount = Math.max(1, Math.floor(width / preset.tileW));
          const rowCount = Math.ceil(safe.length / columnCount);

          // Effective inner dimensions per cell (after visual gap)
          const tileW = preset.tileW - GAP;
          const tileH = preset.tileH - GAP;

          const itemData = { canvases: safe, windowId, columnCount, thumbSize, tileW, tileH };

          return (
            <Grid
              width={width}
              height={height - 48}
              columnCount={columnCount}
              rowCount={rowCount}
              columnWidth={preset.tileW}
              rowHeight={preset.tileH}
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
  canvases: PropTypes.array,
  windowId: PropTypes.string.isRequired,
};
