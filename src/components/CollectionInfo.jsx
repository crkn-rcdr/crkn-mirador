import { useId } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import BiIcon from './BiIcon';
import { useTranslation } from 'react-i18next';
import CollapsibleSection from '../containers/CollapsibleSection';

/**
 * CollectionInfo
 */
export function CollectionInfo({
  collectionLabel = null, collectionPath = [], showCollectionDialog, windowId = null,
}) {
  const { t } = useTranslation();
  const id = useId();
  const titleId = useId();

  /**
   * Show the containing collection.
   */
  const openCollectionDialog = () => {
    const manifestId = collectionPath[collectionPath.length - 1];

    showCollectionDialog(manifestId, collectionPath.slice(0, -1), windowId);
  };

  if (collectionPath.length === 0) return null;

  return (
    <CollapsibleSection
      id={id}
      label={t('collection')}
    >
      {collectionLabel && (
        <Typography
          aria-labelledby={`${id} ${titleId}`}
          id={titleId}
          variant="h4"
        >
          {collectionLabel}
        </Typography>
      )}

      <Button
        color="primary"
        onClick={openCollectionDialog}
        startIcon={<BiIcon name="list" size={16} />}
      >
        {t('showCollection')}
      </Button>
    </CollapsibleSection>
  );
}

CollectionInfo.propTypes = {
  collectionLabel: PropTypes.string,
  collectionPath: PropTypes.arrayOf(PropTypes.string),
  showCollectionDialog: PropTypes.func.isRequired,
  windowId: PropTypes.string,
};
