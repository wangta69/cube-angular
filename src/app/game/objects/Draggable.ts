import * as THREE from 'three';
export class Draggable {

  private position: any;
  private options: any;
  private element: any;
  private touch: any;

  private drag: any;
  public onDragStart = (position: any) => {};
  public onDragMove = (position: any) => {};
  public onDragEnd = (position: any) => {};

  constructor( element: any, options?:any ) {

    this.position = {
      current: new THREE.Vector2(),
      start: new THREE.Vector2(),
      delta: new THREE.Vector2(),
      old: new THREE.Vector2(),
      drag: new THREE.Vector2(),
    };

    this.options = Object.assign( {
      calcDelta: false,
    }, options || {} );

    this.element = element;
    this.touch = null;

    this.drag = {

      start: ( event: any ) => {
        if ( event.type == 'mousedown' && event.which != 1 ) return;
        if ( event.type == 'touchstart' && event.touches.length > 1 ) return;

        this.getPositionCurrent( event );
        if ( this.options.calcDelta ) {

          this.position.start = this.position.current.clone();
          this.position.delta.set( 0, 0 );
          this.position.drag.set( 0, 0 );

        }

        this.touch = ( event.type == 'touchstart' );

        this.onDragStart( this.position );

        
        window.addEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move.bind(this), false );
        window.addEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end.bind(this), false );

      },

      move: ( event: any ) => {
        if ( this.options.calcDelta ) {

          this.position.old = this.position.current.clone();

        }

        this.getPositionCurrent( event );

        if ( this.options.calcDelta ) {

          this.position.delta = this.position.current.clone().sub( this.position.old );
          this.position.drag = this.position.current.clone().sub( this.position.start );

        }

        this.onDragMove( this.position );

      },

      end: ( event: any ) => {

        this.getPositionCurrent( event );

        this.onDragEnd( this.position );

        window.removeEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move.bind(this), false );
        window.removeEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end.bind(this), false );

      },

    };

    this.enable();
  }

  public enable() {
    this.element.addEventListener( 'touchstart', this.drag.start.bind(this), false );
    this.element.addEventListener( 'mousedown', this.drag.start.bind(this), false );
  }

  public disable() {

    this.element.removeEventListener( 'touchstart', this.drag.start.bind(this), false );
    this.element.removeEventListener( 'mousedown', this.drag.start.bind(this), false );
  }

  private getPositionCurrent( event: any ) {

    const dragEvent = event.touches
      ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] )
      : event;
    this.position.current.set( dragEvent.pageX, dragEvent.pageY );

  }

  public convertPosition( position:any ) {

    position.x = ( position.x / this.element.offsetWidth ) * 2 - 1;
    position.y = - ( ( position.y / this.element.offsetHeight ) * 2 - 1 );

    return position;

  }

}