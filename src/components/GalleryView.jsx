// components/GalleryView.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useElementSize } from '@custom-react-hooks/use-element-size';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeGrid as Grid, areEqual } from 'react-window';
import GalleryViewThumbnail from '../containers/GalleryViewThumbnail';
import WindowViewSettings from '../containers/WindowViewSettings';
import CanvasGroupings from '../lib/CanvasGroupings';
import { persistWindowThumbnailSize, readPersistedWindowThumbnailSize } from '../lib/windowViewPreferences';
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

const Bar = styled('div', { name: 'GalleryView', slot: 'bar' })(({ theme, ownerState }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  padding: '2px',
  borderBottom: ownerState?.isMobileStrip ? 'none' : `1px solid ${theme.palette.divider}`,
}));

const DeepZoomCluster = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: theme.spacing(0.2),
  minWidth: 0,
  paddingRight: theme.spacing(0.2),
  '& .cluster-label': {
    color: theme.palette.text.secondary,
    fontSize: '0.67rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    lineHeight: 1,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
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
  s: { tileW: 150 },
  m: { tileW: 200 },
  l: { tileW: 390 },
};

const GRID_GAP = 8;
const STRIP_GAP = 10;
const VERTICAL_STRIP_GAP = 4;
const STRIP_MIN_TILE_W = 96;
const STRIP_MAX_TILE_W = 180;
const STRIP_MIN_CONTENT_W = 72;
const STRIP_TILE_PAD = 10;
const STRIP_TILE_PAD_X = 8;
const STRIP_OUTLINE_RESERVE = 4;
const STRIP_MIN_VISIBLE = 4;
const STRIP_MAX_VISIBLE = 7;
const THUMB_ROOT_PAD = 16; // matches GalleryViewThumbnail Root padding (8 top + 8 bottom)
const VERTICAL_STRIP_THUMB_PAD = 12; // tighter side strip padding (6 top + 6 bottom)
const OUTSIDE_LABEL_RESERVE_S = 40;
const OUTSIDE_LABEL_RESERVE_DEFAULT = 44;
const STRIP_EXTRA_LABEL_RESERVE = 2;
const SINGLE_COLUMN_NUDGE = 30;
const SINGLE_COLUMN_INSET = Math.floor(SINGLE_COLUMN_NUDGE / 2);
// In 'fit' mode, reduce the column width slightly to avoid any rounding-driven X overflow.
const FIT_NUDGE = 24; // px
const FIT_LEFT_INSET = 16; // px left inset to align with SizeControls
const FIT_CELL_SHRINK = 2; // additional in-cell shrink to be extra safe
const BOOK_PAIR_GAP = 12;
const VERTICAL_BOTTOM_BUFFER = 8;
const VERTICAL_RIGHT_GUTTER = 16;

const PairGroup = styled('div')({
  display: 'flex',
  width: '100%',
  height: '100%',
  alignItems: 'flex-start',
});

const PairItem = styled('div')({
  flex: '1 1 0',
  minWidth: 0,
  height: '100%',
});

const normalizeCanvasId = (id) => (id || '').toString().split('#')[0];
const getCanvasKey = (canvas) => normalizeCanvasId(canvas?.id) || `index-${canvas?.index}`;

const getCanvasAspectRatio = (canvas) => {
  try {
    const w = typeof canvas?.getWidth === 'function' ? canvas.getWidth() : (canvas?.width || canvas?.__jsonld?.width);
    const h = typeof canvas?.getHeight === 'function' ? canvas.getHeight() : (canvas?.height || canvas?.__jsonld?.height);
    const r = Number(w) / Number(h);
    return (Number.isFinite(r) && r > 0) ? r : 0.7;
  } catch (_) {
    return 0.7;
  }
};

const VerticalGridOuter = React.forwardRef(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{ ...style, overflowX: 'hidden', overflowY: 'auto' }}
    {...props}
  />
));

VerticalGridOuter.displayName = 'VerticalGridOuter';

const HorizontalStripOuter = React.forwardRef(({ style, ...props }, ref) => (
  <div
    ref={ref}
    style={{
      ...style,
      boxSizing: 'border-box',
      overflowX: 'auto',
      overflowY: 'visible',
      paddingBottom: 2,
      paddingTop: 4,
    }}
    {...props}
  />
));

HorizontalStripOuter.displayName = 'HorizontalStripOuter';

