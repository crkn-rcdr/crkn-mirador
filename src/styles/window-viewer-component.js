const osdButtonSelector = [
  '.mirador-osd-container .openseadragon-container div[title="Zoom in"]',
  '.mirador-osd-container .openseadragon-container div[title="Zoom out"]',
  '.mirador-osd-container .openseadragon-container div[title="Go home"]',
  '.mirador-osd-container .openseadragon-container div[title="Toggle full page"]',
  '.mirador-osd-container .openseadragon-container div[title="Previous page"]',
  '.mirador-osd-container .openseadragon-container div[title="Next page"]',
  '.mirador-osd-container .openseadragon-container div[title="Rotate left"]',
  '.mirador-osd-container .openseadragon-container div[title="Rotate right"]',
  '.mirador-osd-container .openseadragon-container div[title="Flip Horizontally"]',
  '.mirador-osd-container .openseadragon-container div[title="Flip horizontal"]',
].join(', ');

const osdButtonIconSelector = [
  '.mirador-osd-container .openseadragon-container div[title="Zoom in"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Zoom out"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Go home"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Toggle full page"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Previous page"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Next page"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Rotate left"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Rotate right"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Flip Horizontally"]::before',
  '.mirador-osd-container .openseadragon-container div[title="Flip horizontal"]::before',
].join(', ');

