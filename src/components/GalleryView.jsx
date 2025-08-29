// components/GalleryView.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useElementSize } from '@custom-react-hooks/use-element-size';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeGrid as Grid, areEqual } from 'react-window';
import GalleryViewThumbnail from '../containers/GalleryViewThumbnail';
import Slider from '@mui/material/Slider';
import BiIcon from './BiIcon';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import { useTranslation } from 'react-i18next';

const Root = styled('div', { name: 'GalleryView', slot: 'root' })(({ theme }) => ({
  height: '100%',
  width: '100%',
  backgroundColor: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 1.5,
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

// Slider-style controls to choose S/M/L/Fit
const SizeControls = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  background: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.72)' : 'rgba(255,255,255,0.82)',
  color: theme.palette.text.primary,
  border: 'none',
  borderRadius: 16,
  boxShadow: theme.shadows[2],
  padding: '6px 10px',
  minWidth: 0,
}));

const SizeSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.65)' : 'rgba(0,0,0,0.55)',
  height: 6,
  padding: '6px 0',
  '& .MuiSlider-rail': {
    opacity: theme.palette.mode === 'dark' ? 0.35 : 0.25,
  },
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    width: 18,
    height: 18,
    backgroundColor: theme.palette.mode === 'dark' ? '#666' : '#888',
    border: 'none',
    boxShadow: theme.shadows[2],
    '&:focus, &:hover, &.Mui-active': { boxShadow: theme.shadows[3] },
  },
}));

// Fixed target widths for thumbnails by size preset.
// Heights are computed dynamically per-canvas from its aspect ratio.
const SIZE_PRESETS = {
  s: { tileW: 120 },
  m: { tileW: 200 },
  l: { tileW: 390 },
};

const GAP = 20;
// In 'fit' mode, reduce the column width slightly to avoid any rounding-driven X overflow.
const FIT_NUDGE = 24; // px
const FIT_LEFT_INSET = 16; // px left inset to align with SizeControls
const FIT_CELL_SHRINK = 2; // additional in-cell shrink to be extra safe

