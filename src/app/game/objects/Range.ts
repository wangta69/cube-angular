import {Draggable} from './Draggable';
export class Range {

  private element:any;
  private track:any;
  private handle:any;
  public list:any;

  private value:any;
  private min:number
  private max:number
  private step:number

  private onUpdate:any;
  private onComplete:any;

  private draggable: any;

  constructor( name:string, options:any ) {

    options = Object.assign( {
      range: [ 0, 1 ],
      value: 0,
      step: 0,
      onUpdate: () => {},
      onComplete: () => {},
    }, options || {} );


    this.element = document.querySelector( '.range[name="' + name + '"]' );
    this.track = this.element.querySelector( '.range .track' );
    this.handle = this.element.querySelector( '.range .handle' );

    this.list = [].slice.call( this.element.querySelectorAll( '.range .list div' ) );

    this.value = options.value;
    this.min = options.range[0];
    this.max = options.range[1];
    this.step = options.step;

    this.onUpdate = options.onUpdate;
    this.onComplete = options.onComplete;

    this.setValue( this.value );

    this.initDraggable();

  }

  private setValue( value:number ) {

    this.value = this.round( this.limitValue( value ) );
    this.setHandlePosition();

  }

  private initDraggable() {

    let current:number;

    this.draggable = new Draggable( this.handle, { calcDelta: true } );

    this.draggable.onDragStart = (position: any) => {
      current = this.positionFromValue( this.value );
      this.handle.style.left = current + 'px';

    };

    this.draggable.onDragMove = (position: any) => {
      current = this.limitPosition( current + position.delta.x );
      this.value = this.round( this.valueFromPosition( current ) );
      this.setHandlePosition();
      
      this.onUpdate( this.value );

    };

    this.draggable.onDragEnd = (position: any) => {
      this.onComplete( this.value );
    };

  }

  private round( value:number ) {
    if ( this.step < 1 ) return value;
    return Math.round( ( value - this.min ) / this.step ) * this.step + this.min;
  }

  private limitValue( value:number ) {
    const max = Math.max( this.max, this.min );
    const min = Math.min( this.max, this.min );
    return Math.min( Math.max( value, min ), max );
  }

  private limitPosition( position:number ) {
    return Math.min( Math.max( position, 0 ), this.track.offsetWidth );
  }

  private  percentsFromValue( value:number ) {
    return ( value - this.min ) / ( this.max - this.min );
  }

  private valueFromPosition( position:number ) {
    return this.min + ( this.max - this.min ) * ( position / this.track.offsetWidth );
  }

  private positionFromValue( value:number ) {
    return this.percentsFromValue( value ) * this.track.offsetWidth;
  }

  private setHandlePosition() {
    this.handle.style.left = this.percentsFromValue( this.value ) * 100 + '%';
    
  }

}