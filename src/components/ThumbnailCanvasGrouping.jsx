import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import classNames from 'classnames';
import IIIFThumbnail from '../containers/IIIFThumbnail';
import ns from '../config/css-ns';

const StyledCanvas = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  color: theme.palette.common.white,
  cursor: 'pointer',
  display: 'inline-block',
  whiteSpace: 'nowrap',
}));
/** */
export class ThumbnailCanvasGrouping extends PureComponent {
  /** */
  constructor(props) {
    super(props);
    this.setCanvas = this.setCanvas.bind(this);
  }

  /** */
  setCanvas(e) {
    const { setCanvas } = this.props;
    setCanvas(e.currentTarget.dataset.canvasId);
  }

  /**
   * Determines whether the current index is the rendered canvas, providing
   * a useful class.
   */
  currentCanvasClass(canvasIndices) {
    const { index } = this.props;
    if (canvasIndices.includes(index)) return 'current-canvas-grouping';
    return '';
  }

  /** */
  render() {
    const {
      index, style, data, currentCanvasId, showThumbnailLabels,
    } = this.props;
    const {
      canvasGroupings, position, height, spacing = 8,
    } = data;
    const currentGroupings = canvasGroupings[index];
    const SPACING = spacing;
    const topInset = position === 'far-bottom' ? Math.max(2, Math.floor(SPACING / 2)) : SPACING;
    const canvasMaxHeight = position === 'far-right'
      ? style.height - (1.5 * SPACING)
      : Math.max(1, height - Math.ceil(SPACING / 2));
    return (
      <div
        style={{
          ...style,
          boxSizing: 'content-box',
          height: (Number.isInteger(style.height)) ? style.height - topInset : null,
          left: (Number.isInteger(style.left)) ? style.left + SPACING : null,
          top: style.top + topInset,
          width: (Number.isInteger(style.width)) ? style.width - SPACING : null,
        }}
        className={ns('thumbnail-nav-container')}
        role="gridcell"
        aria-colindex={index + 1}
      >
        <StyledCanvas
          role="button"
          data-canvas-id={currentGroupings[0].id}
          data-canvas-index={currentGroupings[0].index}
          onKeyUp={this.setCanvas}
          onClick={this.setCanvas}
          tabIndex={-1}
          sx={theme => ({
            '&:hover': {
              outline: `9px solid ${theme.palette.action.hover}`,
              outlineOffset: '-2px',
            },
            height: (position === 'far-right') ? 'auto' : `${canvasMaxHeight}px`,
            outline: currentGroupings.map(canvas => canvas.id).includes(currentCanvasId) ? `2px solid ${theme.palette.primary.main}` : 0,
            ...(currentGroupings.map(canvas => canvas.id).includes(currentCanvasId) && {
              outlineOffset: '3px',
            }),
            width: (position === 'far-bottom') ? 'auto' : `${style.width}px`,
          })}
          className={classNames(
            ns(['thumbnail-nav-canvas', `thumbnail-nav-canvas-${index}`, this.currentCanvasClass(currentGroupings.map(canvas => canvas.index))]),
          )}
        >
          {currentGroupings.map((canvas, i) => (
            <IIIFThumbnail
              key={canvas.id}
              resource={canvas}
              labelled={showThumbnailLabels}
              maxHeight={canvasMaxHeight}
              variant="inside"
            />
          ))}
        </StyledCanvas>
      </div>
    );
  }
}

ThumbnailCanvasGrouping.propTypes = {
  currentCanvasId: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  index: PropTypes.number.isRequired,
  setCanvas: PropTypes.func.isRequired,
  showThumbnailLabels: PropTypes.bool.isRequired,
  style: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};