const Cell = React.memo(({ columnIndex, rowIndex, style, data }) => {
  const { canvases, windowId, columnCount, thumbSize, getTileW, getTileH } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= canvases.length) return null;
  const canvas = canvases[index];

  const gapX = columnCount > 1 ? GAP : 0;
  const cellStyle = {
    ...style,
    left: style.left + (columnCount === 1 ? FIT_LEFT_INSET : (gapX / 2)),
    top: style.top + GAP / 2,
    width: (style.width - gapX - (columnCount === 1 ? FIT_CELL_SHRINK : 0)),
    height: style.height - GAP,
  };
  const tileW = getTileW();
  const tileH = getTileH(index);

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

export function GalleryView({ canvases = [], windowId, currentCanvasId, controlWidth }) {
  const { t } = useTranslation();
  const safe = (canvases || []).filter(c => c && (c.id || typeof c.index !== 'undefined'));
  const [thumbSize, setThumbSize] = useState('fit');
  const gridRef = useRef(null);
  // store latest computed layout values without re-render churn
  const layoutRef = useRef({ columnCount: 1 });
  const lastIdxRef = useRef(-1);
  const sizeCacheRef = useRef({
    width: 0,
    columnCount: 1,
    columnWidth: 0,
    rowHeights: [],
  });

  // Derive aspect ratios for all canvases. Fallback ~0.7 if unknown.
  const ratios = useMemo(() => safe.map((c) => {
    try {
      const w = typeof c.getWidth === 'function' ? c.getWidth() : (c?.width || c?.__jsonld?.width);
      const h = typeof c.getHeight === 'function' ? c.getHeight() : (c?.height || c?.__jsonld?.height);
      const r = Number(w) / Number(h);
      return (Number.isFinite(r) && r > 0) ? r : 0.7;
    } catch (_) {
      return 0.7;
    }
  }), [safe]);

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

  const [barRef, barSize] = useElementSize();

  return (
    <Root>
      <Bar ref={barRef}>
        {(() => {
          const SIZE_TO_INDEX = { s: 0, m: 1, l: 2, fit: 3 };
          const INDEX_TO_SIZE = ['s', 'm', 'l', 'fit'];
          const idx = SIZE_TO_INDEX[thumbSize] ?? 1;
          const setIdx = (next) => setThumbSize(INDEX_TO_SIZE[Math.min(3, Math.max(0, next))]);
          // Let the slider shrink with available bar width, but never exceed current max
          const currentMax = controlWidth || 160;
          // Account for paddings, two buttons, and gaps (~120px total footprint)
          const available = Math.max(80, Math.floor((barSize?.width || currentMax) - 120));
          const sliderWidth = Math.min(currentMax, available);
          return (
            <SizeControls>
              <MiradorMenuButton
                aria-label={t('thumbSizeSmall')}
                onClick={() => setIdx(idx - 1)}
                disabled={idx <= 0}
                sx={(theme) => ({
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                  color: theme.palette.text.secondary,
                  borderRadius: 2,
                  width: 36,
                  height: 28,
                })}
              >
                <BiIcon name="dash" size={16} />
              </MiradorMenuButton>
              <SizeSlider
                aria-label="Thumbnail size"
                min={0}
                max={3}
                step={1}
                value={idx}
                onChange={(_, v) => setIdx(Array.isArray(v) ? v[0] : v)}
                sx={{ width: sliderWidth }}
              />
              <MiradorMenuButton
                aria-label={t('thumbSizeLarge')}
                onClick={() => setIdx(idx + 1)}
                disabled={idx >= 3}
                sx={(theme) => ({
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
                  color: theme.palette.text.secondary,
                  borderRadius: 2,
                  width: 36,
                  height: 28,
                })}
              >
                <BiIcon name="plus" size={16} />
              </MiradorMenuButton>
            </SizeControls>
          );
        })()}
      </Bar>

      <Viewport>
        <AutoSizer>
          {({ width, height }) => {
            if (!width || !height) return null;

            // Determine columns from target width for this preset
            let columnCount;
            let columnWidth;
            if (thumbSize === 'fit') {
              columnCount = 1;
              columnWidth = Math.max(1, Math.floor(width) - FIT_NUDGE - FIT_LEFT_INSET);
            } else {
              const target = (SIZE_PRESETS[thumbSize] || SIZE_PRESETS.m).tileW; // desired tile INNER width
              // Determine how many target-width tiles (plus gaps) fit.
              columnCount = Math.max(1, Math.floor((width + GAP) / (target + GAP)));
              // Use fixed column width = target + GAP so tiles preserve requested width
              columnWidth = target + GAP;
            }

            const gapX = columnCount > 1 ? GAP : 0;
            const tileInnerW = Math.max(1, columnWidth - gapX);
            const rowCount = Math.ceil(safe.length / columnCount);

            // Precompute row heights as the max tile height per row based on canvas ratios
            const rowHeights = new Array(rowCount).fill(0).map((_, rowIndex) => {
              let maxH = 0;
              for (let c = 0; c < columnCount; c += 1) {
                const idx = rowIndex * columnCount + c;
                if (idx >= ratios.length) break;
                const r = ratios[idx] || 0.7;
                const h = Math.round(tileInnerW / r);
                if (h > maxH) maxH = h;
              }
              // add GAP to produce the actual grid row height
              return Math.max(1, maxH + GAP);
            });

            // If layout-affecting values changed, reset measured cache
            const cache = sizeCacheRef.current;
            cache.width = width;
            cache.columnCount = columnCount;
            cache.columnWidth = columnWidth;
            cache.rowHeights = rowHeights;
            if (gridRef.current && typeof gridRef.current.resetAfterIndices === 'function') {
              gridRef.current.resetAfterIndices({ columnIndex: 0, rowIndex: 0, shouldForceUpdate: true });
            }

            const getTileW = () => tileInnerW;
            const getTileH = (idx) => {
              const r = ratios[idx] || 0.7;
              return Math.max(1, Math.round(tileInnerW / r));
            };

            // expose latest column count for scroll effect
            layoutRef.current = { columnCount };

            const itemData = { canvases: safe, windowId, columnCount, thumbSize, getTileW, getTileH };

            return (
              <Grid
                ref={gridRef}
                width={width}
                height={height}
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={() => columnWidth}
                rowHeight={(rowIndex) => sizeCacheRef.current.rowHeights[rowIndex] || (tileInnerW + GAP)}
                itemData={itemData}
                overscanRowCount={1}
                overscanColumnCount={1}
                itemKey={(params) => {
                  const { columnIndex, rowIndex } = params;
                  return rowIndex * columnCount + columnIndex;
                }}
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
  controlWidth: PropTypes.number,
};
