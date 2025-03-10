
import * as THREE from 'three';
import {RoundedBoxGeometry} from './RoundedBoxGeometry';
import {RoundedPlaneGeometry} from './Functions';
// import { RoundedBoxGeometry } from './jsm/geometries/RoundedBoxGeometry.js';
type SizeRange = 2|3|4|5;

export class Cube {

  private game: any;
  //private size:number = 3;
  // private size:2|3|4|5 = 3
  public size:SizeRange = 3
  private scale!: number;
  private pieces: any[] = [];
  private edges: any;
  private geometry= {
    // pieceCornerRadius: 0.12,
    pieceCornerRadius: 0.05,
    edgeCornerRoundness: 0.15,
    edgeScale: 0.82,
    edgeDepth: 0.01,
  }
  private positions:any[] = [];

  private sizeGenerated!: number;

  private holder = new THREE.Object3D();
  private object = new THREE.Object3D();
  private animator = new THREE.Object3D();

  
  private cubes:any[] = [];
  
  constructor( game: any ) {

    this.game = game;
    this.size = game.storage.cubeSize;
    this.holder.add( this.animator );
    this.animator.add( this.object );

    this.game.world.scene.add( this.holder );
  }

  public init() {
    this.cubes = [];
    this.object.children = [];
    this.object.add( this.game.controls.group );

    if ( this.size === 2 ) this.scale = 1.25;
    else if ( this.size === 3 ) this.scale = 1;
    else if ( this.size > 3 ) this.scale = 3 / this.size;

    this.object.scale.set( this.scale, this.scale, this.scale );

    const controlsScale = this.size === 2 ? 0.825 : 1;
    this.game.controls.edges.scale.set( controlsScale, controlsScale, controlsScale );
    
    this.generatePositions();
    this.generateModel();

    this.pieces.forEach( (piece: any) => {
      this.cubes.push( piece.userData.cube );
      this.object.add( piece );
    } );

    this.holder.traverse( node => {
      if ( node.frustumCulled ) node.frustumCulled = false;
    } );

    this.updateColors( this.game.themes.getColors() );

    this.sizeGenerated = this.size;

  }

  public resize( force = false ) {

    if ( this.size !== this.sizeGenerated || force ) {

      this.size = this.game.preferences.ranges.size.value;

      this.reset();
      this.init();

      this.game.saved = false;
      this.game.timer.reset();
      this.game.storage.clearGame();

    }

  }

  public reset() {

    this.game.controls.edges.rotation.set( 0, 0, 0 );

    this.holder.rotation.set( 0, 0, 0 );
    this.object.rotation.set( 0, 0, 0 );
    this.animator.rotation.set( 0, 0, 0 );

  }

  private generatePositions() {

    const m = this.size - 1;
    const first = this.size % 2 !== 0
      ? 0 - Math.floor(this.size / 2)
      : 0.5 - this.size / 2;

    let x, y, z;

    this.positions = [];

    for ( x = 0; x < this.size; x ++ ) {
      for ( y = 0; y < this.size; y ++ ) {
        for ( z = 0; z < this.size; z ++ ) {

          let position: any = new THREE.Vector3(first + x, first + y, first + z);
          let edges = [];

          if ( x == 0 ) edges.push(0);
          if ( x == m ) edges.push(1);
          if ( y == 0 ) edges.push(2);
          if ( y == m ) edges.push(3);
          if ( z == 0 ) edges.push(4);
          if ( z == m ) edges.push(5);

          position.edges = edges;
          this.positions.push( position );

        }
      }
    }

  }

  private generateModel() {
    this.pieces = [];
    this.edges = [];

    const pieceSize = 1 / 3;

    const mainMaterial = new THREE.MeshLambertMaterial();

    const pieceMesh = new THREE.Mesh(
      new RoundedBoxGeometry( pieceSize, pieceSize, pieceSize, 3, this.geometry.pieceCornerRadius ),
      mainMaterial.clone()
    );

    const edgeGeometry = RoundedPlaneGeometry(
      pieceSize,
      this.geometry.edgeCornerRoundness,
      this.geometry.edgeDepth
    );

    this.positions.forEach( ( position, index ) => {

      const piece: any = new THREE.Object3D();
      const pieceCube = pieceMesh.clone();
      const pieceEdges: any = [];

      piece.position.copy( position.clone().divideScalar( 3 ) );
      piece.add( pieceCube );
      piece.name = index;
      piece.edgesName = '';

      position.edges.forEach( (position: any) => {

        const edge = new THREE.Mesh( edgeGeometry, mainMaterial.clone() );
        const name = [ 'L', 'R', 'D', 'U', 'B', 'F' ][ position ];
        const distance = pieceSize / 2;

        edge.position.set(
          distance * [ - 1, 1, 0, 0, 0, 0 ][ position ],
          distance * [ 0, 0, - 1, 1, 0, 0 ][ position ],
          distance * [ 0, 0, 0, 0, - 1, 1 ][ position ]
        );

        edge.rotation.set(
          Math.PI / 2 * [ 0, 0, 1, - 1, 0, 0 ][ position ],
          Math.PI / 2 * [ - 1, 1, 0, 0, 2, 0 ][ position ],
          0
        );

        edge.scale.set(
          this.geometry.edgeScale,
          this.geometry.edgeScale,
          this.geometry.edgeScale
        );

        edge.name = name;

        piece.add( edge );
        pieceEdges.push( name );
        this.edges.push( edge );

      } );

      piece.userData.edges = pieceEdges;
      piece.userData.cube = pieceCube;

      piece.userData.start = {
        position: piece.position.clone(),
        rotation: piece.rotation.clone(),
      };
      this.pieces.push( piece );
    });

  }

  private updateColors( colors: any ) {
    if ( typeof this.pieces !== 'object' && typeof this.edges !== 'object' ) return;
    this.pieces.forEach( piece => piece.userData.cube.material.color.setHex( colors.P ) );

    this.edges.forEach( (edge: any) => edge.material.color.setHex( colors[ edge.name ] ) );
  }

  public loadFromData( data: any ) {

    this.size = data.size;

    this.reset();
    this.init();

    this.pieces.forEach( piece => {

      const index = data.names.indexOf( piece.name );

      const position = data.positions[index];
      const rotation = data.rotations[index];

      piece.position.set( position.x, position.y, position.z );
      piece.rotation.set( rotation.x, rotation.y, rotation.z );
    } );
  }
}
