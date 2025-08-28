// components/GalleryView.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import { FixedSizeGrid as Grid, areEqual } from 'react-window';
import GalleryViewThumbnail from '../containers/GalleryViewThumbnail';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';

const Root = styled('div', { name: 'GalleryView', slot: 'root' })(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
}));

const Bar = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  gap: theme.spacing(1),
  padding: '2px',
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Flex child that constrains AutoSizer to remaining space under the Bar
const Viewport = styled('div')(() => ({
  position: 'relative',
  flex: '1 1 0',
  minHeight: 0,
  minWidth: 0,
  overflow: 'hidden',
}));

// Match the Window view toggle style: pill, no borders, white background
const CompactGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  background: '#fff',
  color: theme.palette.text.primary,
  border: 'none',
  borderRadius: 50,
  boxShadow: theme.shadows[2],
  padding: 6,
  gap: 4,
  '& .MuiToggleButton-root': {
    margin: 0,
    minWidth: 28,
    padding: '1px 4px',
    fontSize: '0.72rem',
    lineHeight: 1,
    border: 'none',
    borderRadius: 50,
  },
  '& .MuiToggleButton-root:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '& .MuiToggleButton-root.Mui-selected': {
    border: 'none',
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.text.primary,
  },
  '& .MuiToggleButton-root.Mui-selected:hover': {
    backgroundColor: theme.palette.action.selected,
  },
}));

const SIZE_PRESETS = {
  s: { tileH: 180, tileW: 120, scale: 1.0 },
  m: { tileH: 270, tileW: 200, scale: 2.0 },
  l: { tileH: 550, tileW: 390, scale: 4.0 },
};

const GAP = 20;

const Cell = React.memo(({ columnIndex, rowIndex, style, data }) => {
  const { canvases, windowId, columnCount, thumbSize, tileW, tileH } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= canvases.length) return null;
  const canvas = canvases[index];

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

export function GalleryView({ canvases = [], windowId, currentCanvasId }) {
  const { t } = useTranslation();
  const safe = (canvases || []).filter(c => c && (c.id || typeof c.index !== 'undefined'));
  const [thumbSize, setThumbSize] = useState('s');
  const preset = SIZE_PRESETS[thumbSize];
  const gridRef = useRef(null);
  // store latest computed layout values without re-render churn
  const layoutRef = useRef({ columnCount: 1 });
  const lastIdxRef = useRef(-1);

  // normalize IIIF ids (strip fragment)
  const normalizeId = (id) => (id || '').toString().split('#')[0];

  // When the current canvas changes (e.g., from a SearchHit),
  // scroll the virtualized grid to bring its thumbnail into view.
  useEffect(() => {
    if (!currentCanvasId || !gridRef.current || safe.length === 0) return;

    const idx = safe.findIndex(c => normalizeId(c?.id) === normalizeId(currentCanvasId));
    if (idx < 0) return;
    if (lastIdxRef.current === idx) return; // avoid redundant scrolls that can jitter

    const cc = Math.max(1, layoutRef.current.columnCount || 1);
    const rowIndex = Math.floor(idx / cc);
    const columnIndex = idx % cc;

    // Prefer scrollToItem if available (FixedSizeGrid supports it)
    if (typeof gridRef.current.scrollToItem === 'function') {
      try { gridRef.current.scrollToItem({ rowIndex, columnIndex, align: 'smart' }); }
      catch (_) { /* no-op; fall back below */ }
    }

    // Fallback: approximate using rowHeight if needed
    if (typeof gridRef.current.scrollToItem !== 'function' && typeof gridRef.current.scrollTo === 'function') {
      const rowHeight = (thumbSize === 's' ? SIZE_PRESETS.s.tileH : thumbSize === 'm' ? SIZE_PRESETS.m.tileH : SIZE_PRESETS.l.tileH);
      gridRef.current.scrollTo({ scrollTop: Math.max(0, rowIndex * rowHeight) });
    }

    lastIdxRef.current = idx;
  }, [currentCanvasId, thumbSize, safe]);
  //<CompactToggleButton value="fit" aria-label="Fit width">F</CompactToggleButton> - todo with search term highlighting

  return (
    <Root>
      <Bar>
        <CompactGroup
          exclusive
          size="small"
          value={thumbSize}
          onChange={(e, val) => { if (val) setThumbSize(val); }}
        >
          <ToggleButton value="s" aria-label={t('thumbSizeSmall')}>S</ToggleButton>
          <ToggleButton value="m" aria-label={t('thumbSizeMedium')}>M</ToggleButton>
          <ToggleButton value="l" aria-label={t('thumbSizeLarge')}>L</ToggleButton>
        </CompactGroup>
      </Bar>

      <Viewport>
        <AutoSizer>
          {({ width, height }) => {
            if (!width || !height) return null;

          let columnCount;
          let rowCount;
          let columnWidth;
          let rowHeight;

          if (thumbSize === 'fit') {
            columnCount = 1;
            columnWidth = width;
            rowHeight = Math.max(1, Math.round(width * 1.7));
            rowCount = safe.length;
          } else {
            columnCount = Math.max(1, Math.floor(width / preset.tileW));
            rowCount = Math.ceil(safe.length / columnCount);
            columnWidth = preset.tileW;
            rowHeight = preset.tileH;
          }

          const tileW = columnWidth - GAP;
          const tileH = rowHeight - GAP;

          // expose latest column count for scroll effect
          layoutRef.current = { columnCount };

          const itemData = { canvases: safe, windowId, columnCount, thumbSize, tileW, tileH };

            return (
              <Grid
                ref={gridRef}
                width={width}
                height={height}
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={columnWidth}
                rowHeight={rowHeight}
                itemData={itemData}
                overscanRowCount={1}
                overscanColumnCount={1}
              >
                {Cell}
              </Grid>
            );
          }}
        </AutoSizer>
      </Viewport>
    </Root>
  );
}

GalleryView.propTypes = {
  canvases: PropTypes.array,
  windowId: PropTypes.string.isRequired,
  currentCanvasId: PropTypes.string,
};
