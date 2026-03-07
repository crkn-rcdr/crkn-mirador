import PropTypes from 'prop-types';
import { styled, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import BiIcon from './BiIcon';

const TOPBAR_FONT_STACK = '"Roboto", "Helvetica Neue", Arial, sans-serif';

const StyledTitleTypography = styled(TitleTypography)(({ theme }) => ({
  ...theme.typography.h6,
  flexGrow: 1,
  paddingLeft: theme.spacing(0.5),
  fontFamily: TOPBAR_FONT_STACK,
  fontWeight: 500,
  fontSize: '1rem',
  lineHeight: 1.25,
}));

/** */
function TitleTypography({ children, ...props }) {
  return (
    <Typography component="h2" variant="h6" noWrap color="inherit" {...props}>
      {children}
    </Typography>
  );
}

TitleTypography.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * WindowTopBarTitle
 */
export function WindowTopBarTitle({
  error = null, hideWindowTitle = false, isFetching = false, manifestTitle = '',
}) {
  const theme = useTheme();
  let title = null;
  if (isFetching) {
    title = (
      <StyledTitleTypography>
        <Skeleton variant="text" />
      </StyledTitleTypography>
    );
  } else if (error) {
    title = (
      <>
        <BiIcon name="exclamation-triangle" size={18} style={{ color: theme.palette.error.main, marginRight: 6 }} />
        <StyledTitleTypography color="textSecondary">
          {error}
        </StyledTitleTypography>
      </>
    );
  } else if (hideWindowTitle) {
    // When configured to hide, remove the title entirely
    return null;
  } else {
    title = (
      <StyledTitleTypography>
        {manifestTitle}
      </StyledTitleTypography>
    );
  }
  return title;
}

WindowTopBarTitle.propTypes = {
  error: PropTypes.string,
  hideWindowTitle: PropTypes.bool,
  isFetching: PropTypes.bool,
  manifestTitle: PropTypes.string,
};
