import * as THREE from 'three';

import {STILL, PREPARING, ROTATING, ANIMATING, Easing} from './Constants';
import { VertexNormalsHelper } from 'three/addons/helpers/VertexNormalsHelper.js';

import {Draggable} from './Draggable';
import {Tween} from './Tween';
export class Controls {
  private game;

  private flipConfig = 0;

  private flipEasings = [ Easing.Power.Out( 3 ), Easing.Sine.Out(), Easing.Back.Out( 1.5 ) ];
  public flipSpeeds = [ 125, 200, 300 ];

  

  private group = new THREE.Object3D();
  private plane:THREE.Mesh;


  private edges:any; //THREE.Mesh;


  private momentum: any[] = [];

  private scramble: any = null;
  private state = STILL;
  private enabled = false;

  public onSolved = () => {};
  public onMove = () => {};

  private flipType!: string;

  private draggable!: Draggable;
  private dragIntersect: any;
  private dragNormal: any;
  private dragCurrent: any;
  private gettingDrag= false;
  private dragTotal: any;
  private dragDelta: any;
  private dragDirection: any;

  private flipAxis: any;
  private flipAngle: any;
  private flipLayer: any;

  // private rotationTween!: Tween;


  constructor( game: any ) {
    this.game = game;
    this.flipConfig = this.game.storage.flipConfig;
    const helperMaterial = new THREE.MeshBasicMaterial( { depthWrite: false, transparent: true, opacity: 0, color: 0x0033ff } );
    // const helperMaterial = new THREE.MeshBasicMaterial( { depthWrite: false, transparent: false, opacity: 1, color: 0x0033ff } );
    this.group.name = 'controls';
    this.game.cube.object.add( this.group );


    this.plane = new THREE.Mesh(
      // new THREE.PlaneBufferGeometry( 200, 200 ),
      new THREE.PlaneGeometry( 200, 200 ),
      // new THREE.PlaneGeometry(2, 2),
      helperMaterial.clone()
    );

    this.plane.rotation.set( 0, Math.PI / 4, 0 );
    this.game.world.scene.add( this.plane );

    this.edges = new THREE.Mesh(
      new THREE.BoxGeometry( 1, 1, 1 ),
      helperMaterial.clone(),
    );


    this.game.world.scene.add( this.edges );

    this.initDraggable();
  }

  public enable() {
    this.draggable.enable();
    this.enabled = true;
  }

  public disable() {
    this.draggable.disable();
    this.enabled = false;
  }

