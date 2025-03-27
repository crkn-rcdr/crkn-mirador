import { useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Paper from '@mui/material/Paper';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useCanvasWorldService } from '../hooks';
import ThumbnailCanvasGrouping from '../containers/ThumbnailCanvasGrouping';
import ns from '../config/css-ns';
/**
 */
export function ThumbnailNavigation({
  canvasGroupings, canvasIndex, hasNextCanvas = false, hasPreviousCanvas = false, position,
  setNextCanvas = () => {}, setPreviousCanvas = () => {}, thumbnailNavigation, view = undefined, viewingDirection = '', windowId,
}) {
  
  return (
    <></>
  );
}

ThumbnailNavigation.propTypes = {
  canvasGroupings: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canvasIndex: PropTypes.number.isRequired,
  hasNextCanvas: PropTypes.bool,
  hasPreviousCanvas: PropTypes.bool,
  position: PropTypes.string.isRequired,
  setNextCanvas: PropTypes.func,
  setPreviousCanvas: PropTypes.func,
  thumbnailNavigation: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  view: PropTypes.string,
  viewingDirection: PropTypes.string,
  windowId: PropTypes.string.isRequired,
};
