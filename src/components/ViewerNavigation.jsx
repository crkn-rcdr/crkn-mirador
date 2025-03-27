import NavigationIcon from '@mui/icons-material/PlayCircleOutlineSharp';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import ns from '../config/css-ns';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { useState } from 'react';
/**
 */
export function ViewerNavigation({
  canvases, 
  canvasIndex,
  hasNextCanvas = false, hasPreviousCanvas = false,
  setNextCanvas = () => {}, setPreviousCanvas = () => {},
  setCanvas = () => {},
  viewingDirection = '',
}) {
  console.log("Cnavasss", canvases)
  const { t } = useTranslation();
  let htmlDir = 'ltr';
  let previousIconStyle = {};
  let nextIconStyle = {};
  let canvasSelectOptions = canvases.map((el, i) => { return (i+1).toString() });
  const [canvasSelectValue, setCanvasSelectValue] = useState((canvasIndex+1).toString());
  switch (viewingDirection) {
    case 'top-to-bottom':
      previousIconStyle = { transform: 'rotate(270deg)' };
      nextIconStyle = { transform: 'rotate(90deg)' };
      break;
    case 'bottom-to-top':
      previousIconStyle = { transform: 'rotate(90deg)' };
      nextIconStyle = { transform: 'rotate(270deg)' };
      break;
    case 'right-to-left':
      htmlDir = 'rtl';
      previousIconStyle = {};
      nextIconStyle = { transform: 'rotate(180deg)' };
      break;
    default:
      previousIconStyle = { transform: 'rotate(180deg)' };
      nextIconStyle = {};
  }

  return (
    <div
      className={classNames(ns('osd-navigation'))}
      style={{ display: "inline-flex", alignItems: "center" }}
      dir={htmlDir}
    >
      <Autocomplete
        disablePortal
        value={canvasSelectValue}
        onChange={(event, newValue) => {
          setCanvasSelectValue(newValue);
          setCanvas(canvases[parseInt(newValue)-1].id)
        }}
        options={canvasSelectOptions}
        sx={{ width: 100, display: "inline-block", marginRight: "1rem" }}
        renderInput={(params) => <TextField {...params} label={t('canvasIndex')} />}
      />
      <MiradorMenuButton
        aria-label={t('previousCanvas')}
        className={ns('previous-canvas-button')}
        disabled={!hasPreviousCanvas}
        onClick={() => { hasPreviousCanvas && setPreviousCanvas(); }}
      >
        <NavigationIcon style={previousIconStyle} />
      </MiradorMenuButton>
      <MiradorMenuButton
        aria-label={t('nextCanvas')}
        className={ns('next-canvas-button')}
        disabled={!hasNextCanvas}
        onClick={() => { hasNextCanvas && setNextCanvas(); }}
      >
        <NavigationIcon style={nextIconStyle} />
      </MiradorMenuButton>
    </div>
  );
}

ViewerNavigation.propTypes = {
  canvases: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  hasNextCanvas: PropTypes.bool,
  hasPreviousCanvas: PropTypes.bool,
  setNextCanvas: PropTypes.func,
  setPreviousCanvas: PropTypes.func,
  viewingDirection: PropTypes.string,
};
