import { Component } from 'react';
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/LockSharp';
import SanitizedHtml from '../containers/SanitizedHtml';
import { PluginHook } from './PluginHook';

const StyledTopBar = styled('div')(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
  },
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'inherit',
  padding: theme.spacing(1),
  textTransform: 'none',
}));

const StyledFauxButton = styled('span')(({ theme }) => ({
  marginLeft: theme.spacing(2.5),
}));
/** */
export class WindowAuthenticationBar extends Component {
  /** */
  constructor(props) {
    super(props);

    this.state = { open: false };
    this.setOpen = this.setOpen.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  /** */
  onSubmit() {
    const { onConfirm } = this.props;
    this.setOpen(false);
    onConfirm();
  }

  /** Toggle the full description */
  setOpen(open) {
    this.setState(state => ({ ...state, open }));
  }

  /** */
  render() {
    const {
      confirmButton, continueLabel,
      header, description, icon, label, t,
      ruleSet, hasLogoutService, status, ConfirmProps,
    } = this.props;

    if (status === 'ok' && !hasLogoutService) return null;

    const { open } = this.state;

    const button = (
      <Button
        onClick={this.onSubmit}
        sx={theme => ({
          '&:hover': {
            backgroundColor: alpha(theme.palette.secondary.contrastText, 1 - theme.palette.action.hoverOpacity),
          },
          backgroundColor: theme.palette.secondary.contrastText,
          marginLeft: theme.spacing(5),
          paddingBottom: 0,
          paddingTop: 0,
        })}
        color="secondary"
        {...ConfirmProps}
      >
        {confirmButton || t('login')}
      </Button>
    );

    if (!description && !header) {
      return (
        <Paper
          square
          elevation={4}
          color="secondary"
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
              cursor: 'pointer',
            },
          }}
        >
          <StyledTopBar>
            { icon || (
            <LockIcon
              sx={{
                marginRight: 1.5,
                verticalAlign: 'text-bottom',
              }}
            />
            ) }
            <Typography sx={{ lineHeight: 2.25 }} component="h3" variant="body1" color="inherit">
              { ruleSet ? <SanitizedHtml htmlString={label} ruleSet={ruleSet} /> : label }
            </Typography>
            <PluginHook {...this.props} />
            { button }
          </StyledTopBar>
        </Paper>
      );
    }

    return (
      <Paper
        square
        elevation={4}
        color="secondary"
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: 'secondary.main',
            color: 'secondary.contrastText',
            cursor: 'pointer',
          },
        }}
      >
        <Button
          fullWidth
          sx={theme => ({
            '&:hover': {
              backgroundColor: theme.palette.secondary.main,
            },
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'inherit',
            padding: theme.spacing(1),
            textTransform: 'none',
          })}
          onClick={() => this.setOpen(true)}
          component="div"
          color="inherit"
        >
          { icon || (
          <LockIcon sx={{
            marginRight: 1.5,
            verticalAlign: 'text-bottom',
          }}
          />
          ) }
          <Typography sx={{ lineHeight: 2.25 }} component="h3" variant="body1" color="inherit">
            { ruleSet ? <SanitizedHtml htmlString={label} ruleSet={ruleSet} /> : label }
          </Typography>
          <PluginHook {...this.props} />
          <StyledFauxButton>
            { !open && (
              <Typography variant="button" color="inherit">
                { continueLabel || t('continue') }
              </Typography>
            )}
          </StyledFauxButton>
        </Button>
        <Collapse
          in={open}
          onClose={() => this.setOpen(false)}
        >
          <Typography variant="body1" color="inherit">
            { ruleSet ? <SanitizedHtml htmlString={header} ruleSet={ruleSet} /> : header }
            { header && description ? ': ' : '' }
            { ruleSet ? <SanitizedHtml htmlString={description} ruleSet={ruleSet} /> : description }
          </Typography>
          <DialogActions>
            <Button onClick={() => this.setOpen(false)} color="inherit">
              { t('cancel') }
            </Button>

            { button }
          </DialogActions>
        </Collapse>
      </Paper>
    );
  }
}

WindowAuthenticationBar.propTypes = {
  confirmButton: PropTypes.string,
  ConfirmProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  continueLabel: PropTypes.string,
  description: PropTypes.node,
  hasLogoutService: PropTypes.bool,
  header: PropTypes.node,
  icon: PropTypes.node,
  label: PropTypes.node.isRequired,
  onConfirm: PropTypes.func.isRequired,
  ruleSet: PropTypes.string,
  status: PropTypes.string,
  t: PropTypes.func,
};

WindowAuthenticationBar.defaultProps = {
  confirmButton: undefined,
  ConfirmProps: {},
  continueLabel: undefined,
  description: undefined,
  hasLogoutService: true,
  header: undefined,
  icon: undefined,
  ruleSet: 'iiif',
  status: undefined,
  t: k => k,
};
