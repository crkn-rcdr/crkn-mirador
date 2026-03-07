import init from './init';
import state from './state';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
export * from './state';
export * from './components';
export * from './containers';
export * from './contexts';
export * from './extend';
export * from './lib';
export * from './plugins';
export { default as settings } from './config/settings';
export { useTranslation, withTranslation } from 'react-i18next';
export { viewer } from './init';

export default {
  ...init,
  ...state,
};
