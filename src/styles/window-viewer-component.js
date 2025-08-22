const globalWindowViewerStyles = {
  '.mirador-osd-container': {
    height: '100%',
    marginTop: '0.5rem',
  },
  '.mirador-canvas-nav': {
    boxSizing: 'border-box',
  },
  '.mirador-canvas-nav + .mirador-osd-container': {
    height: 'calc(100% - 4rem)',
  },
  '.viewer-wrap': {
    width: '100%',
  },
  '.MuiInputBase-sizeSmall': {
    paddingTop: '1px !important',
    paddingBottom: '1px !important',
  },

  /* Hide default OSD <img> icons */
  '.openseadragon-canvas + div div[title] img': {
    display: 'none !important'
  },

  /* Common toolbar button styles */
  'div[title="Zoom in"], div[title="Zoom out"], div[title="Go home"], div[title="Toggle full page"], div[title="Previous page"], div[title="Next page"], div[title="Rotate left"], div[title="Rotate right"], div[title="Flip Horizontally"]': {
    cursor: 'pointer !important',
    position: 'relative',
    height: '50px',
    width: '50px',
    backgroundColor: 'rgba(255, 255, 255, 0.85) !important',
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
    content: '"\\f64d"', // bi-zoom-in
  },
  'div[title="Zoom out"]::before': {
    content: '"\\f63b"', // bi-zoom-out
  },
  'div[title="Go home"]::before': {
    content: '"\\f425"', // bi-house
  },
  'div[title="Toggle full page"]::before': {
    content: '"\\f14a"', // bi-arrows-fullscreen
  },
  'div[title="Previous page"]::before': {
    content: '"\\f12c"', // bi-arrow-left-circle
  },
  'div[title="Next page"]::before': {
    content: '"\\f138"', // bi-arrow-right-circle
  },
  'div[title="Rotate left"]::before': {
    content: '"\\f116"', // bi-arrow-counterclockwise
  },
  'div[title="Rotate right"]::before': {
    content: '"\\f117"', // bi-arrow-clockwise
  },
  'div[title="Flip Horizontally"]::before': {
    content: '"\\f6a2"', // bi-arrow-left-right
  },

  /* Fullscreen override when active */
  '.mirador-osd-container.fullpage div[title="Toggle full page"]::before': {
    content: '"\\f149"', // bi-arrows-angle-contract
  },

  /* Toolbar container styling */
  '.openseadragon-canvas + div': {
    borderRadius: '50px !important',
    overflow: 'hidden !important',
    margin: '0.5rem !important',
    maxHeight: "50px"
  },
  
  // Common toolbar button styles
  'div[title="Zoom in"]::before, div[title="Zoom out"]::before, div[title="Go home"]::before, div[title="Toggle full page"]::before, div[title="Previous page"]::before, div[title="Next page"]::before, div[title="Flip Horizontally"]::before, div[title="Rotate right"]::before, div[title="Rotate left"]::before': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '24px',
    height: '24px',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
    background: 'center/contain no-repeat',
    color: "#707070"
  }

};

export default globalWindowViewerStyles;