  private initDraggable() {
    this.draggable = new Draggable( this.game.dom.game );


    this.draggable.onDragStart = (position:any) => {
      if ( this.scramble !== null ) return;
      if ( this.state === PREPARING || this.state === ROTATING ) return;

      this.gettingDrag = this.state === ANIMATING;

      const boundryIntersect: any = this.getIntersect( position.current, this.edges, false );
      if ( boundryIntersect !== false ) {
        this.flipType = 'layer';
        this.dragIntersect = this.getIntersect( position.current, this.game.cube.cubes, true );
        this.dragNormal = boundryIntersect.face.normal.round();

        this.plane.rotation.set( 0, 0, 0 );
        this.plane.position.set( 0, 0, 0 );
        this.plane.lookAt( this.dragNormal );
        this.plane.applyMatrix4( this.edges.matrixWorld );
      } else {
        this.flipType = 'cube';
        this.dragNormal = new THREE.Vector3( 0, 0, 1 );
        this.plane.position.set( 0, 0, 0 );
        this.plane.rotation.set( 0, Math.PI / 4, 0 );
        
      }
      this.plane.updateMatrixWorld();

      const planeIntersect = this.getIntersect( position.current, this.plane, false );

      if ( planeIntersect === false ) return;

      this.dragCurrent = this.plane.worldToLocal( planeIntersect.point );
      this.dragTotal = new THREE.Vector3();
      this.state = ( this.state === STILL ) ? PREPARING : this.state;
    };

    this.draggable.onDragMove = position => {
      if ( this.scramble !== null ) return;
      if ( this.state === STILL || ( this.state === ANIMATING && this.gettingDrag === false ) ) return;
      const planeIntersect = this.getIntersect( position.current, this.plane, false );
      if ( planeIntersect === false ) return;
      const point = this.plane.worldToLocal( planeIntersect.point.clone() );

      this.dragDelta = point.clone().sub( this.dragCurrent ).setZ( 0 );
      this.dragTotal.add( this.dragDelta );
      this.dragCurrent = point;
      this.addMomentumPoint( this.dragDelta );

      if ( this.state === PREPARING && this.dragTotal.length() > 0.05 ) {
        this.dragDirection = this.getMainAxis( this.dragTotal );

        if ( this.flipType === 'layer' ) {
          const direction:any = new THREE.Vector3();
          direction[ this.dragDirection ] = 1;

          const worldDirection = this.plane.localToWorld( direction ).sub( this.plane.position );
          const objectDirection = this.edges.worldToLocal( worldDirection ).round();
          this.flipAxis = objectDirection.cross( this.dragNormal ).negate();
          this.selectLayer( this.getLayer( false ) );

        } else {

          const axis = ( this.dragDirection != 'x' )
            ? ( ( this.dragDirection == 'y' && position.current.x > this.game.world.width / 2 ) ? 'z' : 'x' )
            : 'y';

          this.flipAxis = new THREE.Vector3();
          this.flipAxis[ axis ] = 1 * ( ( axis == 'x' ) ? - 1 : 1 );

        }

        this.flipAngle = 0;
        this.state = ROTATING;

      } else if ( this.state === ROTATING ) {
        const rotation = this.dragDelta[ this.dragDirection ];
        if ( this.flipType === 'layer' ) { 
          this.group.rotateOnAxis( this.flipAxis, rotation );
          this.flipAngle += rotation;

        } else {
          this.edges.rotateOnWorldAxis( this.flipAxis, rotation );
          this.game.cube.object.rotation.copy( this.edges.rotation );
          this.flipAngle += rotation;

        }
      }

    };

    this.draggable.onDragEnd = () => {
      if ( this.scramble !== null ) return;
      if ( this.state !== ROTATING ) {

        this.gettingDrag = false;
        this.state = STILL;
        return;
      }

      this.state = ANIMATING;

      const momentum = this.getMomentum()[ this.dragDirection ];
      const flip = ( Math.abs( momentum ) > 0.05 && Math.abs( this.flipAngle ) < Math.PI / 2 );

      const angle = flip
        ? this.roundAngle( this.flipAngle + Math.sign( this.flipAngle ) * ( Math.PI / 4 ) )
        : this.roundAngle( this.flipAngle );

      const delta = angle - this.flipAngle;

      if ( this.flipType === 'layer' ) {

        this.rotateLayer( delta, false, (layer: any) => {

          this.game.storage.saveGame();
          
          this.state = this.gettingDrag ? PREPARING : STILL;
          this.gettingDrag = false;

          this.checkIsSolved();

        } );

      } else {

        this.rotateCube( delta, () => {

          this.state = this.gettingDrag ? PREPARING : STILL;
          this.gettingDrag = false;

        } );

      }

    }
  }