const globalWindowViewerStyles = {
  '.mirador-osd-container': {
    height: '100%',
    marginTop: '0.5rem',
  },
  '.mirador-canvas-nav': {
    boxSizing: 'border-box',
    height: '52px !important',
    minHeight: '52px !important',
    width: 'fit-content !important',
    padding: '6px !important',
    overflow: 'hidden',
    right: '0.75rem',
    borderRadius: "3px !important",
    zIndex: "10000"
  },
  '#my-mirador .mirador-canvas-nav': {
    height: '52px !important',
    minHeight: '52px !important',
  },
  '.mirador-canvas-nav > div': {
    alignItems: 'center',
    boxSizing: 'border-box',
    height: '40px',
    maxHeight: '40px',
    minHeight: '40px',
    overflow: 'visible',
  },
  '.mirador-canvas-nav .MuiStack-root': {
    alignItems: 'center',
    height: '40px',
    maxHeight: '40px',
    minHeight: '40px',
  },
  '.mirador-canvas-nav .mirador-osd-navigation': {
    alignItems: 'center',
    boxSizing: 'border-box',
    display: 'inline-flex !important',
    gap: '4px',
    height: '40px',
    lineHeight: 1,
    maxHeight: '40px',
    minHeight: '40px',
    overflow: 'visible',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiIconButton-root': {
    borderRadius: '3px',
    boxSizing: 'border-box',
    flex: '0 0 40px',
    height: '40px',
    maxHeight: '40px',
    maxWidth: '40px',
    minHeight: '40px',
    minWidth: '40px',
    padding: '0 !important',
    width: '40px',
  },
  '.mirador-canvas-nav .mirador-osd-navigation i': {
    alignItems: 'center',
    display: 'flex',
    height: '24px',
    justifyContent: 'center',
    lineHeight: 1,
    width: '24px',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiAutocomplete-root': {
    flex: '0 0 100px',
    height: '40px',
    marginRight: '1rem',
    maxHeight: '40px',
    minHeight: '40px',
    width: '100px',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiFormControl-root, .mirador-canvas-nav .mirador-osd-navigation .MuiTextField-root, .mirador-canvas-nav .mirador-osd-navigation .MuiInputBase-root': {
    height: '40px',
    maxHeight: '40px',
    minHeight: '40px',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiInputBase-root': {
    alignItems: 'center',
    boxSizing: 'border-box',
    paddingBottom: '0 !important',
    paddingTop: '0 !important',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiInputBase-input': {
    boxSizing: 'border-box',
    height: '40px',
    paddingBottom: '0 !important',
    paddingTop: '0 !important',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiInputLabel-root': {
    lineHeight: 1,
    transform: 'translate(14px, -4px) scale(0.75) !important',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiInputLabel-root.MuiInputLabel-shrink': {
    transform: 'translate(14px, -4px) scale(0.75) !important',
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiOutlinedInput-notchedOutline': {
    top: 0,
  },
  '.mirador-canvas-nav .mirador-osd-navigation .MuiAutocomplete-endAdornment': {
    top: '50%',
    transform: 'translateY(-50%)',
  },
  '.mirador-canvas-nav .mirador-osd-info': {
    alignItems: 'center',
    display: 'inline-flex',
    height: '40px',
    lineHeight: 1,
    maxHeight: '40px',
    minHeight: '40px',
    paddingBottom: '0 !important',
  },
  '.mirador-canvas-nav + .mirador-osd-container': {
    height: '100%',
    marginTop: '0'
  },
  '.viewer-wrap': {
    height: '100%',
    position: 'relative',
    width: '100%',
  },
  '.MuiInputBase-sizeSmall': {
    paddingTop: '1px !important',
    paddingBottom: '1px !important',
  },

  '.mirador-osd-container .openseadragon-container': {
    touchAction: 'none',
  },

  '.mirador-osd-container .openseadragon-container canvas': {
    pointerEvents: 'none',
  },

  /* Hide default OSD <img> icons after the replacement button size is set. */
  '.mirador-osd-container .openseadragon-container div[title] img': {
    display: 'none !important',
    height: '0 !important',
    width: '0 !important',
  },

  /* Common toolbar button styles */
  [osdButtonSelector]: {
    alignItems: 'center',
    color: '#707070',
    cursor: 'pointer !important',
    display: 'flex !important',
    fontFamily: '"bootstrap-icons" !important',
    fontSize: '1.35rem',
    height: '40px',
    justifyContent: 'center',
    minHeight: '40px',
    minWidth: '40px',
    pointerEvents: 'auto !important',
    position: 'relative',
    touchAction: 'none !important',
    userSelect: 'none',
    visibility: 'visible !important',
    WebkitTapHighlightColor: 'transparent',
    width: '40px',
  },

  [`${osdButtonSelector}:hover`]: {
    color: '#707070',
  },

  [`${osdButtonSelector}:active`]: {
    transform: 'scale(0.96)',
  },

  [osdButtonIconSelector]: {
    alignItems: 'center',
    background: 'none',
    color: 'currentColor',
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    left: 0,
    lineHeight: 1,
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    transform: 'none',
    width: '100%',
  },

  /*
   * Legacy unscoped fallback for external OSD instances that may not be wrapped
   * in Mirador's viewer container.
   */
  'div[title="Zoom in"], div[title="Zoom out"], div[title="Go home"], div[title="Toggle full page"], div[title="Previous page"], div[title="Next page"], div[title="Rotate left"], div[title="Rotate right"], div[title="Flip Horizontally"], div[title="Flip horizontal"]': {
    cursor: 'pointer !important',
    position: 'relative',
    height: '50px',
    width: '50px',
    fontFamily: '"bootstrap-icons" !important',
    fontSize: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    content: '""', 
  },

  /* Individual icons via Bootstrap Icons */
  'div[title="Zoom in"]::before': {
    content: '"\\f62c"', // bi-zoom-in
  },
  'div[title="Zoom out"]::before': {
    content: '"\\f62d"', // bi-zoom-out
  },
  'div[title="Go home"]::before': {
    content: '"\\f425"', // bi-house
  },
  'div[title="Toggle full page"]::before': {
    content: '"\\f14a"', // bi-arrows-angle-expand
  },
  'div[title="Previous page"]::before': {
    content: '"\\f12f"', // bi-arrow-left-circle F12F
  },
  'div[title="Next page"]::before': {
    content: '"\\f138"', // bi-arrow-right-circle
  },
  'div[title="Rotate left"]::before': {
    content: '"\\f117"', // bi-arrow-counterclockwise
  },
  'div[title="Rotate right"]::before': {
    content: '"\\f116"', // bi-arrow-clockwise
  },
  'div[title="Flip Horizontally"]::before, div[title="Flip horizontal"]::before': {
    content: '"\\f12b"', // bi-arrow-left-right
  },
  /* Fullscreen override when active */
  '.mirador-osd-container.fullpage div[title="Toggle full page"]::before': {
    content: '"\\f149"', // bi-arrows-angle-contract
  },
  '.mirador-osd-container .openseadragon-container > div:nth-child(2) > div:nth-child(2)': {
    display: 'none !important', // bi-arrow-right-circle
  },
  '.mirador-osd-container.fullpage .openseadragon-container > div:nth-child(2) > div:nth-child(2)': {
    display: 'inline-block !important', 
  },
  /* Toolbar container styling */
  '.mirador-osd-container .openseadragon-canvas + div': {
    borderRadius: '3px !important',
    overflow: 'visible !important',
    margin: '0 !important',
    top: '23% !important',
    display: "flex !important",
    flexDirection: "column",
    left: '0.75rem !important',
    right: 'auto !important',
    transform: 'translateY(-50%)',
    width: 'auto',
    zIndex: '100000004',
    pointerEvents: 'auto !important',
  },

  
  /* Toolbar container styling */
  '.mirador-osd-container .openseadragon-canvas + div > div': {
    borderRadius: '3px !important',
    boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
    backgroundColor: 'rgba(255, 255, 255, 0.85) !important',
    display: 'flex !important',
    flexDirection: 'column',
    gap: '4px',
    overflow: 'hidden',
    padding: '6px',
    pointerEvents: 'auto !important',
  },
  /* Theme-specific overrides using parent container classes */
  '.light .mirador-osd-container .openseadragon-canvas + div > div': {
    backgroundColor: 'rgba(255, 255, 255, 0.85) !important',
    boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  '.dark .mirador-osd-container .openseadragon-canvas + div > div': {
    backgroundColor: 'rgba(30, 30, 30, 0.65) !important',
    boxShadow: '0 6px 18px rgba(0,0,0,0.35)'
  },
  '.light div[title="Zoom in"], .light div[title="Zoom out"], .light div[title="Go home"], .light div[title="Toggle full page"], .light div[title="Previous page"], .light div[title="Next page"], .light div[title="Rotate left"], .light div[title="Rotate right"], .light div[title="Flip Horizontally"], .light div[title="Flip horizontal"]': {
    color: '#707070',
  },
  '.dark div[title="Zoom in"], .dark div[title="Zoom out"], .dark div[title="Go home"], .dark div[title="Toggle full page"], .dark div[title="Previous page"], .dark div[title="Next page"], .dark div[title="Rotate left"], .dark div[title="Rotate right"], .dark div[title="Flip Horizontally"], .dark div[title="Flip horizontal"]': {
    color: '#e0e0e0',
  },
  '.light div[title="Zoom in"]::before, .light div[title="Zoom out"]::before, .light div[title="Go home"]::before, .light div[title="Toggle full page"]::before, .light div[title="Previous page"]::before, .light div[title="Next page"]::before, .light div[title="Flip Horizontally"]::before, .light div[title="Flip horizontal"]::before, .light div[title="Rotate right"]::before, .light div[title="Rotate left"]::before': {
    color: '#707070'
  },
  '.dark div[title="Zoom in"]::before, .dark div[title="Zoom out"]::before, .dark div[title="Go home"]::before, .dark div[title="Toggle full page"]::before, .dark div[title="Previous page"]::before, .dark div[title="Next page"]::before, .dark div[title="Flip Horizontally"]::before, .dark div[title="Flip horizontal"]::before, .dark div[title="Rotate right"]::before, .dark div[title="Rotate left"]::before': {
    color: '#e0e0e0'
  },
  
  // Common toolbar button styles
  'div[title="Zoom in"]::before, div[title="Zoom out"]::before, div[title="Go home"]::before, div[title="Toggle full page"]::before, div[title="Previous page"]::before, div[title="Next page"]::before, div[title="Flip Horizontally"]::before, div[title="Flip horizontal"]::before, div[title="Rotate right"]::before, div[title="Rotate left"]::before': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '24px',
    height: '24px',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    background: 'center/contain no-repeat',
    color: "#707070"
  },
  '.mirador-next-canvas-button' : {
    marginRight: "1rem !important;"
  },
  '@media (pointer: coarse)': {
    '.mirador-canvas-nav': {
      height: '56px !important',
      right: 'max(0.5rem, env(safe-area-inset-right)) !important',
    },
    '.mirador-canvas-nav > div, .mirador-canvas-nav .MuiStack-root, .mirador-canvas-nav .mirador-osd-navigation, .mirador-canvas-nav .mirador-osd-info': {
      height: '44px',
      maxHeight: '44px',
      minHeight: '44px',
    },
    '.mirador-canvas-nav .mirador-osd-navigation .MuiIconButton-root': {
      flexBasis: '44px',
      height: '44px',
      maxHeight: '44px',
      maxWidth: '44px',
      minHeight: '44px',
      minWidth: '44px',
      width: '44px',
    },
    '.mirador-canvas-nav .mirador-osd-navigation .MuiAutocomplete-root, .mirador-canvas-nav .mirador-osd-navigation .MuiFormControl-root, .mirador-canvas-nav .mirador-osd-navigation .MuiTextField-root, .mirador-canvas-nav .mirador-osd-navigation .MuiInputBase-root, .mirador-canvas-nav .mirador-osd-navigation .MuiInputBase-input': {
      height: '44px',
      maxHeight: '44px',
      minHeight: '44px',
    },
    '.mirador-osd-container .openseadragon-canvas + div': {
      left: 'max(0.5rem, env(safe-area-inset-left)) !important',
      right: 'auto !important',
      top: '23% !important',
      width: 'auto',
      zIndex: '100000004',
    },
    [osdButtonSelector]: {
      height: '44px',
      minHeight: '44px',
      minWidth: '44px',
      width: '44px',
    },
  },
};

export default globalWindowViewerStyles;
