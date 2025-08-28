import zIndex from "@mui/material/styles/zIndex";
import { borderRadius, fontSize } from "@mui/system";

const globalWindowViewerStyles = {
  '.mirador-osd-container': {
    height: '100%',
    marginTop: '0.5rem',
  },
  '.mirador-canvas-nav': {
    boxSizing: 'border-box',
    width: 'fit-content !important',
    padding: '0 1rem !important',
    right: '0.5rem',
    borderRadius: "50px !important",
    zIndex: "10000"
  },
  '.mirador-canvas-nav + .mirador-osd-container': {
    height: '100%',
    marginTop: '0'
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
    content: '"\\f12f"', // bi-arrow-left-circle F12F
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
  '.mirador-osd-container .openseadragon-container > div:nth-child(2) > div:nth-child(2)': {
    display: 'none !important', // bi-arrow-right-circle
  },
  '.mirador-osd-container.fullpage .openseadragon-container > div:nth-child(2) > div:nth-child(2)': {
    display: 'inline-block !important', 
  },
  /* Toolbar container styling */
  '.openseadragon-canvas + div': {
    borderRadius: '50px !important',
    overflow: 'hidden !important',
    margin: '0.5rem !important',
    top: "0 !important",
    display: "flex !important",
    flexDirection: "column",
    left: "calc(100% - 67px) !important",
    width: "50px",
    zIndex: '100000000'
  },

  
  /* Toolbar container styling */
  '.openseadragon-canvas + div > div': {
    boxShadow: "0px 10px 15px -3px rgba(0, 0, 0, 0.1)",
    backgroundColor: 'rgba(255, 255, 255, 0.85) !important',
  },
  /* Theme-specific overrides using parent container classes */
  '.light .openseadragon-canvas + div > div': {
    backgroundColor: 'rgba(255, 255, 255, 0.85) !important',
    boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  '.dark .openseadragon-canvas + div > div': {
    backgroundColor: 'rgba(30, 30, 30, 0.65) !important',
    boxShadow: '0 6px 18px rgba(0,0,0,0.35)'
  },
  '.light div[title="Zoom in"], .light div[title="Zoom out"], .light div[title="Go home"], .light div[title="Toggle full page"], .light div[title="Previous page"], .light div[title="Next page"], .light div[title="Rotate left"], .light div[title="Rotate right"], .light div[title="Flip Horizontally"]': {
    color: '#333',
  },
  '.dark div[title="Zoom in"], .dark div[title="Zoom out"], .dark div[title="Go home"], .dark div[title="Toggle full page"], .dark div[title="Previous page"], .dark div[title="Next page"], .dark div[title="Rotate left"], .dark div[title="Rotate right"], .dark div[title="Flip Horizontally"]': {
    color: '#e0e0e0',
  },
  '.light div[title="Zoom in"]::before, .light div[title="Zoom out"]::before, .light div[title="Go home"]::before, .light div[title="Toggle full page"]::before, .light div[title="Previous page"]::before, .light div[title="Next page"]::before, .light div[title="Flip Horizontally"]::before, .light div[title="Rotate right"]::before, .light div[title="Rotate left"]::before': {
    color: '#707070'
  },
  '.dark div[title="Zoom in"]::before, .dark div[title="Zoom out"]::before, .dark div[title="Go home"]::before, .dark div[title="Toggle full page"]::before, .dark div[title="Previous page"]::before, .dark div[title="Next page"]::before, .dark div[title="Flip Horizontally"]::before, .dark div[title="Rotate right"]::before, .dark div[title="Rotate left"]::before': {
    color: '#e0e0e0'
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
  },
  '.mirador-next-canvas-button' : {
    marginRight: "1rem !important;"
  },
  'canvas': {
    pointerEvents: "none"
  },
  '.mirador-osd-navigation i': {
    fontSize: "24px !important"
  }

};

export default globalWindowViewerStyles;
