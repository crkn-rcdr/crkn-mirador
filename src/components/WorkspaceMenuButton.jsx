import { useId, useState } from 'react';
import BiIcon from './BiIcon';
import { useTranslation } from 'react-i18next';
import WorkspaceMenu from '../containers/WorkspaceMenu';
import MiradorMenuButton from '../containers/MiradorMenuButton';

/**
 */
export function WorkspaceMenuButton() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const id = useId();

  /**  */
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  /**  */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  return (
    <>
      <MiradorMenuButton
        aria-haspopup="true"
        aria-label={t('workspaceMenu')}
        aria-owns={open ? id : undefined}
        selected={open}
        id="menuBtn"
        onClick={handleMenuClick}
      >
        <BiIcon name="gear" size={18} />
      </MiradorMenuButton>
      <WorkspaceMenu
        anchorEl={anchorEl}
        id={id}
        handleClose={handleMenuClose}
        open={open}
      />
    </>
  );
}
