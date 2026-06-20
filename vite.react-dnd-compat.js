const reactDndConnectorPath = /[\\/]react-dnd[\\/]dist[\\/]internals[\\/]wrapConnectorHooks\.js$/;
const reactImport = "import { cloneElement, isValidElement } from 'react';";
const react19Import = "import { cloneElement, isValidElement, version as reactVersion } from 'react';";
const previousRefSource = 'const previousRef = element.ref;';
const previousRefCompatSource = [
  'const previousRef = Number.parseInt(reactVersion, 10) >= 19',
  ' ? element.props.ref : element.ref;',
].join('');

/**
 * Patch react-dnd's element ref access during Vite builds for React 19.
 */
export function reactDndReact19RefCompat() {
  return {
    enforce: 'pre',
    name: 'react-dnd-react-19-ref-compat',
    /** */
    transform(code, id) {
      if (!reactDndConnectorPath.test(id)) return null;

      return {
        code: code
          .replace(reactImport, react19Import)
          .replace(previousRefSource, previousRefCompatSource),
        map: null,
      };
    },
  };
}