  private rotateLayer( rotation: number, scramble: boolean, callback:(layer: any)=>void ) {

    const config = scramble ? 0 : this.flipConfig;

    const easing = this.flipEasings[ config ];
    const duration = this.flipSpeeds[ config ];

    const bounce = ( config == 2 ) ? this.bounceCube() : ( () => {} );
    new Tween( {
      easing: easing,
      duration: duration,
      onUpdate: (tween:any) => {

        let deltaAngle = tween.delta * rotation;
        this.group.rotateOnAxis( this.flipAxis, deltaAngle );
        bounce( tween.value, deltaAngle, rotation );

      },
      onComplete: () => {

        if ( ! scramble ) this.onMove();

        const layer = this.flipLayer.slice( 0 );

        // this.game.cube.object.rotation.setFromVector3( this.snapRotation( this.game.cube.object.rotation.toVector3() ) );
        // this.group.rotation.setFromVector3( this.snapRotation( this.group.rotation.toVector3() ) );
        this.game.cube.object.rotation.setFromVector3( this.snapRotation(  new THREE.Vector3().setFromEuler(this.game.cube.object.rotation)) );
        this.group.rotation.setFromVector3( this.snapRotation(  new THREE.Vector3().setFromEuler(this.group.rotation) ) );

        this.deselectLayer( this.flipLayer );
        callback( layer );
      },
    } );

  }

  private bounceCube() {

    let fixDelta = true;
    return ( progress: number, delta: number, rotation: number ) => {
      if ( progress >= 1 ) {

        if ( fixDelta ) {
          delta = ( progress - 1 ) * rotation;
          fixDelta = false;
        }

        this.game.cube.object.rotateOnAxis( this.flipAxis, delta );
      }
    }

  }

  private sum = 0;
  private rotateCube( rotation: number, callback:() => void) {

    const config = this.flipConfig;
    const easing = [ Easing.Power.Out( 4 ), Easing.Sine.Out(), Easing.Back.Out( 2 ) ][ config ];
    const duration = [ 100, 150, 350 ][ config ];
    // const duration = [ 1000, 1500, 3500 ][ config ];
    this.sum = 0;
    new Tween( {
      easing: easing,
      duration: duration,
      onUpdate: (tween: any) => {
        this.edges.rotateOnWorldAxis( this.flipAxis, tween.delta * rotation );
        this.game.cube.object.rotation.copy( this.edges.rotation );
      },
      onComplete: () => {
        this.edges.rotation.setFromVector3( this.snapRotation( new THREE.Vector3().setFromEuler(this.edges.rotation) ) );        
        this.game.cube.object.rotation.copy( this.edges.rotation );
        callback();

      },
    } );

  }


  private getLayer( position: any ) {
    const scalar = { 2: 6, 3: 3, 4: 4, 5: 3 }[ this.game.cube.size as 2|3|4|5 ];
    const layer:string[] = [];

    let axis;

    if ( position === false ) {

      const piece = this.dragIntersect.object.parent;

      axis = this.getMainAxis( this.flipAxis );
      position = piece.position.clone().multiplyScalar( scalar ).round();

    } else {

      axis = this.getMainAxis( position );

    }

    this.game.cube.pieces.forEach( (piece: any) => {

      const piecePosition = piece.position.clone().multiplyScalar( scalar ).round();

      if ( piecePosition[ axis ] == position[ axis ] ) layer.push( piece.name );

    } );

    return layer;

  }

  private selectLayer( layer: any ) {
    this.group.rotation.set( 0, 0, 0 );
    this.movePieces( layer, this.game.cube.object, this.group );
    this.flipLayer = layer;

  }

  private deselectLayer( layer: any ) {
    this.movePieces( layer, this.group, this.game.cube.object );
    this.flipLayer = null;
  }

  private movePieces( layer: any, from: any, to: any ) {
    from.updateMatrixWorld();
    to.updateMatrixWorld();

    layer.forEach( (index:number) => {

      const piece: THREE.Object3D = this.game.cube.pieces[ index ];

      // piece.applyMatrix( from.matrixWorld );
      piece.applyMatrix4( from.matrixWorld );
      from.remove( piece );
      piece.applyMatrix4( new THREE.Matrix4().copy( to.matrixWorld ).invert() );

      to.add( piece );

      /*
      [원소스]
      const piece = this.game.cube.pieces[ index ];

      piece.applyMatrix( from.matrixWorld );
      from.remove( piece );
      piece.applyMatrix( new THREE.Matrix4().getInverse( to.matrixWorld ) );
      to.add( piece );
      */

    } );

  }



