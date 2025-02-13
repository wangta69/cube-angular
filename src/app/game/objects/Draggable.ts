import * as THREE from 'three';
export class Draggable {

  private position = {
    current: new THREE.Vector2(),
    start: new THREE.Vector2(),
    delta: new THREE.Vector2(),
    old: new THREE.Vector2(),
    drag: new THREE.Vector2(),
  }
  private options: any;
  private element: any;
  private touch: any;

  private drag: any;
  public onDragStart = (position: any) => {};
  public onDragMove = (position: any) => {};
  public onDragEnd = (position: any) => {};

  constructor( element: any, options?:any ) {


    this.options = Object.assign( {
      calcDelta: false,
    }, options || {} );

    this.element = element;

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

        if (!this.drag.move) {
          this.drag.move = this.drag.move.bind(this);
        }
        if (!this.drag.end) {
          this.drag.end = this.drag.end.bind(this);
        }
        
        window.addEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move, false );
        window.addEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end, false );

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
        window.removeEventListener( ( this.touch ) ? 'touchmove' : 'mousemove', this.drag.move, false );
        window.removeEventListener( ( this.touch ) ? 'touchend' : 'mouseup', this.drag.end, false );

      },

    };

    this.enable();
  }

  public enable() {
    if (!this.drag.start) {
      this.drag.start = this.drag.start.bind(this);
    }

    this.element.addEventListener( 'touchstart', this.drag.start, false );
    this.element.addEventListener( 'mousedown', this.drag.start, false );
  }

  public disable() {
    this.element.removeEventListener( 'touchstart', this.drag.start, false );
    this.element.removeEventListener( 'mousedown', this.drag.start, false );
  }

  private getPositionCurrent( event: any ) {
    const dragEvent = event.touches
      ? ( event.touches[ 0 ] || event.changedTouches[ 0 ] )
      : event;
    this.position.current.set( dragEvent.pageX, dragEvent.pageY );
  }

  public convertPosition( position:any ) {
    console.log(this.element);
    console.log(position.x, position.y, this.element.offsetWidth, this.element.offsetHeight)
    position.x = ( position.x / this.element.offsetWidth ) * 2 - 1;
    position.y = - ( ( position.y / this.element.offsetHeight ) * 2 - 1 );
    console.log('after:', position.x, position.y)
    return position;
  }

}