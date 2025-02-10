
import {Animation} from './Animation';

export class Timer extends Animation {
  private game;

  public deltaTime!:number;
  private converted!: string;
  private startTime = 0;
  private currentTime = 0;
  constructor( game: any ) {

    super(false);

    this.game = game;
    this.reset();
    
  }

  public _start( continueGame:boolean ) {
    this.startTime = continueGame ? ( Date.now() - this.deltaTime ) : Date.now();
    this.deltaTime = 0;
    this.convert();

    super.start();

  }

  public reset() {

    this.startTime = 0;
    this.currentTime = 0;
    this.deltaTime = 0;
    this.converted = '0:00';

  }

  public _stop() {

    this.currentTime = Date.now();
    this.deltaTime = this.currentTime - this.startTime;
    this.convert();

    super.stop();

    return { time: this.converted, millis: this.deltaTime };

  }

  override update() {

    const old = this.converted;

    this.currentTime = Date.now();
    this.deltaTime = this.currentTime - this.startTime;
    this.convert();


    if ( this.converted != old ) {
      localStorage.setItem( 'theCube_time', this.deltaTime.toString() );
      this.setText();

    }

  }

  private convert() {
    const seconds =Math.floor(( this.deltaTime / 1000 ) % 60) ;
    const minutes = Math.floor( this.deltaTime / ( 1000 * 60 ) ) ;
    this.converted = minutes + ':' + ( seconds < 10 ? '0' : '' ) + seconds;

  }

  private setText() {
    this.game.dom.texts.timer.innerHTML = this.converted;
  }

}