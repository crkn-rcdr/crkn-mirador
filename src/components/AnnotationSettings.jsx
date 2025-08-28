import PropTypes from 'prop-types';
import BiIcon from './BiIcon';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';

/**
 * AnnotationSettings is a component to handle various annotation
 * display settings in the Annotation companion window
*/
export function AnnotationSettings({
  displayAll, displayAllDisabled, toggleAnnotationDisplay,
}) {
  const { t } = useTranslation();
  return (
    <MiradorMenuButton
      aria-label={t(displayAll ? 'displayNoAnnotations' : 'highlightAllAnnotations')}
      onClick={toggleAnnotationDisplay}
      disabled={displayAllDisabled}
      size="small"
    >
      { displayAll ? <BiIcon name="eye" size={16} /> : <BiIcon name="eye-slash" size={16} /> }
    </MiradorMenuButton>
  );
}

AnnotationSettings.propTypes = {
  displayAll: PropTypes.bool.isRequired,
  displayAllDisabled: PropTypes.bool.isRequired,
  toggleAnnotationDisplay: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
};
