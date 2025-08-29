import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListSubheader from '@mui/material/ListSubheader';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import BiIcon from './BiIcon';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
// Replaced custom/MUI icons with Bootstrap Icons

const ThumbnailOption = styled(MenuItem, { name: 'WindowThumbnailSettings', slot: 'option' })(({ selected, theme }) => ({
  '& .MuiFormControlLabel-label': {
    borderBottom: '2px solid transparent',
    ...(selected && {
      borderBottomColor: theme.palette.secondary.main,
    }),
    '&.Mui-selected': {
      backgroundColor: 'transparent !important',
    },
    '&.Mui-selected.Mui-focusVisible': {
      backgroundColor: `${(theme.vars || theme).palette.action.focus} !important`,
    },
    '&:focused': {
      backgroundColor: `${(theme.vars || theme).palette.action.focus} !important`,
    },
    color: selected ? theme.palette.secondary.main : undefined,
    display: 'inline-flex',
  },
}));

const StyledMenuList = styled(MenuList, { name: 'WindowViewSettings', slot: 'option' })(() => ({
  display: 'inline-flex',
}));
/**
 *
 */
export function WindowThumbnailSettings({
  handleClose = () => {}, thumbnailNavigationPosition, direction, windowId, setWindowThumbnailPosition,
}) {
  const { t } = useTranslation();
  /** */
  const handleChange = (value) => { setWindowThumbnailPosition(windowId, value); handleClose(); };

  return (
    <>
      <StyledMenuList role="menubar">
        <ThumbnailOption
          aria-checked={thumbnailNavigationPosition === 'off'}
          key="off"
          onClick={() => { handleChange('off'); }}
          role="menuitemradio"
          selected={thumbnailNavigationPosition === 'off'}
        >
          <FormControlLabel
            control={(
              <BiIcon name="square" size={18} />
            )}
            labelPlacement="bottom"
            value="off"
          />
        </ThumbnailOption>
        <ThumbnailOption
          aria-checked={thumbnailNavigationPosition === 'far-bottom'}
          key="far-bottom"
          onClick={() => { handleChange('far-bottom'); }}
          role="menuitemradio"
          selected={thumbnailNavigationPosition === 'far-bottom'}
        >
          <FormControlLabel
            control={(
              <BiIcon name="layout-split" size={18} />
            )}
            labelPlacement="bottom"
            value="far-bottom"
          />
        </ThumbnailOption>
        <ThumbnailOption
          aria-checked={thumbnailNavigationPosition === 'far-right'}
          key="far-right"
          onClick={() => { handleChange('far-right'); }}
          role="menuitemradio"
          selected={thumbnailNavigationPosition === 'far-right'}
        >
          <FormControlLabel
            control={(
              <BiIcon name={direction === 'rtl' ? 'layout-sidebar' : 'layout-sidebar-reverse'} size={18} />
            )}
            labelPlacement="bottom"
            value="far-right"
          />
        </ThumbnailOption>
      </StyledMenuList>
    </>

  );
}

/**
 * 
            label={t('off')}
            label={t('right')}
            label={t('bottom')}
 */

WindowThumbnailSettings.propTypes = {
  direction: PropTypes.string.isRequired,
  handleClose: PropTypes.func,
  setWindowThumbnailPosition: PropTypes.func.isRequired,
  thumbnailNavigationPosition: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
};
