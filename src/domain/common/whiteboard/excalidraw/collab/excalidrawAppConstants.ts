/**
 * Constants and enums that are supposed to be exported by Excalidraw but Vite cannot see
 */
export enum EVENT {
  COPY = 'copy',
  PASTE = 'paste',
  CUT = 'cut',
  KEYDOWN = 'keydown',
  KEYUP = 'keyup',
  MOUSE_MOVE = 'mousemove',
  RESIZE = 'resize',
  UNLOAD = 'unload',
  FOCUS = 'focus',
  BLUR = 'blur',
  DRAG_OVER = 'dragover',
  DROP = 'drop',
  GESTURE_END = 'gestureend',
  BEFORE_UNLOAD = 'beforeunload',
  GESTURE_START = 'gesturestart',
  GESTURE_CHANGE = 'gesturechange',
  POINTER_MOVE = 'pointermove',
  POINTER_DOWN = 'pointerdown',
  POINTER_UP = 'pointerup',
  STATE_CHANGE = 'statechange',
  WHEEL = 'wheel',
  TOUCH_START = 'touchstart',
  TOUCH_END = 'touchend',
  HASHCHANGE = 'hashchange',
  VISIBILITY_CHANGE = 'visibilitychange',
  SCROLL = 'scroll',
  // custom events
  EXCALIDRAW_LINK = 'excalidraw-link',
  MENU_ITEM_SELECT = 'menu.itemSelect',
}
export const PRECEDING_ELEMENT_KEY = '__precedingElement__';

export const IDLE_THRESHOLD = 60_000;
export const ACTIVE_THRESHOLD = 3_000;

// time constants (ms)
export const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;
export const INITIAL_SCENE_UPDATE_TIMEOUT = 5000;
export const FILE_UPLOAD_TIMEOUT = 300;
export const LOAD_IMAGES_TIMEOUT = 500;
export const SYNC_FULL_SCENE_INTERVAL_MS = 20000;
export const SYNC_BROWSER_TABS_TIMEOUT = 50;
export const CURSOR_SYNC_TIMEOUT = 33; // ~30fps
export const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day

// 1 year (https://stackoverflow.com/a/25201898/927631)
export const FILE_CACHE_MAX_AGE_SEC = 31536000;

export const WS_EVENTS = {
  SERVER_VOLATILE: 'server-volatile-broadcast',
  SERVER: 'server-broadcast',
  SERVER_REQUEST_BROADCAST: 'server-request-broadcast',
};

export enum WS_SCENE_EVENT_TYPES {
  INIT = 'SCENE_INIT',
  UPDATE = 'SCENE_UPDATE',
}

export const ROOM_ID_BYTES = 10;

export const STORAGE_KEYS = {
  LOCAL_STORAGE_ELEMENTS: 'excalidraw',
  LOCAL_STORAGE_APP_STATE: 'excalidraw-state',
  LOCAL_STORAGE_COLLAB: 'excalidraw-collab',
  LOCAL_STORAGE_LIBRARY: 'excalidraw-library',
  LOCAL_STORAGE_THEME: 'excalidraw-theme',
  VERSION_DATA_STATE: 'version-dataState',
  VERSION_FILES: 'version-files',
} as const;

export const COOKIES = {
  AUTH_STATE_COOKIE: 'excplus-auth',
} as const;

export const isExcalidrawPlusSignedUser = document.cookie.includes(COOKIES.AUTH_STATE_COOKIE);
