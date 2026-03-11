import { styled } from '@mui/material/styles';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import BiIcon from './BiIcon';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const StyledToggleGroup = styled(ToggleButtonGroup, { name: 'WindowViewSettings', slot: 'option' })(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1.35),
  backgroundColor: 'transparent',
  color: theme.palette.text.primary,
  border: 'none',
  borderRadius: 0,
  marginTop: 0,
  marginRight: theme.spacing(0.6),
  padding: 0,
  '& .MuiToggleButton-root': {
    margin: 0,
    minWidth: 0,
    height: 40,
    padding: 0,
    lineHeight: 1.1,
    border: 'none',
    borderRadius: 0,
    borderBottom: '1px solid transparent',
    transition: 'color 120ms ease, border-color 120ms ease, transform 60ms ease',
    color: theme.palette.text.secondary,
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing(0.55),
    whiteSpace: 'nowrap',
  },
  '& .MuiToggleButton-root:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
  },
  '& .MuiToggleButton-root:active': {
    transform: 'scale(0.98)',
  },
  '& .MuiToggleButton-root .bi': {
    fontSize: '1.2rem',
    lineHeight: 1,
    display: 'inline-block',
  },
  '& .MuiToggleButton-root .view-label': {
    fontSize: '1rem',
    lineHeight: 1.1,
    fontWeight: 400,
    color: theme.palette.text.secondary,
    letterSpacing: 0,
    textTransform: 'none',
  },
  '& .MuiToggleButton-root.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: 'transparent',
    borderBottomColor: theme.palette.primary.main,
    boxShadow: 'none',
  },
  '& .MuiToggleButton-root.Mui-selected .view-label': {
    color: theme.palette.primary.main,
    fontWeight: 500,
  },
  '& .MuiToggleButton-root.Mui-selected:hover': {
    backgroundColor: 'transparent',
  },
}));

/**
 *
 */
export function WindowViewSettings({
  handleClose = () => {}, windowViewType, viewTypes = [], setWindowViewType, windowId,
}) {
  const { t } = useTranslation();
  const handleChange = (value) => {
    if (!value || value === windowViewType) return;
    setWindowViewType(windowId, value);
    handleClose();
  };

  const iconMap = {
    book: 'book',
    scroll: 'columns',
    single: 'app',
  };

  // Only show when there are multiple view options available
  if (!Array.isArray(viewTypes) || viewTypes.length <= 1) return null;
  return (
    <StyledToggleGroup
      exclusive
      size="small"
      value={windowViewType}
      onChange={(event, value) => handleChange(value)}
      aria-label={t('windowViewMode')}
    >
      {viewTypes.map(value => (
        <ToggleButton
          key={value}
          value={value}
          aria-label={t(value)}
        >
          <BiIcon name={iconMap[value] || 'app'} size={16} />
          <span className="view-label">{t(value)}</span>
        </ToggleButton>
      ))}
    </StyledToggleGroup>
  );
}

WindowViewSettings.propTypes = {
  handleClose: PropTypes.func,
  setWindowViewType: PropTypes.func.isRequired,
  viewTypes: PropTypes.arrayOf(PropTypes.string),
  windowId: PropTypes.string.isRequired,
  windowViewType: PropTypes.string.isRequired,
};
