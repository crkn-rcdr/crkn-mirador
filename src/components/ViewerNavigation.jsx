import NavigationIcon from '@mui/icons-material/PlayCircleOutlineSharp';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import ns from '../config/css-ns';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
/**
 */
export function ViewerNavigation({
  hasNextCanvas = false, hasPreviousCanvas = false,
  setNextCanvas = () => {}, setPreviousCanvas = () => {},
  viewingDirection = '',
}) {
  const { t } = useTranslation();
  let htmlDir = 'ltr';
  let previousIconStyle = {};
  let nextIconStyle = {};
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
        options={["1", "2"]}
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
  hasNextCanvas: PropTypes.bool,
  hasPreviousCanvas: PropTypes.bool,
  setNextCanvas: PropTypes.func,
  setPreviousCanvas: PropTypes.func,
  viewingDirection: PropTypes.string,
};
