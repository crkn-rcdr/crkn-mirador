import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Tooltip from '@mui/material/Tooltip';
import BiIcon from './BiIcon';
import { useTranslation } from 'react-i18next';

const Root = styled(Tabs, { name: 'WindowSideBarButtons', slot: 'root' })({
  '& .MuiTabs-flexContainer': {
    flexDirection: 'column',
  },
  '&.MuiTabs-indicator': {
    display: 'none',
  },
});

const StyledTabButton = styled(Tab, { name: 'WindowSideBarButtons', slot: 'button' })(({ theme }) => ({
  '&.Mui-selected': {
    borderRight: '2px solid',
    borderRightColor: theme.palette.primary.main,
  },
  '&.MuiTab-root': {
    '&:active': {
      backgroundColor: theme.palette.action.active,
    },
    '&:focus': {
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
      backgroundColor: theme.palette.action.hover,
      textDecoration: 'none',
      // Reset on touch devices, it doesn't add specificity
    },
    '&:hover': {
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
      backgroundColor: theme.palette.action.hover,
      textDecoration: 'none',
      // Reset on touch devices, it doesn't add specificity
    },
    borderRight: '2px solid transparent',
    minWidth: 'auto',
  },
  fill: 'currentcolor',
}));

/** */
function TabButton({ value, ...tabProps }) {
  const { t } = useTranslation();
  return (
    <Tooltip title={t('openCompanionWindow', { context: value })}>
      <StyledTabButton
        {...tabProps}
        value={value}
        aria-label={
          t('openCompanionWindow', { context: value })
        }
        disableRipple
      />
    </Tooltip>
  );
}

TabButton.propTypes = {
  value: PropTypes.string.isRequired,
};

/**
 *
 */
export function WindowSideBarButtons({
  addCompanionWindow,
  hasAnnotations = false,
  hasAnyAnnotations = false,
  hasAnyLayers = false,
  hasCurrentLayers = false,
  hasSearchResults = false,
  hasSearchService = false,
  panels = [],
  PluginComponents = null,
  sideBarPanel = 'closed',
}) {
  const { t } = useTranslation();
  /** */
  const handleChange = (event, value) => { addCompanionWindow(value); };

  return (
    <Root
      value={sideBarPanel === 'closed' ? false : sideBarPanel}
      onChange={handleChange}
      variant="fullWidth"
      indicatorColor="primary"
      textColor="primary"
      orientation="vertical"
      aria-orientation="vertical"
      aria-label={t('sidebarPanelsNavigation')}
    >
      { panels.info && (
        <TabButton
          value="info"
          icon={(<BiIcon name="info-square" size={18} />)}
        />
      )}
      { panels.attribution && (
        <TabButton
          value="attribution"
          icon={(<BiIcon name="c-square" size={18} />)}
        />
      )}
      { panels.canvas && (
        <TabButton
          value="canvas"
          icon={(<BiIcon name="list-nested" size={18} />)}
        />
      )}
      {panels.annotations && (hasAnnotations || hasAnyAnnotations) && (
        <TabButton
          value="annotations"
          icon={(
            <Badge overlap="rectangular" color="notification" invisible={!hasAnnotations} variant="dot">
              <BiIcon name="chat-dots" size={18} />
            </Badge>
          )}
        />
      )}
      {panels.search && hasSearchService && (
        <TabButton
          value="search"
          icon={(
            <Badge overlap="rectangular" color="notification" invisible={!hasSearchResults} variant="dot">
              <BiIcon name="search" size={18} />
            </Badge>
          )}
        />
      )}
      { panels.layers && hasAnyLayers && (
        <TabButton
          value="layers"
          icon={(
            <Badge overlap="rectangular" color="notification" invisible={!hasCurrentLayers} variant="dot">
              <BiIcon name="layers" size={18} />
            </Badge>
          )}
        />
      )}
      { PluginComponents
        && PluginComponents.map(PluginComponent => (
          <TabButton
            key={PluginComponent.value}
            value={PluginComponent.value}
            icon={<PluginComponent />}
          />
        ))}
    </Root>
  );
}

WindowSideBarButtons.propTypes = {
  addCompanionWindow: PropTypes.func.isRequired,
  hasAnnotations: PropTypes.bool,
  hasAnyAnnotations: PropTypes.bool,
  hasAnyLayers: PropTypes.bool,
  hasCurrentLayers: PropTypes.bool,
  hasSearchResults: PropTypes.bool,
  hasSearchService: PropTypes.bool,
  panels: PropTypes.objectOf(PropTypes.bool),
  PluginComponents: PropTypes.array, // eslint-disable-line react/forbid-prop-types
  sideBarPanel: PropTypes.string,
};
