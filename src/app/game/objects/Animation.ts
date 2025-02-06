
import {AnimationEngine} from './AnimationEngine';

export class Animation {

  private animationEngine: any;
  constructor( start: boolean ) {

    this.animationEngine = new AnimationEngine();
    if ( start === true ) this.start();

  }

  protected start() {

    this.animationEngine.add( this );

  }

  protected stop() {

    this.animationEngine.remove( this );

  }

  protected update( delta: number ) {}

}