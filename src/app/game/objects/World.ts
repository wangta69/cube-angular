import * as THREE from 'three';
import {Animation} from './Animation';

export class World extends Animation {

  private game: any;

  private container: any;
  public scene = new THREE.Scene();

  private renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );


  private camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );
  private lights: any;
  private stage = { width: 2, height: 3 };
  private fov = 10;

  private width!: number;
  private height!: number;



  private onResize = [];


  constructor( game: any ) {

    super( true );

    this.game = game;
    this.fov = game.storage.fov;

    this.container = this.game.dom.game;

    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.container.appendChild( this.renderer.domElement );

    this.createLights();
    // this.setAxesHelper();
    this.resize();
    window.addEventListener( 'resize', () => this.resize(), false );

  }

  override update() {

    this.renderer.render( this.scene, this.camera );

  }
/*
  private setAxesHelper() {
    const axesHelper = new THREE.AxesHelper( 5 );
    this.scene.add( axesHelper );
  }
  */
  private resize() {

    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;

    this.renderer.setSize( this.width, this.height );

    this.camera.fov = this.fov;
    this.camera.aspect = this.width / this.height;

    const aspect = this.stage.width / this.stage.height;
    const fovRad = this.fov * THREE.MathUtils.DEG2RAD;

    let distance = ( aspect < this.camera.aspect )
      ? ( this.stage.height / 2 ) / Math.tan( fovRad / 2 )
      : ( this.stage.width / this.camera.aspect ) / ( 2 * Math.tan( fovRad / 2 ) );

    distance *= 0.5;

    this.camera.position.set( distance, distance, distance);
    this.camera.lookAt( this.scene.position );
    this.camera.updateProjectionMatrix();

    const docFontSize = ( aspect < this.camera.aspect )
      ? ( this.height / 100 ) * aspect
      : this.width / 100;

    document.documentElement.style.fontSize = docFontSize + 'px';

    // if ( this.onResize ) this.onResize.forEach( (cb) => cb() );

  }

  createLights() {

    this.lights = {
      holder:  new THREE.Object3D,
      ambient: new THREE.AmbientLight( 0xffffff, 0.7),
      front:   new THREE.DirectionalLight( 0xffffff, 3 ),
      back:    new THREE.DirectionalLight( 0xffffff, 0.19 ),
    };

    this.lights.front.position.set( 1.5, 5, 3 );
    this.lights.back.position.set( -1.5, -5, -3 );

    this.lights.holder.add( this.lights.ambient );
    this.lights.holder.add( this.lights.front );
    this.lights.holder.add( this.lights.back );

    this.scene.add( this.lights.holder );

  }

}