import { Component,OnInit,AfterViewInit,ViewChild,ElementRef, NO_ERRORS_SCHEMA } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatSliderModule} from '@angular/material/slider';

import * as THREE from 'three';
import {SHOW, HIDE, STATE, BUTTONS, States} from './objects/Constants';
import {World} from './objects/World';
import {Cube} from './objects/Cube';
import {Controls} from './objects/Controls';
import {Scrambler} from './objects/Scrambler';
import {Transition} from './objects/Transition';
import {Timer} from './objects/Timer';
import {Preferences} from './objects/Preferences';
import {Scores} from './objects/Scores';
import {Storage} from './objects/Storage';
import {Confetti} from './objects/Confetti';
import {Themes} from './objects/Themes';
import {ThemeEditor} from './objects/ThemeEditor';

@Component({
  selector: 'app-root',
  schemas: [NO_ERRORS_SCHEMA],
  imports: [MatIconModule, MatSliderModule],
  templateUrl: './game.html',
  styleUrls: ['./game.scss']
})
export class GameComponent implements OnInit, AfterViewInit{

  //THREEJS RELATED VARIABLES
  // public scene: any;
  // public camera: any;
  // public renderer: any;
  private dom: any;


  private world!:World;
  private cube!:Cube;
  private controls!:Controls;
  private scrambler!:Scrambler;
  private transition!:Transition;
  private timer!:Timer;
  private preferences!:Preferences;
  private scores!:Scores;
  private storage!:Storage;
  private confetti!:Confetti;
  public themes!:Themes;
  private themeEditor!:ThemeEditor;



  private state = STATE.Menu;
  public playing = false;
  private newGame = false;
  private saved = false;

  private bestTime=false;
  private tappedTwice = false;

  // private disabled = false;
  // private max = 100;
  // private min = 0;
  // private showTicks = false;
  // private step = 1;
  // private thumbLabel = false;
  // private value = 0;

  constructor() {
    this.storage = new Storage( this );
    this.storage.init();
  }
  

  ngOnInit() {

  }

  // public dragEnd(ev: any) {

  // }

  // public dragStart(ev: any) {

  // }

  // public valueChange(ev: any) {

  // }
  ngAfterViewInit() {

    this.dom = {
      ui: document.querySelector( '.ui' ),
      game: document.querySelector( '.ui .game' ),
      back: document.querySelector( '.ui .background' ),
      prefs: document.querySelector( '.ui .prefs' ),
      theme: document.querySelector( '.ui .theme' ),
      stats: document.querySelector( '.ui .stats' ),
      texts: {
        title: document.querySelector( '.texts .title' ),
        note: document.querySelector( '.texts .note' ),
        timer: document.querySelector( '.texts .timer' ),
        complete: document.querySelector( '.texts .complete' ),
        best: document.querySelector( '.texts .best-time' ),
        theme: document.querySelector( '.texts .theme' ),
      },
      buttons: {
        prefs: document.querySelector( '.btn-prefs' ),
        back: document.querySelector( '.btn-back' ),
        stats: document.querySelector( '.btn-stats' ),
        reset: document.querySelector( '.btn-reset' ),
        theme: document.querySelector( '.btn-theme' ),
      },
    };

   
    // this.convertRange();
    window.addEventListener( 'touchmove', () => {} );
    document.addEventListener( 'touchmove',  event => { event.preventDefault(); }, { passive: false } );

    this.create();

  }

  private create() {
    this.world = new World( this );

    this.cube = new Cube( this );
    this.controls = new Controls( this );
    this.scrambler = new Scrambler( this );
    this.transition = new Transition( this );
    this.timer = new Timer( this );
    this.preferences = new Preferences( this );
    this.scores = new Scores( this );

    this.confetti = new Confetti( this );
    this.themes = new Themes( this );
    this.themeEditor = new ThemeEditor( this );

    this.initActions();

    this.state = STATE.Menu;
    this.newGame = false;
    this.saved = false;

    
    this.cube.init();
    this.themes.setTheme(this.storage.theme);
    
    this.preferences.init();
    
    this.transition.init();
    

    this.storage.loadGame();
    this.scores.calcStats();

    setTimeout( () => {

      this.transition.float();
      this.transition.cube( SHOW );

      setTimeout( () => this.transition.title( SHOW ), 700 );
      setTimeout( () => this.transition.buttons( BUTTONS.Menu, BUTTONS.None ), 1000 );

    }, 500 );

  }

  private initActions() {
    this.controls.onMove = () => {
      if ( this.newGame ) {
        this.timer._start( true );
        this.newGame = false;
      }
    };

    this.controls.onSolved = () => this.complete( SHOW );
  }

  public onclick_game() {
    if ( this.transition.activeTransitions > 0 ) return;
    if ( this.state === STATE.Playing ) return;

    if ( this.state === STATE.Menu ) {
      if ( ! this.tappedTwice ) {
        this.tappedTwice = true;
        setTimeout( () => this.tappedTwice = false, 300 );
        return false;
      }

      this.game( SHOW );
    } else if ( this.state === STATE.Complete ) {
      this.complete( HIDE );

    } else if ( this.state === STATE.Stats ) {
      this.stats( HIDE );
    } 
    return;
  }

  public onclick_back() {
    if ( this.transition.activeTransitions > 0 ) return;

    switch(this.state) {
      case STATE.Playing: this.game( HIDE ); break;
      case STATE.Prefs: this.prefs( HIDE ); break;
      case STATE.Theme: this.theme( HIDE ); break;
    }
  }

  public onclick_reset() {
    if ( this.state === STATE.Theme ) {
      this.themeEditor.resetTheme();
    }
  }

