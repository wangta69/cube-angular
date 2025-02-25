import * as THREE from 'three';
import {ConfettiStage} from './ConfettiStage';
export class Confetti {
  private game;

  private started = 0;
  public options = {
    speed: { min: 0.0011, max: 0.0022 },
    revolution: { min: 0.01, max: 0.05 },
    size: { min: 0.1, max: 0.15 },
    colors: [ 0x41aac8, 0x82ca38, 0xffef48, 0xef3923, 0xff8c0a ],
  }
  public geometry = new THREE.PlaneGeometry( 1, 1 );
  public material = new THREE.MeshLambertMaterial( { side: THREE.DoubleSide } );

  private holders: any[] = [];


  constructor( game: any ) {

    this.game = game;

    this.holders = [
      new ConfettiStage( this.game, this, 1, 20 ),
      new ConfettiStage( this.game, this, -1, 30 ),
    ];

  }

  public start() {
    if ( this.started > 0 ) return;

    this.holders.forEach( holder => {

      this.game.world.scene.add( holder.holder );
      holder._start();
      this.started ++;

    } );

  }

  public stop() {
    if ( this.started == 0 ) return;

    this.holders.forEach( holder => {

      holder._stop( () => {

        this.game.world.scene.remove( holder.holder );
        this.started --;

      } );

    } );

  }

  public updateColors( colors: any ) {

    this.holders.forEach( holder => {

      holder.options.colors.forEach( ( color: any, index:number ) => {

        holder.options.colors[ index ] = colors[ [ 'D', 'F', 'R', 'B', 'L' ][ index ] ];

      } );

    } );

  }

}
