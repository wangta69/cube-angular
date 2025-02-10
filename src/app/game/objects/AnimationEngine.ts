export class AnimationEngine {
  private uniqueID = 0;
  private ids: any[] = [];
  private animations:any = {};
  // private update: any;
  private raf = 0;
  private time = 0;

  constructor() {

    this.ids = [];
    this.animations = {};
    // this.update = this.update.bind( this );
    this.raf = 0;
    this.time = 0;

  }

  private update = () => {

    const now = performance.now();
    const delta = now - this.time;
    
    this.time = now;

    let i = this.ids.length;
    this.raf = i ? requestAnimationFrame( this.update ) : 0;

    while ( i-- )
      this.animations[ this.ids[ i ] ] && this.animations[ this.ids[ i ] ].update( delta );

  }

  protected add( animation: any ) {

    animation.id = this.uniqueID ++;

    this.ids.push( animation.id );
    this.animations[ animation.id ] = animation;

    if ( this.raf !== 0 ) return;

    this.time = performance.now();
    this.raf = requestAnimationFrame( this.update );

  }

  private remove( animation: any ) {

    const index = this.ids.indexOf( animation.id );

    if ( index < 0 ) return;

    this.ids.splice( index, 1 );
    delete this.animations[ animation.id ];
    animation = null;

  }

}