const Cell = React.memo(({ columnIndex, rowIndex, style, data }) => {
  const {
    items,
    windowId,
    columnCount,
    thumbSize,
    getTileW,
    getTileH,
    isMobileStrip,
    isBookPairLayout,
    cellGap: providedCellGap,
  } = data;
  const index = rowIndex * columnCount + columnIndex;
  if (index >= items.length) return null;
  const group = items[index] || [];

  const isVerticalStrip = !isMobileStrip && columnCount === 1;
  const cellGap = Number.isFinite(providedCellGap)
    ? providedCellGap
    : (isMobileStrip ? STRIP_GAP : (isVerticalStrip ? VERTICAL_STRIP_GAP : GRID_GAP));
  const gapX = columnCount > 1 ? cellGap : 0;
  const stripTopInset = isMobileStrip ? 2 : 0;
  const useFitInset = !isMobileStrip && thumbSize === 'fit';
  const useSingleColumnInset = !isMobileStrip && !useFitInset && columnCount === 1;
  const cellStyle = {
    ...style,
    left: style.left + (useFitInset ? FIT_LEFT_INSET : (useSingleColumnInset ? SINGLE_COLUMN_INSET : (gapX / 2))),
    top: style.top + cellGap / 2 + stripTopInset,
    width: (style.width - gapX - (useFitInset ? FIT_CELL_SHRINK : 0)),
    height: style.height - cellGap - stripTopInset,
  };
  const tileW = getTileW();
  const tileH = (canvasOffset = 0) => getTileH(index, canvasOffset);
  const isBookSoloItem = isBookPairLayout && group.length === 1;

  if (isBookPairLayout && group.length > 1) {
    return (
      <div style={cellStyle}>
        <PairGroup className="mirador-book-pair-group" style={{ gap: BOOK_PAIR_GAP }}>
          {group.map((canvas, canvasOffset) => (
            <PairItem key={canvas?.id || `pair-${index}-${canvasOffset}`}>
              <GalleryViewThumbnail
                windowId={windowId}
                canvas={canvas}
                thumbSize={thumbSize}
                tileW={tileW}
                tileH={tileH(canvasOffset)}
                isMobileStrip={isMobileStrip}
                isVerticalStrip={isVerticalStrip}
              />
            </PairItem>
          ))}
        </PairGroup>
      </div>
    );
  }

  return (
    <div style={cellStyle}>
      {isBookSoloItem ? (
        <div style={{ width: tileW, maxWidth: '100%' }}>
          <GalleryViewThumbnail
            windowId={windowId}
            canvas={group[0]}
            thumbSize={thumbSize}
            tileW={tileW}
            tileH={tileH()}
            isMobileStrip={isMobileStrip}
            isVerticalStrip={isVerticalStrip}
          />
        </div>
      ) : (
        <GalleryViewThumbnail
          windowId={windowId}
          canvas={group[0]}
          thumbSize={thumbSize}
          tileW={tileW}
          tileH={tileH()}
          isMobileStrip={isMobileStrip}
          isVerticalStrip={isVerticalStrip}
        />
      )}
    </div>
  );
}, areEqual);