  private keyboardMove( type: string, move: any, callback:()=>{} ) {

    if ( this.state !== STILL ) return;
    if ( this.enabled !== true ) return;

    if ( type === 'LAYER' ) {

      const layer = this.getLayer( move.position );

      this.flipAxis = new THREE.Vector3();
      this.flipAxis[ move.axis ] = 1;
      this.state = ROTATING;

      this.selectLayer( layer );
      this.rotateLayer( move.angle, false, layer => {

        this.game.storage.saveGame();
        this.state = STILL;
        this.checkIsSolved();

      } );

    } else if ( type === 'CUBE' ) {

      this.flipAxis = new THREE.Vector3();
      this.flipAxis[ move.axis ] = 1;
      this.state = ROTATING;

      this.rotateCube( move.angle, () => {
        this.state = STILL;
      } );
    }
  }

  public scrambleCube() {
    if ( this.scramble == null ) {
      this.scramble = this.game.scrambler;
      //? this.scramble.callback = ( typeof callback !== 'function' ) ? () => {} : callback;
    }

    const converted = this.scramble.converted;
    
    const move = converted[ 0 ];
   
    const layer = this.getLayer( move.position );
    
    this.flipAxis = new THREE.Vector3();
    this.flipAxis[ move.axis ] = 1;

    
    this.selectLayer( layer );

    this.rotateLayer( move.angle, true, () => {
      
      converted.shift();

      if ( converted.length > 0 ) {
        this.scrambleCube();
      } else {
        this.scramble = null;
        this.game.storage.saveGame();
      }
    } );

  }

  private getIntersect( position: any, object: any, multiple: boolean ) {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(
      this.draggable.convertPosition( position.clone() ),
      this.game.world.camera
    );

    const intersect = ( multiple )
      ? raycaster.intersectObjects( object )
      : raycaster.intersectObject( object );

    return ( intersect.length > 0 ) ? intersect[ 0 ] : false;

  }

  private getMainAxis( vector: any ) {

    return Object.keys( vector ).reduce(
      ( a, b ) => Math.abs( vector[ a ] ) > Math.abs( vector[ b ] ) ? a : b
    );

  }

  private addMomentumPoint( delta: any ) {

    const time = Date.now();

    this.momentum = this.momentum.filter( moment => time - moment.time < 500 );

    if ( delta !== false ) this.momentum.push( { delta, time } );

  }

  private getMomentum() {

    const points = this.momentum.length;
    const momentum:any = new THREE.Vector2();

    this.addMomentumPoint( false );

    this.momentum.forEach( ( point:any, index ) => {

      momentum.add( point.delta.multiplyScalar( index / points ) );

    } );

    return momentum;

  }

  private roundAngle( angle: number ) {

    const round = Math.PI / 2;
    return Math.sign( angle ) * Math.round( Math.abs( angle) / round ) * round;

  }

  private snapRotation( angle: any ) {

    return angle.set(
      this.roundAngle( angle.x ),
      this.roundAngle( angle.y ),
      this.roundAngle( angle.z )
    );

  }

  private checkIsSolved() {

    // const start = performance.now();

    let solved = true;
    const sides:any = { 'x-': [], 'x+': [], 'y-': [], 'y+': [], 'z-': [], 'z+': [] };

    this.game.cube.edges.forEach( (edge: any) => {

      const position = edge.parent.localToWorld( edge.position.clone() ).sub( this.game.cube.object.position );

      const mainAxis = this.getMainAxis( position );
      const mainSign = position.multiplyScalar( 2 ).round()[ mainAxis ] < 1 ? '-' : '+';

      sides[ mainAxis + mainSign ].push( edge.name );

    } );

    Object.keys( sides ).forEach( side => {
      if ( ! sides[ side ].every( (value:any) => value === sides[ side ][ 0 ] ) ) solved = false;
    } );

    if ( solved ) this.onSolved();

  }

}