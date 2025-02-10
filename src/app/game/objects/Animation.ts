
import {AnimationEngine} from './AnimationEngine';

export class Animation {

  private animationEngine: any;
  constructor( start: boolean ) {

    this.animationEngine = new AnimationEngine();
    if ( start === true ) this.start();
  }

  public start() {
    this.animationEngine.add( this );
  }

  public stop() {
    this.animationEngine.remove( this );
  }

  public update( delta: number ) {}

}