export function GalleryView({
  canvases = [],
  windowId,
  currentCanvasId,
  controlWidth,
  isBottomStrip = false,
  viewType = 'single',
  showDeepZoomLayoutControls = false,
}) {
  const { t } = useTranslation();
  const isMobileStrip = !!isBottomStrip;
  const isBookPairLayout = showDeepZoomLayoutControls && !isMobileStrip && viewType === 'book';
  const safe = (canvases || []).filter(c => c && (c.id || typeof c.index !== 'undefined'));
  const items = useMemo(() => {
    if (!isBookPairLayout) return safe.map(canvas => [canvas]);
    return new CanvasGroupings(safe, 'book').groupings();
  }, [safe, isBookPairLayout]);
  const [thumbSize, setThumbSize] = useState(() => readPersistedWindowThumbnailSize() || 's');
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

  const canvasRatios = useMemo(() => (
    safe.reduce((acc, canvas) => {
      acc[getCanvasKey(canvas)] = getCanvasAspectRatio(canvas);
      return acc;
    }, {})
  ), [safe]);
  const itemRatios = useMemo(() => (
    items.map(group => group.map(canvas => canvasRatios[getCanvasKey(canvas)] || 0.7))
  ), [items, canvasRatios]);

  useEffect(() => {
    persistWindowThumbnailSize(thumbSize);
  }, [thumbSize]);

  // When the current canvas changes (e.g., from a SearchHit),
  // scroll the virtualized grid to bring its thumbnail into view.
  useEffect(() => {
    if (!currentCanvasId || !gridRef.current || items.length === 0) return;

    const currentId = normalizeCanvasId(currentCanvasId);
    const idx = items.findIndex((group) => (
      group.some(canvas => normalizeCanvasId(canvas?.id) === currentId)
    ));
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
      const rowHeight = (thumbSize === 's' ? SIZE_PRESETS.s.tileW : thumbSize === 'm' ? SIZE_PRESETS.m.tileW : SIZE_PRESETS.l.tileW);
      gridRef.current.scrollTo({ scrollTop: Math.max(0, rowIndex * rowHeight) });
    }

    lastIdxRef.current = idx;
  }, [currentCanvasId, thumbSize, items]);
  //<CompactToggleButton value="fit" aria-label="Fit width">F</CompactToggleButton> - todo with search term highlighting

  const [barRef, barSize] = useElementSize();
  const shouldShowBar = !isMobileStrip || showDeepZoomLayoutControls;

  return (
    <Root>
      {shouldShowBar && (
      <Bar ref={barRef} ownerState={{ isMobileStrip }}>
        {!isMobileStrip && (() => {
          const SIZE_TO_INDEX = { s: 0, m: 1, l: 2, fit: 3 };
          const INDEX_TO_SIZE = ['s', 'm', 'l', 'fit'];
          const idx = SIZE_TO_INDEX[thumbSize] ?? 0;
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
        {showDeepZoomLayoutControls && (
          <DeepZoomCluster>
            <WindowViewSettings windowId={windowId} />
          </DeepZoomCluster>
        )}
      </Bar>
      )}

      <Viewport>
        <AutoSizer>
          {({ width, height }) => {
            if (!width || !height) return null;

            // Determine columns from target width for this preset
            let columnCount;
            let columnWidth;
            let stripColumnWidths = [];
            const baseLabelReserve = thumbSize === 's' ? OUTSIDE_LABEL_RESERVE_S : OUTSIDE_LABEL_RESERVE_DEFAULT;
            const stripTileChrome = THUMB_ROOT_PAD + baseLabelReserve + STRIP_EXTRA_LABEL_RESERVE;
            const stripVisibleCount = Math.max(
              STRIP_MIN_VISIBLE,
              Math.min(
                STRIP_MAX_VISIBLE,
                Math.round(width / 120),
              ),
            );
            const visibleThumbs = Math.max(1, Math.min(stripVisibleCount, items.length || stripVisibleCount));
            const candidateStripTileW = Math.floor((width - (Math.max(0, visibleThumbs - 1) * STRIP_GAP)) / visibleThumbs);
            const mobileStripTileW = Math.max(
              STRIP_MIN_TILE_W,
              Math.min(STRIP_MAX_TILE_W, candidateStripTileW),
            );
            const stripTileH = Math.max(
              stripTileChrome + 1,
              Math.max(1, height - STRIP_GAP),
            );
            const layoutWidth = isMobileStrip
              ? Math.max(1, Math.floor(width))
              : Math.max(1, Math.floor(width - VERTICAL_RIGHT_GUTTER));
            if (isMobileStrip) {
              // Mobile: render one horizontal strip and size each column to the
              // thumbnail's aspect ratio at full available strip height.
              columnCount = Math.max(1, items.length);
              const stripLabelReserve = baseLabelReserve + STRIP_EXTRA_LABEL_RESERVE;
              const stripImageHeight = Math.max(
                1,
                stripTileH - STRIP_TILE_PAD - stripLabelReserve - STRIP_OUTLINE_RESERVE,
              );
              stripColumnWidths = items.map((_, itemIndex) => {
                const ratio = (itemRatios[itemIndex]?.[0]) || 0.7;
                const imageWidth = Math.max(1, Math.round(stripImageHeight * ratio));
                const contentWidth = Math.max(STRIP_MIN_CONTENT_W, imageWidth + STRIP_TILE_PAD_X + STRIP_OUTLINE_RESERVE);
                return contentWidth + STRIP_GAP;
              });
              columnWidth = stripColumnWidths[0] || (mobileStripTileW + STRIP_GAP);
            } else if (thumbSize === 'fit') {
              columnCount = 1;
              columnWidth = Math.max(1, layoutWidth - FIT_NUDGE - FIT_LEFT_INSET);
            } else {
              const target = (SIZE_PRESETS[thumbSize] || SIZE_PRESETS.m).tileW; // desired tile INNER width
              const availableWidth = layoutWidth;
              // Determine how many target-width tiles (plus gaps) fit.
              columnCount = Math.max(1, Math.floor((availableWidth + GRID_GAP) / (target + GRID_GAP)));
              if (columnCount > 1) {
                // Fill the row width exactly to avoid horizontal overflow on narrow side panes.
                const tileInnerWidth = Math.max(1, Math.floor((availableWidth - ((columnCount - 1) * GRID_GAP)) / columnCount));
                columnWidth = tileInnerWidth + GRID_GAP;
              } else {
                columnWidth = Math.max(1, availableWidth - SINGLE_COLUMN_NUDGE);
              }
            }

            const isVerticalStripLayout = !isMobileStrip && columnCount === 1;
            const nonStripThumbPad = isVerticalStripLayout ? VERTICAL_STRIP_THUMB_PAD : THUMB_ROOT_PAD;
            const nonStripTileChrome = nonStripThumbPad + baseLabelReserve;
            const layoutGap = isMobileStrip
              ? STRIP_GAP
              : (isVerticalStripLayout ? VERTICAL_STRIP_GAP : GRID_GAP);
            const gapX = columnCount > 1 ? layoutGap : 0;
            const tileInnerW = Math.max(1, columnWidth - gapX);
            const pairTileInnerW = isBookPairLayout
              ? Math.max(1, Math.floor((tileInnerW - BOOK_PAIR_GAP) / 2))
              : tileInnerW;
            const rowCount = isMobileStrip ? 1 : Math.ceil(items.length / columnCount);

            const getItemHeight = (itemIndex) => {
              const ratiosForItem = itemRatios[itemIndex] || [0.7];
              if (isBookPairLayout) {
                return ratiosForItem.reduce((maxH, ratio) => (
                  Math.max(maxH, Math.round(pairTileInnerW / (ratio || 0.7)) + nonStripTileChrome)
                ), 0);
              }
              const ratio = ratiosForItem[0] || 0.7;
              return Math.round(tileInnerW / ratio) + nonStripTileChrome;
            };

            // Precompute row heights as the max tile height per row based on canvas ratios
            const rowHeights = isMobileStrip
              ? [Math.max(1, stripTileH + STRIP_GAP)]
              : new Array(rowCount).fill(0).map((_, rowIndex) => {
                let maxH = 0;
                for (let c = 0; c < columnCount; c += 1) {
                  const idx = rowIndex * columnCount + c;
                  if (idx >= items.length) break;
                  const h = getItemHeight(idx);
                  if (h > maxH) maxH = h;
                }
                // add GRID_GAP to produce the actual grid row height
                const baseHeight = Math.max(1, maxH + layoutGap);
                return rowIndex === rowCount - 1
                  ? (baseHeight + VERTICAL_BOTTOM_BUFFER)
                  : baseHeight;
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

            const getTileW = (idx = 0) => {
              if (isMobileStrip) {
                const stripColumnWidth = stripColumnWidths[idx] || (mobileStripTileW + STRIP_GAP);
                return Math.max(1, stripColumnWidth - STRIP_GAP);
              }
              return isBookPairLayout ? pairTileInnerW : tileInnerW;
            };
            const getTileH = (idx, canvasOffset = 0) => {
              if (isMobileStrip) {
                return stripTileH;
              }
              const ratiosForItem = itemRatios[idx] || [0.7];
              const ratio = isBookPairLayout
                ? (ratiosForItem[canvasOffset] || ratiosForItem[0] || 0.7)
                : (ratiosForItem[0] || 0.7);
              const widthForCanvas = isBookPairLayout ? pairTileInnerW : tileInnerW;
              return Math.max(1, Math.round(widthForCanvas / ratio) + nonStripTileChrome);
            };

            // expose latest column count for scroll effect
            layoutRef.current = { columnCount };

            const itemData = {
              items,
              windowId,
              columnCount,
              thumbSize,
              getTileW,
              getTileH,
              isMobileStrip,
              isBookPairLayout,
              cellGap: layoutGap,
            };

            return (
              <Grid
                ref={gridRef}
                width={width}
                height={height}
                outerElementType={isMobileStrip ? HorizontalStripOuter : VerticalGridOuter}
                columnCount={columnCount}
                rowCount={rowCount}
                columnWidth={(columnIndex) => (
                  isMobileStrip
                    ? (stripColumnWidths[columnIndex] || columnWidth)
                    : columnWidth
                )}
                rowHeight={(rowIndex) => sizeCacheRef.current.rowHeights[rowIndex] || (tileInnerW + layoutGap)}
                itemData={itemData}
                overscanRowCount={isMobileStrip ? 0 : 1}
                overscanColumnCount={isMobileStrip ? 2 : 1}
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
  isBottomStrip: PropTypes.bool,
  viewType: PropTypes.oneOf(['single', 'book', 'scroll']),
  showDeepZoomLayoutControls: PropTypes.bool,
};
