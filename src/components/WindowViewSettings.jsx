import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import ListSubheader from '@mui/material/ListSubheader';
import SingleIcon from '@mui/icons-material/CropOriginalSharp';
import ScrollViewIcon from '@mui/icons-material/ViewColumn';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import BookViewIcon from './icons/BookViewIcon';
import GalleryViewIcon from './icons/GalleryViewIcon';

const ViewOption = styled(MenuItem, { name: 'WindowViewSettings', slot: 'option' })(({ selected, theme }) => ({
  borderRadius: 50,
  margin: 0,
  minHeight: 28,
  padding: '2px 8px',
  lineHeight: 1,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: `${(theme.vars || theme).palette.action.selected} !important`,
    color: theme.palette.text.primary,
  },
  '& .MuiFormControlLabel-root': {
    margin: 0,
    alignItems: 'center',
    '& svg': { width: 18, height: 18 },
  },
  '& .MuiFormControlLabel-label': {
    display: 'none', // no text label to match pill toggles
  },
}));

const StyledMenuList = styled(MenuList, { name: 'WindowViewSettings', slot: 'option' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  background: '#fff',
  color: theme.palette.text.primary,
  borderRadius: 50,
  boxShadow: theme.shadows[2],
  padding: 6,
}));

/**
 *
 */
export function WindowViewSettings({
  handleClose = () => {}, windowViewType, viewTypes = [], setWindowViewType, windowId,
}) {
  const { t } = useTranslation();
  /** */
  const handleChange = (value) => {
    setWindowViewType(windowId, value);
  };

  const iconMap = {
    book: BookViewIcon,
    scroll: ScrollViewIcon,
    single: SingleIcon,
  };

  /** Suspiciously similar to a component, yet if it is invoked through JSX
      none of the click handlers work? 
              label={t(value)}*/
  const menuItem = ({ value, Icon }) => (
    <ViewOption
      aria-checked={windowViewType === value}
      autoFocus={windowViewType === value}
      key={value}
      onClick={() => { handleChange(value); handleClose(); }}
      role="menuitemradio"
      selected={windowViewType === value}
    >
      <FormControlLabel
        value={value}
        control={<Icon fill="currentcolor" color={windowViewType === value ? 'secondary' : undefined} />}
        labelPlacement="bottom"
      />
    </ViewOption>
  );

  // Only show when there are multiple view options available
  if (!Array.isArray(viewTypes) || viewTypes.length <= 1) return null;
  return (
    <>
      <StyledMenuList role="menubar">
        { viewTypes.map(value => menuItem({ Icon: iconMap[value], value })) }
      </StyledMenuList>
    </>
  );
}

WindowViewSettings.propTypes = {
  handleClose: PropTypes.func,
  setWindowViewType: PropTypes.func.isRequired,
  viewTypes: PropTypes.arrayOf(PropTypes.string),
  windowId: PropTypes.string.isRequired,
  windowViewType: PropTypes.string.isRequired,
};
