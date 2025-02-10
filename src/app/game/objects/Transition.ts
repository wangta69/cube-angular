import {Tween} from './Tween';
import {Easing} from './Constants';

export class Transition {
  private game;

  private tweens:any = {};
  public durations:any = {};
  private data: any;

  public activeTransitions = 0;


  constructor( game: any ) {

    this.game = game;

    this.tweens = {};
    this.durations = {};
    this.data = {
      cubeY: -0.2,
      cameraZoom: 0.85,
    };

    this.activeTransitions = 0;

  }

  public init() {

    this.game.controls.disable();

    this.game.cube.object.position.y = this.data.cubeY;
    this.game.cube.animator.position.y = 4;
    this.game.cube.animator.rotation.x = - Math.PI / 3;
    this.game.world.camera.zoom = this.data.cameraZoom;
    this.game.world.camera.updateProjectionMatrix();

    this.tweens.buttons = {};
    this.tweens.timer = [];
    this.tweens.title = [];
    this.tweens.best = [];
    this.tweens.complete = [];
    this.tweens.prefs = [];
    this.tweens.theme = [];
    this.tweens.stats = [];

  }

  public buttons( show: any, hide: any ) {

    const buttonTween = ( button:any, show: any ) => {

      return new Tween( {
        target: button.style,
        duration: 300,
        easing: show ? Easing.Power.Out( 2 ) : Easing.Power.In( 3 ),
        from: { opacity: show ? 0 : 1 },
        to: { opacity: show ? 1 : 0 },
        onUpdate: (tween: any) => {

          const translate = show ? 1 - tween.value : tween.value;
          button.style.transform = `translate3d(0, ${translate * 1.5}em, 0)`;

        },
        onComplete: () => button.style.pointerEvents = show ? 'all' : 'none'
      } );

    };

    hide.forEach( (button: any) =>
      this.tweens.buttons[ button ] = buttonTween( this.game.dom.buttons[ button ], false )
    );

    setTimeout( () => show.forEach( (button: any) => {

      this.tweens.buttons[ button ] = buttonTween( this.game.dom.buttons[ button ], true );

    } ), hide ? 500 : 0 );

  }

  public cube( show:boolean, theming = false ) {

    this.activeTransitions++;

    try { this.tweens.cube.stop(); } catch(e) {}
    const currentY = this.game.cube.animator.position.y;
    const currentRotation = this.game.cube.animator.rotation.x;

    this.tweens.cube = new Tween( {
      duration: show ? 3000 : 1250,
      easing: show ? Easing.Elastic.Out( 0.8, 0.6 ) : Easing.Back.In( 1 ),
      onUpdate: (tween: any) => {

        this.game.cube.animator.position.y = show
          ? ( theming ? 0.9 + ( 1 - tween.value ) * 3.5 : ( 1 - tween.value ) * 4 )
          : currentY + tween.value * 4;

        this.game.cube.animator.rotation.x = show
          ? ( 1 - tween.value ) * Math.PI / 3
          : currentRotation + tween.value * - Math.PI / 3;

      },
    } );

    if ( theming ) {

      if ( show ) {

        this.game.world.camera.zoom = 0.75;
        this.game.world.camera.updateProjectionMatrix();

      } else {

        setTimeout( () => {

          this.game.world.camera.zoom = this.data.cameraZoom;
          this.game.world.camera.updateProjectionMatrix();

        }, 1500 );

      }

    }

    this.durations.cube = show ? 1500 : 1500;

    setTimeout( () => this.activeTransitions--, this.durations.cube );

  }

  public float() {

    try { this.tweens.float.stop(); } catch(e) {}
    this.tweens.float = new Tween( {
      duration: 1500,
      easing: Easing.Sine.InOut(),
      yoyo: true,
      onUpdate: (tween: any) => {

        this.game.cube.holder.position.y = (- 0.02 + tween.value * 0.04); 
        this.game.cube.holder.rotation.x = 0.005 - tween.value * 0.01;
        this.game.cube.holder.rotation.z = - this.game.cube.holder.rotation.x;
        this.game.cube.holder.rotation.y = this.game.cube.holder.rotation.x;

        this.game.controls.edges.position.y =
          this.game.cube.holder.position.y + this.game.cube.object.position.y;

      },
    } );

  }

