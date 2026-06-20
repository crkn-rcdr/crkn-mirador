// Bootstrap icons used inline; removed unused MUI icon import
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import ns from '../config/css-ns';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const navButtonSx = {
  borderRadius: '3px',
  flex: '0 0 40px',
  height: 40,
  minHeight: 40,
  minWidth: 40,
  padding: 0,
  width: 40,
  '@media (pointer: coarse)': {
    flexBasis: 44,
    height: 44,
    minHeight: 44,
    minWidth: 44,
    width: 44,
  },
};

const canvasIndexSelectSx = {
  display: 'inline-block',
  flex: '0 0 100px',
  height: 40,
  marginRight: '1rem',
  width: 100,
  '& .MuiAutocomplete-endAdornment': {
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '& .MuiFormControl-root': {
    height: 40,
  },
  '& .MuiInputBase-input': {
    boxSizing: 'border-box',
    height: 40,
    paddingBottom: '0 !important',
    paddingTop: '0 !important',
  },
  '& .MuiInputBase-root': {
    alignItems: 'center',
    boxSizing: 'border-box',
    height: 40,
    minHeight: 40,
    paddingBottom: '0 !important',
    paddingTop: '0 !important',
  },
  '& .MuiInputLabel-root': {
    lineHeight: 1,
    transform: 'translate(14px, -4px) scale(0.75)',
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -4px) scale(0.75)',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    top: 0,
  },
  '& .MuiTextField-root': {
    height: 40,
  },
  '@media (pointer: coarse)': {
    height: 44,
    '& .MuiFormControl-root': {
      height: 44,
    },
    '& .MuiInputBase-input': {
      height: 44,
    },
    '& .MuiInputBase-root': {
      height: 44,
      minHeight: 44,
    },
    '& .MuiTextField-root': {
      height: 44,
    },
  },
};
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
  const { t } = useTranslation();
  let htmlDir = 'ltr';
  let previousIconStyle = {};
  let nextIconStyle = {};
  let canvasSelectOptions = canvases.map((el, i) => { return (i+1).toString() });
  
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
      style={{ display: 'inline-flex', alignItems: 'center' }}
      dir={htmlDir}
    >
      
      <MiradorMenuButton
        aria-label={t('previousCanvas')}
        className={ns('previous-canvas-button')}
        disabled={!hasPreviousCanvas}
        onClick={() => { hasPreviousCanvas && setPreviousCanvas(); }}
        sx={navButtonSx}
        TooltipProps={{ disableTouchListener: true }}
      >
        <i className="bi bi-arrow-left"></i>
      </MiradorMenuButton>
      <MiradorMenuButton
        aria-label={t('nextCanvas')}
        className={ns('next-canvas-button')}
        disabled={!hasNextCanvas}
        onClick={() => { hasNextCanvas && setNextCanvas(); }}
        sx={navButtonSx}
        TooltipProps={{ disableTouchListener: true }}
      >
        <i className="bi bi-arrow-right"></i>
      </MiradorMenuButton>
      <Autocomplete
        size="small"
        disablePortal={false}
        value={(canvasIndex+1).toString()}
        onChange={(event, newValue) => {
          if (!newValue) return;
          //setCanvasSelectValue(newValue);
          setCanvas(canvases[parseInt(newValue)-1].id)
        }}
        options={canvasSelectOptions}
        slotProps={{
          popper: {
            style: { zIndex: 100000003 },
          },
        }}
        sx={canvasIndexSelectSx}
        renderInput={(params) => <TextField {...params} label={t('canvasIndex')} />}
      />
    </div>
  );
}

ViewerNavigation.propTypes = {
  canvases: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  canvasIndex: PropTypes.number.isRequired,
  hasNextCanvas: PropTypes.bool,
  hasPreviousCanvas: PropTypes.bool,
  setNextCanvas: PropTypes.func,
  setPreviousCanvas: PropTypes.func,
  viewingDirection: PropTypes.string,
};
