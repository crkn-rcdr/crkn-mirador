import { useContext } from 'react';
import BiIcon from './BiIcon';
import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import FullScreenContext from '../contexts/FullScreenContext';

/**
 */
export function FullScreenButton({ className = undefined }) {
  const { t } = useTranslation();
  const handle = useContext(FullScreenContext);
  const isMobile = useMediaQuery('(max-width:600px)');

  if (isMobile) return null;

  if (handle && handle.active) {
    return (
      <MiradorMenuButton className={className} aria-label={t('exitFullScreen')} onClick={handle.exit}>
        <BiIcon name="fullscreen-exit" size={18} />
      </MiradorMenuButton>
    );
  }

  if (handle) {
    return (
      <MiradorMenuButton className={className} aria-label={t('workspaceFullScreen')} onClick={handle.enter}>
        <BiIcon name="fullscreen" size={18} />
      </MiradorMenuButton>
    );
  }

  return null;
}

FullScreenButton.propTypes = {
  className: PropTypes.string,
};