  public zoom( play:number, time:number ) {

    this.activeTransitions++;

    const zoom = ( play ) ? 1 : this.data.cameraZoom;
    const duration = ( time > 0 ) ? Math.max( time, 1500 ) : 1500;
    const rotations = ( time > 0 ) ? Math.round( duration / 1500 ) : 1;
    const easing = Easing.Power.InOut( ( time > 0 ) ? 2 : 3 );

    this.tweens.zoom = new Tween( {
      target: this.game.world.camera,
      duration: duration,
      easing: easing,
      to: { zoom: zoom },
      onUpdate: () => { this.game.world.camera.updateProjectionMatrix(); },
    } );

    this.tweens.rotate = new Tween( {
      target: this.game.cube.animator.rotation,
      duration: duration,
      easing: easing,
      to: { y: - Math.PI * 2 * rotations },
      onComplete: () => { this.game.cube.animator.rotation.y = 0; },
    } );

    this.durations.zoom = duration;

    setTimeout( () => this.activeTransitions--, this.durations.zoom );

  }

  public elevate( complete: boolean ) {

    this.activeTransitions++;

    const cubeY = 

    this.tweens.elevate = new Tween( {
      target: this.game.cube.object.position,
      duration: complete ? 1500 : 0,
      easing: Easing.Power.InOut( 3 ),
      to: { y: complete ? -0.05 : this.data.cubeY }
    } );

    this.durations.elevate = 1500;

    setTimeout( () => this.activeTransitions--, this.durations.elevate );

  }

  public complete( show:boolean, best:boolean ) {

    this.activeTransitions++;

    const text = best ? this.game.dom.texts.best : this.game.dom.texts.complete;

    if ( text.querySelector( 'span i' ) === null )
      text.querySelectorAll( 'span' ).forEach( (span: any) => this.splitLetters( span ) );

    const letters = text.querySelectorAll( '.icon, i' );

    this.flipLetters( best ? 'best' : 'complete', letters, show );

    text.style.opacity = 1;

    const duration = this.durations[ best ? 'best' : 'complete' ];

    if ( ! show ) setTimeout( () => this.game.dom.texts.timer.style.transform = '', duration );

    setTimeout( () => this.activeTransitions--, duration );

  } 

  public stats( show:boolean ) {

    if ( show ) this.game.scores.calcStats();

    this.activeTransitions++;

    this.tweens.stats.forEach( (tween:any) => { tween.stop(); tween = null; } );

    let tweenId = -1;

    const stats = this.game.dom.stats.querySelectorAll( '.stats' );
    const easing = show ? Easing.Power.Out( 2 ) : Easing.Power.In( 3 );

    stats.forEach( ( stat: any, index:number ) => {

      const delay = index * ( show ? 80 : 60 );

      this.tweens.stats[ tweenId++ ] = new Tween( {
        delay: delay,
        duration: 400,
        easing: easing,
        onUpdate: (tween: any) => {

          const translate = show ? ( 1 - tween.value ) * 2 : tween.value;
          const opacity = show ? tween.value : ( 1 - tween.value );

          stat.style.transform = `translate3d(0, ${translate}em, 0)`;
          stat.style.opacity = opacity;

        }
      } );

    } );

    this.durations.stats = 0;

    setTimeout( () => this.activeTransitions--, this.durations.stats );

  }

  public preferences( show:boolean ) {

    this.ranges( this.game.dom.prefs.querySelectorAll( '.range' ), 'prefs', show );

  }

  public theming( show:boolean ) {

    this.ranges( this.game.dom.theme.querySelectorAll( '.range' ), 'prefs', show );

  }