  public onclick_prefs() {
    this.prefs( SHOW );
  }

  public onclick_theme() {
    this.theme( SHOW );
  }

  public onclick_stats() {
    this.stats( SHOW );
  }


  // this.dom.buttons.prefs.onclick = (event:any) => this.prefs( SHOW );
  //   this.dom.buttons.theme.onclick = (event:any) => this.theme( SHOW );
  //   this.dom.buttons.stats.onclick = (event:any) => this.stats( SHOW );

  private game( show:boolean ) {
    if ( show ) {
      if ( ! this.saved ) {

        
        this.scrambler.scramble();
        // 각각의 조각의 layer로 섞는다.
        this.controls.scrambleCube();
        this.newGame = true;
        
      }

      const duration = this.saved ? 0 :
      this.scrambler.converted.length * ( this.controls.flipSpeeds[0] + 10 );

      this.state = STATE.Playing;
      this.saved = true;

      this.transition.buttons( BUTTONS.None, BUTTONS.Menu );

      this.transition.zoom( STATE.Playing, duration );
      this.transition.title( HIDE );

      setTimeout( () => {

        this.transition.timer( SHOW );
        this.transition.buttons( BUTTONS.Playing, BUTTONS.None );

      }, this.transition.durations.zoom - 1000 );

      setTimeout( () => {
        this.controls.enable();
        if ( ! this.newGame ) this.timer._start( true );

      }, this.transition.durations.zoom );

    } else {

      this.state = STATE.Menu;

      this.transition.buttons( BUTTONS.Menu, BUTTONS.Playing );

      this.transition.zoom( STATE.Menu, 0 );

      this.controls.disable();
      if ( ! this.newGame ) this.timer._stop();
      this.transition.timer( HIDE );

      setTimeout( () => this.transition.title( SHOW ), this.transition.durations.zoom - 1000 );

      this.playing = false;
      this.controls.disable();

    }

  }

  private prefs( show:boolean ) {

    if ( show ) {

      if ( this.transition.activeTransitions > 0 ) return;

      this.state = STATE.Prefs;

      this.transition.buttons( BUTTONS.Prefs, BUTTONS.Menu );

      this.transition.title( HIDE );
      this.transition.cube( HIDE );

      setTimeout( () => this.transition.preferences( SHOW ), 1000 );

    } else {

      this.cube.resize();

      this.state = STATE.Menu;

      this.transition.buttons( BUTTONS.Menu, BUTTONS.Prefs );

      this.transition.preferences( HIDE );

      setTimeout( () => this.transition.cube( SHOW ), 500 );
      setTimeout( () => this.transition.title( SHOW ), 1200 );

    }

  }

  private theme( show:boolean ) {

    this.themeEditor.colorPicker( show );
    
    if ( show ) {

      if ( this.transition.activeTransitions > 0 ) return;

      this.cube.loadFromData( States[ '3' ][ 'checkerboard' ] );

      this.themeEditor.setHSL( null, false );

      this.state = STATE.Theme;

      this.transition.buttons( BUTTONS.Theme, BUTTONS.Prefs );

      this.transition.preferences( HIDE );

      setTimeout( () => this.transition.cube( SHOW, true ), 500 );
      setTimeout( () => this.transition.theming( SHOW ), 1000 );

    } else {

      this.state = STATE.Prefs;

      this.transition.buttons( BUTTONS.Prefs, BUTTONS.Theme );

      this.transition.cube( HIDE, true );
      this.transition.theming( HIDE );

      setTimeout( () => this.transition.preferences( SHOW ), 1000 );
      setTimeout( () => {
        const theCube_savedState = localStorage.getItem( 'theCube_savedState' );
        const gameCubeData = theCube_savedState ? JSON.parse( theCube_savedState ):null;

        if ( !gameCubeData ) {

          this.cube.resize( true );
          return;

        }

        this.cube.loadFromData( gameCubeData );

      }, 1500 );

    }

  }

  private stats( show:boolean ) {

    if ( show ) {

      if ( this.transition.activeTransitions > 0 ) return;

      this.state = STATE.Stats;

      this.transition.buttons( BUTTONS.Stats, BUTTONS.Menu );

      this.transition.title( HIDE );
      this.transition.cube( HIDE );

      setTimeout( () => this.transition.stats( SHOW ), 1000 );

    } else {

      this.state = STATE.Menu;

      this.transition.buttons( BUTTONS.Menu, BUTTONS.None );

      this.transition.stats( HIDE );

      setTimeout( () => this.transition.cube( SHOW ), 500 );
      setTimeout( () => this.transition.title( SHOW ), 1200 );

    }

  }

  private complete( show:boolean ) {

    if ( show ) {

      this.transition.buttons( BUTTONS.Complete, BUTTONS.Playing );

      this.state = STATE.Complete;
      this.saved = false;

      this.controls.disable();
      this.timer._stop();
      this.storage.clearGame();

      this.bestTime = this.scores.addScore( this.timer.deltaTime );

      this.transition.zoom( STATE.Menu, 0 );
      this.transition.elevate( SHOW );

      setTimeout( () => {

        this.transition.complete( SHOW, this.bestTime );
        this.confetti.start();

      }, 1000 );

    } else {

      this.state = STATE.Stats;
      this.saved = false;

      this.transition.timer( HIDE );
      this.transition.complete( HIDE, this.bestTime );
      this.transition.cube( HIDE );
      this.timer.reset();

      setTimeout( () => {

        this.cube.reset();
        this.confetti.stop();

        this.transition.stats( SHOW );
        this.transition.elevate( HIDE );

      }, 1000 );

      // return false;

    }

  }


}


