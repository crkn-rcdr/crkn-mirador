import { useId, useRef } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import CompanionWindow from '../containers/CompanionWindow';
import SidebarIndexTableOfContents from '../containers/SidebarIndexTableOfContents';

const StyledBreak = styled('div')(() => ({
  flexBasis: '100%',
  height: 0,
}));

/**
 * a panel showing the canvases for a given manifest
 */
export function WindowSideBarCanvasPanel({
  collection = null,
  id,
  showMultipart,
  sequenceId = null,
  sequences = [],
  variant,
  showToc = false,
  updateSequence,
  updateVariant,
  windowId,
}) {
  const { t } = useTranslation();
  const containerRef = useRef();
  const tabPanelId = useId();

  /** */
  const handleSequenceChange = (event) => {
    updateSequence(event.target.value);
  };

  /** */
  const handleVariantChange = (event, value) => {
    updateVariant(value);
  };

  let listComponent = (
      <SidebarIndexTableOfContents
        id={id}
        containerRef={containerRef}
        windowId={windowId}
      />
  );
  return (
    <CompanionWindow
      title={t('canvasIndex')}
      id={id}
      windowId={windowId}
      ref={containerRef}
    >
      <div id={tabPanelId}>
        {listComponent}
      </div>
    </CompanionWindow>
  );
}

WindowSideBarCanvasPanel.propTypes = {
  collection: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  id: PropTypes.string.isRequired,
  sequenceId: PropTypes.string,
  sequences: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
  showMultipart: PropTypes.func.isRequired,
  showToc: PropTypes.bool,
  updateSequence: PropTypes.func.isRequired,
  updateVariant: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['item', 'thumbnail', 'tableOfContents']).isRequired,
  windowId: PropTypes.string.isRequired,
};