  private ranges( ranges:any, type:string, show:boolean ) {

    this.activeTransitions++;
    this.tweens[ type ].forEach( (tween:any) => { tween.stop(); tween = null; } );

    const easing = show ? Easing.Power.Out(2) : Easing.Power.In(3);

    let tweenId = -1;
    let listMax = 0;

    ranges.forEach( ( range:any, rangeIndex:number ) => {
    
      const label = range.querySelector( '.range .label' );
      const track = range.querySelector( '.range .track-line' );
      const handle = range.querySelector( '.range .handle' );
      const list = range.querySelectorAll( '.range .list div' );

      const delay = rangeIndex * ( show ? 120 : 100 );
      label.style.opacity = show ? 0 : 1;
      track.style.opacity = show ? 0 : 1;
      handle.style.opacity = show ? 0 : 1;
      handle.style.pointerEvents = show ? 'all' : 'none';

      this.tweens[ type ][ tweenId++ ] = new Tween( {
        delay: show ? delay : delay,
        duration: 400,
        easing: easing,
        onUpdate: (tween: any) => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const opacity = show ? tween.value : ( 1 - tween.value );

          label.style.transform = `translate3d(0, ${translate}em, 0)`;
          label.style.opacity = opacity;

        }
      } );

      this.tweens[ type ][ tweenId++ ] = new Tween( {
        delay: show ? delay + 100 : delay,
        duration: 400,
        easing: easing,
        onUpdate: (tween: any) => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const scale = show ? tween.value : ( 1 - tween.value );
          const opacity = scale;

          track.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, 1, 1)`;
          track.style.opacity = opacity;

        }
      } );

      this.tweens[ type ][ tweenId++ ] = new Tween( {
        delay: show ? delay + 100 : delay,
        duration: 400,
        easing: easing,
        onUpdate: (tween: any) => {

          const translate = show ? ( 1 - tween.value ) : tween.value;
          const opacity = 1 - translate;
          const scale = 0.5 + opacity * 0.5;

          handle.style.transform = `translate3d(0, ${translate}em, 0) scale3d(${scale}, ${scale}, ${scale})`;
          handle.style.opacity = opacity;

        }
      } );

      list.forEach( ( listItem: any, labelIndex: number ) => {

        listItem.style.opacity = show ? 0 : 1;

        this.tweens[ type ][ tweenId++ ] = new Tween( {
          delay: show ? delay + 200 + labelIndex * 50 : delay,
          duration: 400,
          easing: easing,
          onUpdate: (tween: any) => {

            const translate = show ? ( 1 - tween.value ) : tween.value;
            const opacity = show ? tween.value : ( 1 - tween.value );

            listItem.style.transform = `translate3d(0, ${translate}em, 0)`;
            listItem.style.opacity = opacity;

          }
        } );

      } );

      listMax = list.length > listMax ? list.length - 1 : listMax;

      range.style.opacity = 1;

    } );

    this.durations[ type ] = show
      ? ( ( ranges.length - 1 ) * 100 ) + 200 + listMax * 50 + 400
      : ( ( ranges.length - 1 ) * 100 ) + 400;

    setTimeout( () => this.activeTransitions--, this.durations[ type ] ); 

  }

  public title( show:boolean ) {

    this.activeTransitions++;

    const title = this.game.dom.texts.title;

    if ( title.querySelector( 'span i' ) === null )
      title.querySelectorAll( 'span' ).forEach( (span: any) => this.splitLetters( span ) );
    const letters = title.querySelectorAll( 'i' );

    this.flipLetters( 'title', letters, show );

    title.style.opacity = 1;

    const note = this.game.dom.texts.note;
    this.tweens.title[ letters.length ] = new Tween( {
      target: note.style,
      easing: Easing.Sine.InOut(),
      duration: show ? 800 : 400,
      yoyo: show ? true : null,
      from: { opacity: show ? 0 : ( parseFloat( getComputedStyle( note ).opacity ) ) },
      to: { opacity: show ? 1 : 0 },
    } );
    setTimeout( () => this.activeTransitions--, this.durations.title );

  }

  public timer( show:boolean ) {

    this.activeTransitions++;

    const timer = this.game.dom.texts.timer;

    timer.style.opacity = 0;
    this.game.timer.convert();
    this.game.timer.setText();

    this.splitLetters( timer );
    const letters = timer.querySelectorAll( 'i' );
    this.flipLetters( 'timer', letters, show );

    timer.style.opacity = 1;

    setTimeout( () => this.activeTransitions--, this.durations.timer );

  }

  private splitLetters( element: any ) {

    const text = element.innerHTML;

    element.innerHTML = '';

    text.split( '' ).forEach( (letter:string) => {

      const i = document.createElement( 'i' );

      i.innerHTML = letter;

      element.appendChild( i );

    } );

  }

  private flipLetters( type:string, letters:any, show:boolean ) {

    try { this.tweens[ type ].forEach( (tween:any) => tween.stop() ); } catch(e) {}
    letters.forEach( ( letter:any, index:number ) => {

      letter.style.opacity = show ? 0 : 1;

      this.tweens[ type ][ index ] = new Tween( {
        easing: Easing.Sine.Out(),
        duration: show ? 800 : 400,
        delay: index * 50,
        onUpdate: (tween: any) => {

          const rotation = show ? ( 1 - tween.value ) * -80 : tween.value * 80;

          letter.style.transform = `rotate3d(0, 1, 0, ${rotation}deg)`;
          letter.style.opacity = show ? tween.value : ( 1 - tween.value );

        },
      } );

    } );

    this.durations[ type ] = ( letters.length - 1 ) * 50 + ( show ? 800 : 400 );

  }

}