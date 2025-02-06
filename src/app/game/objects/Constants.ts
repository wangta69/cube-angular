import * as THREE from 'three';

export const STILL = 0;
export const PREPARING = 1;
export const ROTATING = 2;
export const ANIMATING = 3;

export const STATE = {
  Menu: 0,
  Playing: 1,
  Complete: 2,
  Stats: 3,
  Prefs: 4,
  Theme: 5,
};

export const BUTTONS = {
  Menu: [ 'stats', 'prefs' ],
  Playing: [ 'back' ],
  Complete: [],
  Stats: [],
  Prefs: [ 'back', 'theme' ],
  Theme: [ 'back', 'reset' ],
  None: [],
};

export const SHOW = true;
export const HIDE = false;

