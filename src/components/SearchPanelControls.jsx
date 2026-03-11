import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import deburr from 'lodash/deburr';
import isObject from 'lodash/isObject';
import { useDebouncedCallback } from 'use-debounce';
import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import BiIcon from './BiIcon';
import { useTranslation } from 'react-i18next';
import MiradorMenuButton from '../containers/MiradorMenuButton';
import SearchPanelNavigation from '../containers/SearchPanelNavigation';

const StyledForm = styled('form', { name: 'SearchPanelControls', slot: 'form' })(({ theme }) => ({
  paddingBottom: theme.spacing(1),
  paddingRight: theme.spacing(1.5),
  width: '100%',
}));

const UnavailableNote = styled(Typography, { name: 'SearchPanelControls', slot: 'unavailableNote' })(({ theme }) => ({
  ...theme.typography.h6,
  alignItems: 'center',
  color: theme.palette.text.secondary,
  cursor: 'default',
  display: 'flex',
  fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
  fontSize: '1rem',
  fontWeight: 500,
  letterSpacing: 0,
  lineHeight: 1.25,
  minHeight: 40,
  overflow: 'hidden',
  padding: theme.spacing(0, 0.5),
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.92rem',
  },
}));

/** Sometimes an autocomplete match can be a simple string, other times an object
    with a `match` property, this function abstracts that away */
const getMatch = (option) => (isObject(option) ? option.match : option);

/** */
export function SearchPanelControls({
  autocompleteService = undefined, companionWindowId, fetchSearch, query = '',
  searchIsFetching = false, searchService, windowId, showUnavailableMessage = false,
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState(query);
  const [search, setSearch] = useState(query);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setInput(query);
    setSearch(query);
    setSuggestions([]);
  }, [query]);

  useEffect(() => {
    // Avoid firing a duplicate search when the query prop seeds local state
    // (e.g., from defaultSearchQuery/contentSearch). Only fetch when the
    // local search differs from the current query in state, or when a user
    // explicitly enters a new value via the UI.
    if (search && search !== '' && searchService && search !== query) {
      fetchSearch(
        windowId,
        companionWindowId,
        `${searchService.id}?${new URLSearchParams({ q: search })}`,
        search,
      );
    }
  }, [search, query, searchService, companionWindowId, fetchSearch, windowId]);

  /** */
  const handleChange = (event, value, reason) => {
    // For some reason the value gets reset to an empty value from the
    // useAutocomplete hook sometimes, we just ignore these cases
    if (reason === 'reset' && !value) {
      return;
    }
    setInput(value);
    setSuggestions([]);

    if (value) {
      fetchAutocomplete(value);
    }
  };

  /** */
  const fetchAutocomplete = useDebouncedCallback(useCallback(() => {
    if (!autocompleteService) return;
    if (!input) return;

    fetch(`${autocompleteService.id}?${new URLSearchParams({ q: input })}`)
      .then(response => response.json())
      .then(receiveAutocomplete);
  }, [autocompleteService, input]), 500);

  /** */
  const receiveAutocomplete = (json) => {
    setSuggestions(json.terms);
  };

  /** */
  const submitSearch = (event) => {
    if (!input) return;

    if (event) {
      event.preventDefault();
    }

    setSearch(input);
  };

  /** */
  const selectItem = (_event, selectedItem, _reason) => {
    if (selectedItem && getMatch(selectedItem)) {
      setSearch(getMatch(selectedItem));
    }
  };

  const id = `search-${companionWindowId}`;

  if (showUnavailableMessage) {
    return (
      <StyledForm
        aria-label={t('searchTitle')}
        onSubmit={event => event.preventDefault()}
      >
        <UnavailableNote component="div" variant="h6" noWrap aria-label={t('searchUnavailable')}>
          {t('searchUnavailable')}
        </UnavailableNote>
      </StyledForm>
    );
  }

  return (
    <>
      <StyledForm
        aria-label={t('searchTitle')}
        onSubmit={submitSearch}
      >
        <Autocomplete
          id={id}
          inputValue={input}
          options={suggestions}
          getOptionLabel={getMatch}
          isOptionEqualToValue={(option, value) => (
            deburr(getMatch(option).trim()).toLowerCase()
            === deburr(getMatch(value).trim()).toLowerCase()
          )}
          noOptionsText=""
          onChange={selectItem}
          onInputChange={handleChange}
          freeSolo
          disableClearable
          sx={{ width: '100%' }}
          renderInput={params => (
            <TextField
              {...params}
              label={t('searchInputLabel')}
              variant="standard"
              InputLabelProps={{
                ...(params.InputLabelProps || {}),
                sx: {
                  ...((params.InputLabelProps && params.InputLabelProps.sx) || {}),
                  fontSize: '14px',
                  '&.MuiInputLabel-shrink': {
                    fontSize: '14px',
                    transform: 'translate(0, 6px) scale(0.85)',
                    transformOrigin: 'left top',
                  },
                },
              }}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment sx={{ position: 'relative' }} position="end">
                    <MiradorMenuButton aria-label={t('searchSubmitAria')} type="submit">
                      <BiIcon name="search" size={16} />
                    </MiradorMenuButton>
                    {Boolean(searchIsFetching) && (
                    <CircularProgress
                      sx={{
                        left: '50%',
                        marginLeft: '-25px',
                        marginTop: '-25px',
                        position: 'absolute',
                        top: '50%',
                      }}
                      size={50}
                    />
                    )}
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </StyledForm>
      <SearchPanelNavigation windowId={windowId} companionWindowId={companionWindowId} />
    </>
  );
}

SearchPanelControls.propTypes = {
  autocompleteService: PropTypes.shape({
    id: PropTypes.string,
  }),
  companionWindowId: PropTypes.string.isRequired,
  fetchSearch: PropTypes.func.isRequired,
  query: PropTypes.string,
  searchIsFetching: PropTypes.bool,
  searchService: PropTypes.shape({
    id: PropTypes.string,
  }),
  showUnavailableMessage: PropTypes.bool,
  windowId: PropTypes.string.isRequired,
};
