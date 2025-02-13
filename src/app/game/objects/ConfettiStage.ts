import * as THREE from 'three';
import {Animation} from './Animation';
import {Particle} from './Particle';

export class ConfettiStage extends Animation {
  private game;
  private parent;

  private distanceFromCube;

  private count;
  private particles:any[] = [];

  private holder = new THREE.Object3D();

  private object = new THREE.Object3D();

  // private resizeViewport = this.resizeViewport.bind( this );

  private geometry;
  private material;

  private options;
  private completed = 0;
  private time!:number;
  private playing = true;
  private height!:number;
  private width!:number;

  public callback =  () => {}; 



  constructor( game: any, parent: any, distance: any, count: any ) {

    super( false );

    this.game = game;
    this.parent = parent;

    this.distanceFromCube = distance;

    this.count = count;

    this.holder.rotation.copy( this.game.world.camera.rotation );
    this.holder.add( this.object );

    this.resizeViewport = this.resizeViewport.bind( this );
    this.game.world.onResize.push( this.resizeViewport );
    this.resizeViewport();    

    this.geometry = this.parent.geometry;
    this.material = this.parent.material;

    this.options = this.parent.options;

    let i = this.count;
    while ( i-- ) this.particles.push( new Particle( this ) );

  }

  private _start() {

    this.time = performance.now();
    this.playing = true;

    let i = this.count;
    while ( i-- ) this.particles[ i ].reset();

    super.start();

  }

  private _stop( callback:()=>void ) {

    this.playing = false;
    this.completed = 0;
    this.callback = callback;

  }
/*
  private reset() {
    super.stop();
    this.callback();
  }

  private update() {

    const now = performance.now();
    const delta = now - this.time;
    this.time = now;

    let i = this.count;

    while ( i-- )
      if ( ! this.particles[ i ].completed ) this.particles[ i ].update( delta );

    if ( ! this.playing && this.completed == this.count ) this.reset();

  }
*/
  private resizeViewport() {

    const fovRad = this.game.world.camera.fov * THREE.MathUtils.DEG2RAD;

    this.height = 2 * Math.tan( fovRad / 2 ) * ( this.game.world.camera.position.length() - this.distanceFromCube );
    this.width = this.height * this.game.world.camera.aspect;

    const scale = 1 / this.game.transition.data.cameraZoom;

    this.width *= scale;
    this.height *= scale;

    this.object.position.z = this.distanceFromCube;
    this.object.position.y = this.height / 2;

  }
  
}
