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

export const Easing = {
  Power: {
    In: (power:number) => {
      power = Math.round( power || 1 );
      return (t:number) => Math.pow( t, power );
    },
    Out: (power:number) => {
      power = Math.round( power || 1 );
      return (t:number) => 1 - Math.abs( Math.pow( t - 1, power ) );
    },
    InOut: (power:number) => {
      power = Math.round( power || 1 );
      return (t:number) => ( t < 0.5 )
        ? Math.pow( t * 2, power ) / 2
        : ( 1 - Math.abs( Math.pow( ( t * 2 - 1 ) - 1, power ) ) ) / 2 + 0.5;
    },
  },

  Sine: {
    In: () => (t:number) => 1 + Math.sin( Math.PI / 2 * t - Math.PI / 2 ),
    Out: () => (t:number) => Math.sin( Math.PI / 2 * t ),
    InOut: () => (t:number) => ( 1 + Math.sin( Math.PI * t - Math.PI / 2 ) ) / 2,
  },

  Back: {
    Out: (s:number) => {
      s = s || 1.70158;
      return (t:number) => { return ( t -= 1 ) * t * ( ( s + 1 ) * t + s ) + 1; };
    },

    In: (s:number) => {
      s = s || 1.70158;
      return (t:number) => { return t * t * ( ( s + 1 ) * t - s ); };
    }
  },

  Elastic: {
    Out: ( amplitude:number, period:number ) => {
      let PI2 = Math.PI * 2;
      let p1 = ( amplitude >= 1 ) ? amplitude : 1;
      let p2 = ( period || 0.3 ) / ( amplitude < 1 ? amplitude : 1 );
      let p3 = p2 / PI2 * ( Math.asin( 1 / p1 ) || 0 );

      p2 = PI2 / p2;

      return (t:number) => { return p1 * Math.pow( 2, -10 * t ) * Math.sin( ( t - p3 ) * p2 ) + 1 }
    },
  },
};


export const States = {
  3: {
    checkerboard: {
      names: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 ],
      positions: [
        { "x": 1/3, "y": -1/3, "z": 1/3 },
        { "x": -1/3, "y": 1/3, "z": 0 },
        { "x": 1/3, "y": -1/3, "z": -1/3 },
        { "x": -1/3, "y": 0, "z": -1/3 },
        { "x": 1/3, "y": 0, "z": 0 },
        { "x": -1/3, "y": 0, "z": 1/3 },
        { "x": 1/3, "y": 1/3, "z": 1/3 },
        { "x": -1/3, "y": -1/3, "z": 0 },
        { "x": 1/3, "y": 1/3, "z": -1/3 },
        { "x": 0, "y": 1/3, "z": -1/3 },
        { "x": 0, "y": -1/3, "z": 0 },
        { "x": 0, "y": 1/3, "z": 1/3 },
        { "x": 0, "y": 0, "z": 1/3 },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": -1/3 },
        { "x": 0, "y": -1/3, "z": -1/3 },
        { "x": 0, "y": 1/3, "z": 0 },
        { "x": 0, "y": -1/3, "z": 1/3 },
        { "x": -1/3, "y": -1/3, "z": 1/3 },
        { "x": 1/3, "y": 1/3, "z": 0 },
        { "x": -1/3, "y": -1/3, "z": -1/3 },
        { "x": 1/3, "y": 0, "z": -1/3 },
        { "x": -1/3, "y": 0, "z": 0 },
        { "x": 1/3, "y": 0, "z": 1/3 },
        { "x": -1/3, "y": 1/3, "z": 1/3 },
        { "x": 1/3, "y": -1/3, "z": 0 },
        { "x": -1/3, "y": 1/3, "z": -1/3 }
      ],
      rotations: [
        { "x": -Math.PI, "y": 0, "z": Math.PI, },
        { "x": Math.PI, "y": 0, "z": 0 },
        { "x": -Math.PI, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": -Math.PI, "y": 0, "z": Math.PI },
        { "x": Math.PI, "y": 0, "z": 0 },
        { "x": -Math.PI, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": -Math.PI, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": Math.PI, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": -Math.PI, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": -Math.PI, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI }
      ],
      size: 3,
    },
  }
};
