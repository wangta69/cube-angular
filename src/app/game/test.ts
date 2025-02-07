// Three.js - https://github.com/mrdoob/three.js/
// RoundedBoxGeometry - https://github.com/pailhead/three-rounded-box

import * as THREE from 'three';

class Animation {

  constructor( start ) {

    if ( start === true ) this.start();

  }

  start() {

    animationEngine.add( this );

  }

  stop() {

    animationEngine.remove( this );

  }

  update( delta ) {}

}

class World extends Animation {

  constructor( game ) {

    super( true );

    this.game = game;

    this.container = this.game.dom.game;
    this.scene = new THREE.Scene();

    this.renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.container.appendChild( this.renderer.domElement );

    this.camera = new THREE.PerspectiveCamera( 2, 1, 0.1, 10000 );

    this.stage = { width: 2, height: 3 };
    this.fov = 10;

    this.createLights();

    this.onResize = [];

    this.resize();
    window.addEventListener( 'resize', () => this.resize(), false );

  }

  update() {

    this.renderer.render( this.scene, this.camera );

  }

  resize() {

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

    if ( this.onResize ) this.onResize.forEach( cb => cb() );

  }

  createLights() {

    this.lights = {
      holder:  new THREE.Object3D,
      ambient: new THREE.AmbientLight( 0xffffff, 0.69 ),
      front:   new THREE.DirectionalLight( 0xffffff, 0.36 ),
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

function RoundedBoxGeometry( size, radius, radiusSegments ) {

  THREE.BufferGeometry.call( this );

  this.type = 'RoundedBoxGeometry';

  radiusSegments = ! isNaN( radiusSegments ) ? Math.max( 1, Math.floor( radiusSegments ) ) : 1;

  var width, height, depth;

  width = height = depth = size;
  radius = size * radius;

  radius = Math.min( radius, Math.min( width, Math.min( height, Math.min( depth ) ) ) / 2 );

  var edgeHalfWidth = width / 2 - radius;
  var edgeHalfHeight = height / 2 - radius;
  var edgeHalfDepth = depth / 2 - radius;

  this.parameters = {
    width: width,
    height: height,
    depth: depth,
    radius: radius,
    radiusSegments: radiusSegments
  };

  var rs1 = radiusSegments + 1;
  var totalVertexCount = ( rs1 * radiusSegments + 1 ) << 3;

  var positions = new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );
  var normals = new THREE.BufferAttribute( new Float32Array( totalVertexCount * 3 ), 3 );

  var
    cornerVerts = [],
    cornerNormals = [],
    normal = new THREE.Vector3(),
    vertex = new THREE.Vector3(),
    vertexPool = [],
    normalPool = [],
    indices = []
  ;

  var
    lastVertex = rs1 * radiusSegments,
    cornerVertNumber = rs1 * radiusSegments + 1
  ;

  doVertices();
  doFaces();
  doCorners();
  doHeightEdges();
  doWidthEdges();
  doDepthEdges();

  function doVertices() {

    var cornerLayout = [
      new THREE.Vector3( 1, 1, 1 ),
      new THREE.Vector3( 1, 1, - 1 ),
      new THREE.Vector3( - 1, 1, - 1 ),
      new THREE.Vector3( - 1, 1, 1 ),
      new THREE.Vector3( 1, - 1, 1 ),
      new THREE.Vector3( 1, - 1, - 1 ),
      new THREE.Vector3( - 1, - 1, - 1 ),
      new THREE.Vector3( - 1, - 1, 1 )
    ];

    for ( var j = 0; j < 8; j ++ ) {

      cornerVerts.push( [] );
      cornerNormals.push( [] );

    }

    var PIhalf = Math.PI / 2;
    var cornerOffset = new THREE.Vector3( edgeHalfWidth, edgeHalfHeight, edgeHalfDepth );

    for ( var y = 0; y <= radiusSegments; y ++ ) {

      var v = y / radiusSegments;
      var va = v * PIhalf;
      var cosVa = Math.cos( va );
      var sinVa = Math.sin( va );

      if ( y == radiusSegments ) {

        vertex.set( 0, 1, 0 );
        var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
        cornerVerts[ 0 ].push( vert );
        vertexPool.push( vert );
        var norm = vertex.clone();
        cornerNormals[ 0 ].push( norm );
        normalPool.push( norm );
        continue;

      }

      for ( var x = 0; x <= radiusSegments; x ++ ) {

        var u = x / radiusSegments;
        var ha = u * PIhalf;
        vertex.x = cosVa * Math.cos( ha );
        vertex.y = sinVa;
        vertex.z = cosVa * Math.sin( ha );

        var vert = vertex.clone().multiplyScalar( radius ).add( cornerOffset );
        cornerVerts[ 0 ].push( vert );
        vertexPool.push( vert );

        var norm = vertex.clone().normalize();
        cornerNormals[ 0 ].push( norm );
        normalPool.push( norm );

      }

    }

    for ( var i = 1; i < 8; i ++ ) {

      for ( var j = 0; j < cornerVerts[ 0 ].length; j ++ ) {

        var vert = cornerVerts[ 0 ][ j ].clone().multiply( cornerLayout[ i ] );
        cornerVerts[ i ].push( vert );
        vertexPool.push( vert );

        var norm = cornerNormals[ 0 ][ j ].clone().multiply( cornerLayout[ i ] );
        cornerNormals[ i ].push( norm );
        normalPool.push( norm );

      }

    }

  }

  function doCorners() {

    var flips = [
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      true
    ];

    var lastRowOffset = rs1 * ( radiusSegments - 1 );

    for ( var i = 0; i < 8; i ++ ) {

      var cornerOffset = cornerVertNumber * i;

      for ( var v = 0; v < radiusSegments - 1; v ++ ) {

        var r1 = v * rs1;
        var r2 = ( v + 1 ) * rs1;

        for ( var u = 0; u < radiusSegments; u ++ ) {

          var u1 = u + 1;
          var a = cornerOffset + r1 + u;
          var b = cornerOffset + r1 + u1;
          var c = cornerOffset + r2 + u;
          var d = cornerOffset + r2 + u1;

          if ( ! flips[ i ] ) {

            indices.push( a );
            indices.push( b );
            indices.push( c );

            indices.push( b );
            indices.push( d );
            indices.push( c );

          } else {

            indices.push( a );
            indices.push( c );
            indices.push( b );

            indices.push( b );
            indices.push( c );
            indices.push( d );

          }

        }

      }

      for ( var u = 0; u < radiusSegments; u ++ ) {

        var a = cornerOffset + lastRowOffset + u;
        var b = cornerOffset + lastRowOffset + u + 1;
        var c = cornerOffset + lastVertex;

        if ( ! flips[ i ] ) {

          indices.push( a );
          indices.push( b );
          indices.push( c );

        } else {

          indices.push( a );
          indices.push( c );
          indices.push( b );

        }

      }

    }

  }

  function doFaces() {

    var a = lastVertex;
    var b = lastVertex + cornerVertNumber;
    var c = lastVertex + cornerVertNumber * 2;
    var d = lastVertex + cornerVertNumber * 3;

    indices.push( a );
    indices.push( b );
    indices.push( c );
    indices.push( a );
    indices.push( c );
    indices.push( d );

    a = lastVertex + cornerVertNumber * 4;
    b = lastVertex + cornerVertNumber * 5;
    c = lastVertex + cornerVertNumber * 6;
    d = lastVertex + cornerVertNumber * 7;

    indices.push( a );
    indices.push( c );
    indices.push( b );
    indices.push( a );
    indices.push( d );
    indices.push( c );

    a = 0;
    b = cornerVertNumber;
    c = cornerVertNumber * 4;
    d = cornerVertNumber * 5;

    indices.push( a );
    indices.push( c );
    indices.push( b );
    indices.push( b );
    indices.push( c );
    indices.push( d );

    a = cornerVertNumber * 2;
    b = cornerVertNumber * 3;
    c = cornerVertNumber * 6;
    d = cornerVertNumber * 7;

    indices.push( a );
    indices.push( c );
    indices.push( b );
    indices.push( b );
    indices.push( c );
    indices.push( d );

    a = radiusSegments;
    b = radiusSegments + cornerVertNumber * 3;
    c = radiusSegments + cornerVertNumber * 4;
    d = radiusSegments + cornerVertNumber * 7;

    indices.push( a );
    indices.push( b );
    indices.push( c );
    indices.push( b );
    indices.push( d );
    indices.push( c );

    a = radiusSegments + cornerVertNumber;
    b = radiusSegments + cornerVertNumber * 2;
    c = radiusSegments + cornerVertNumber * 5;
    d = radiusSegments + cornerVertNumber * 6;

    indices.push( a );
    indices.push( c );
    indices.push( b );
    indices.push( b );
    indices.push( c );
    indices.push( d );

  }

  function doHeightEdges() {

    for ( var i = 0; i < 4; i ++ ) {

      var cOffset = i * cornerVertNumber;
      var cRowOffset = 4 * cornerVertNumber + cOffset;
      var needsFlip = i & 1 === 1;

      for ( var u = 0; u < radiusSegments; u ++ ) {

        var u1 = u + 1;
        var a = cOffset + u;
        var b = cOffset + u1;
        var c = cRowOffset + u;
        var d = cRowOffset + u1;

        if ( ! needsFlip ) {

          indices.push( a );
          indices.push( b );
          indices.push( c );
          indices.push( b );
          indices.push( d );
          indices.push( c );

        } else {

          indices.push( a );
          indices.push( c );
          indices.push( b );
          indices.push( b );
          indices.push( c );
          indices.push( d );

        }

      }

    }

  }

  function doDepthEdges() {

    var cStarts = [ 0, 2, 4, 6 ];
    var cEnds = [ 1, 3, 5, 7 ];

    for ( var i = 0; i < 4; i ++ ) {

      var cStart = cornerVertNumber * cStarts[ i ];
      var cEnd = cornerVertNumber * cEnds[ i ];

      var needsFlip = 1 >= i;

      for ( var u = 0; u < radiusSegments; u ++ ) {

        var urs1 = u * rs1;
        var u1rs1 = ( u + 1 ) * rs1;

        var a = cStart + urs1;
        var b = cStart + u1rs1;
        var c = cEnd + urs1;
        var d = cEnd + u1rs1;

        if ( needsFlip ) {

          indices.push( a );
          indices.push( c );
          indices.push( b );
          indices.push( b );
          indices.push( c );
          indices.push( d );

        } else {

          indices.push( a );
          indices.push( b );
          indices.push( c );
          indices.push( b );
          indices.push( d );
          indices.push( c );

        }

      }

    }

  }

  function doWidthEdges() {

    var end = radiusSegments - 1;

    var cStarts = [ 0, 1, 4, 5 ];
    var cEnds = [ 3, 2, 7, 6 ];
    var needsFlip = [ 0, 1, 1, 0 ];

    for ( var i = 0; i < 4; i ++ ) {

      var cStart = cStarts[ i ] * cornerVertNumber;
      var cEnd = cEnds[ i ] * cornerVertNumber;

      for ( var u = 0; u <= end; u ++ ) {

        var a = cStart + radiusSegments + u * rs1;
        var b = cStart + ( u != end ? radiusSegments + ( u + 1 ) * rs1 : cornerVertNumber - 1 );

        var c = cEnd + radiusSegments + u * rs1;
        var d = cEnd + ( u != end ? radiusSegments + ( u + 1 ) * rs1 : cornerVertNumber - 1 );

        if ( ! needsFlip[ i ] ) {

          indices.push( a );
          indices.push( b );
          indices.push( c );
          indices.push( b );
          indices.push( d );
          indices.push( c );

        } else {

          indices.push( a );
          indices.push( c );
          indices.push( b );
          indices.push( b );
          indices.push( c );
          indices.push( d );

        }

      }

    }

  }

  var index = 0;

  for ( var i = 0; i < vertexPool.length; i ++ ) {

    positions.setXYZ(
      index,
      vertexPool[ i ].x,
      vertexPool[ i ].y,
      vertexPool[ i ].z
    );

    normals.setXYZ(
      index,
      normalPool[ i ].x,
      normalPool[ i ].y,
      normalPool[ i ].z
    );

    index ++;

  }

  this.setIndex( new THREE.BufferAttribute( new Uint16Array( indices ), 1 ) );
  this.addAttribute( 'position', positions );
  this.addAttribute( 'normal', normals );

}

RoundedBoxGeometry.prototype = Object.create( THREE.BufferGeometry.prototype );
RoundedBoxGeometry.constructor = RoundedBoxGeometry;

function RoundedPlaneGeometry( size, radius, depth ) {

  var x, y, width, height;

  x = y = - size / 2;
  width = height = size;
  radius = size * radius;

  const shape = new THREE.Shape();

  shape.moveTo( x, y + radius );
  shape.lineTo( x, y + height - radius );
  shape.quadraticCurveTo( x, y + height, x + radius, y + height );
  shape.lineTo( x + width - radius, y + height );
  shape.quadraticCurveTo( x + width, y + height, x + width, y + height - radius );
  shape.lineTo( x + width, y + radius );
  shape.quadraticCurveTo( x + width, y, x + width - radius, y );
  shape.lineTo( x + radius, y );
  shape.quadraticCurveTo( x, y, x, y + radius );

  const geometry = new THREE.ExtrudeBufferGeometry(
    shape,
    { depth: depth, bevelEnabled: false, curveSegments: 3 }
  );

  return geometry;

}

class Cube {

  constructor( game ) {

    this.game = game;
    this.size = 3;

    this.geometry = {
      pieceCornerRadius: 0.12,
      edgeCornerRoundness: 0.15,
      edgeScale: 0.82,
      edgeDepth: 0.01,
    };

    this.holder = new THREE.Object3D();
    this.object = new THREE.Object3D();
    this.animator = new THREE.Object3D();

    this.holder.add( this.animator );
    this.animator.add( this.object );

    this.game.world.scene.add( this.holder );

  }

  init() {

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

    this.pieces.forEach( piece => {

      this.cubes.push( piece.userData.cube );
      this.object.add( piece );

    } );

    this.holder.traverse( node => {

      if ( node.frustumCulled ) node.frustumCulled = false;

    } );

    this.updateColors( this.game.themes.getColors() );

    this.sizeGenerated = this.size;

  }

  resize( force = false ) {

    if ( this.size !== this.sizeGenerated || force ) {

      this.size = this.game.preferences.ranges.size.value;

      this.reset();
      this.init();

      this.game.saved = false;
      this.game.timer.reset();
      this.game.storage.clearGame();

    }

  }

  reset() {

    this.game.controls.edges.rotation.set( 0, 0, 0 );

    this.holder.rotation.set( 0, 0, 0 );
    this.object.rotation.set( 0, 0, 0 );
    this.animator.rotation.set( 0, 0, 0 );

  }

  generatePositions() {

    const m = this.size - 1;
    const first = this.size % 2 !== 0
      ? 0 - Math.floor(this.size / 2)
      : 0.5 - this.size / 2;

    let x, y, z;

    this.positions = [];

    for ( x = 0; x < this.size; x ++ ) {
      for ( y = 0; y < this.size; y ++ ) {
        for ( z = 0; z < this.size; z ++ ) {

          let position = new THREE.Vector3(first + x, first + y, first + z);
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

  generateModel() {

    this.pieces = [];
    this.edges = [];

    const pieceSize = 1 / 3;

    const mainMaterial = new THREE.MeshLambertMaterial();

    const pieceMesh = new THREE.Mesh(
      new RoundedBoxGeometry( pieceSize, this.geometry.pieceCornerRadius, 3 ),
      mainMaterial.clone()
    );

    const edgeGeometry = RoundedPlaneGeometry(
      pieceSize,
      this.geometry.edgeCornerRoundness,
      this.geometry.edgeDepth
    );

    this.positions.forEach( ( position, index ) => {

      const piece = new THREE.Object3D();
      const pieceCube = pieceMesh.clone();
      const pieceEdges = [];

      piece.position.copy( position.clone().divideScalar( 3 ) );
      piece.add( pieceCube );
      piece.name = index;
      piece.edgesName = '';

      position.edges.forEach( position => {

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

    } );

  }

  updateColors( colors ) {

    if ( typeof this.pieces !== 'object' && typeof this.edges !== 'object' ) return;

    this.pieces.forEach( piece => piece.userData.cube.material.color.setHex( colors.P ) );
    this.edges.forEach( edge => edge.material.color.setHex( colors[ edge.name ] ) );

  }

  loadFromData( data ) {

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




window.addEventListener( 'touchmove', () => {} );
document.addEventListener( 'touchmove',  event => { event.preventDefault(); }, { passive: false } );













const RangeHTML = [

  '<div class="range">',
    '<div class="range__label"></div>',
    '<div class="range__track">',
      '<div class="range__track-line"></div>',
      '<div class="range__handle"><div></div></div>',
    '</div>',
    '<div class="range__list"></div>',
  '</div>',

].join( '\n' );

document.querySelectorAll( 'range' ).forEach( el => {

  const temp = document.createElement( 'div' );
  temp.innerHTML = RangeHTML;

  const range = temp.querySelector( '.range' );
  const rangeLabel = range.querySelector( '.range__label' );
  const rangeList = range.querySelector( '.range__list' );

  range.setAttribute( 'name', el.getAttribute( 'name' ) );
  rangeLabel.innerHTML = el.getAttribute( 'title' );

  if ( el.hasAttribute( 'color' ) ) {

    range.classList.add( 'range--type-color' );
    range.classList.add( 'range--color-' + el.getAttribute( 'name' ) );

  }

  if ( el.hasAttribute( 'list' ) ) {

    el.getAttribute( 'list' ).split( ',' ).forEach( listItemText => {

      const listItem = document.createElement( 'div' );
      listItem.innerHTML = listItemText;
      rangeList.appendChild( listItem );

    } );

  }

  el.parentNode.replaceChild( range, el );

} );














const States = {
  3: {
    checkerboard: {
      names: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26 ],
      positions: [
        { "x": 1/3, "y": -1/3, "z": 1/3 },
        { "x": -1/3, "y": 1/3, "z": 0 },
        { "x": 1/3, "y": -1/3, "z": -1/3 },
        { "x": -1/3, "y": 0, "z": -1/3 },
        { "x": 1/3, "y": 0, "z": 0 },
        { "x": -1/3, "y": 0, "z": 1/3 },
        { "x": 1/3, "y": 1/3, "z": 1/3 },
        { "x": -1/3, "y": -1/3, "z": 0 },
        { "x": 1/3, "y": 1/3, "z": -1/3 },
        { "x": 0, "y": 1/3, "z": -1/3 },
        { "x": 0, "y": -1/3, "z": 0 },
        { "x": 0, "y": 1/3, "z": 1/3 },
        { "x": 0, "y": 0, "z": 1/3 },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": -1/3 },
        { "x": 0, "y": -1/3, "z": -1/3 },
        { "x": 0, "y": 1/3, "z": 0 },
        { "x": 0, "y": -1/3, "z": 1/3 },
        { "x": -1/3, "y": -1/3, "z": 1/3 },
        { "x": 1/3, "y": 1/3, "z": 0 },
        { "x": -1/3, "y": -1/3, "z": -1/3 },
        { "x": 1/3, "y": 0, "z": -1/3 },
        { "x": -1/3, "y": 0, "z": 0 },
        { "x": 1/3, "y": 0, "z": 1/3 },
        { "x": -1/3, "y": 1/3, "z": 1/3 },
        { "x": 1/3, "y": -1/3, "z": 0 },
        { "x": -1/3, "y": 1/3, "z": -1/3 }
      ],
      rotations: [
        { "x": -Math.PI, "y": 0, "z": Math.PI, },
        { "x": Math.PI, "y": 0, "z": 0 },
        { "x": -Math.PI, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": -Math.PI, "y": 0, "z": Math.PI },
        { "x": Math.PI, "y": 0, "z": 0 },
        { "x": -Math.PI, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": -Math.PI, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": Math.PI, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": -Math.PI, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": 0, "y": 0, "z": Math.PI },
        { "x": 0, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI },
        { "x": -Math.PI, "y": 0, "z": 0 },
        { "x": Math.PI, "y": 0, "z": Math.PI }
      ],
      size: 3,
    },
  }
};



const Icons = new IconsConverter( {

  icons: {
    settings: {
      viewbox: '0 0 512 512',
      content: '<path fill="currentColor" d="M444.788 291.1l42.616 24.599c4.867 2.809 7.126 8.618 5.459 13.985-11.07 35.642-29.97 67.842-54.689 94.586a12.016 12.016 0 0 1-14.832 2.254l-42.584-24.595a191.577 191.577 0 0 1-60.759 35.13v49.182a12.01 12.01 0 0 1-9.377 11.718c-34.956 7.85-72.499 8.256-109.219.007-5.49-1.233-9.403-6.096-9.403-11.723v-49.184a191.555 191.555 0 0 1-60.759-35.13l-42.584 24.595a12.016 12.016 0 0 1-14.832-2.254c-24.718-26.744-43.619-58.944-54.689-94.586-1.667-5.366.592-11.175 5.459-13.985L67.212 291.1a193.48 193.48 0 0 1 0-70.199l-42.616-24.599c-4.867-2.809-7.126-8.618-5.459-13.985 11.07-35.642 29.97-67.842 54.689-94.586a12.016 12.016 0 0 1 14.832-2.254l42.584 24.595a191.577 191.577 0 0 1 60.759-35.13V25.759a12.01 12.01 0 0 1 9.377-11.718c34.956-7.85 72.499-8.256 109.219-.007 5.49 1.233 9.403 6.096 9.403 11.723v49.184a191.555 191.555 0 0 1 60.759 35.13l42.584-24.595a12.016 12.016 0 0 1 14.832 2.254c24.718 26.744 43.619 58.944 54.689 94.586 1.667 5.366-.592 11.175-5.459 13.985L444.788 220.9a193.485 193.485 0 0 1 0 70.2zM336 256c0-44.112-35.888-80-80-80s-80 35.888-80 80 35.888 80 80 80 80-35.888 80-80z" />',
    },
    back: {
      viewbox: '0 0 512 512',
      content: '<path transform="translate(512, 0) scale(-1,1)" fill="currentColor" d="M503.691 189.836L327.687 37.851C312.281 24.546 288 35.347 288 56.015v80.053C127.371 137.907 0 170.1 0 322.326c0 61.441 39.581 122.309 83.333 154.132 13.653 9.931 33.111-2.533 28.077-18.631C66.066 312.814 132.917 274.316 288 272.085V360c0 20.7 24.3 31.453 39.687 18.164l176.004-152c11.071-9.562 11.086-26.753 0-36.328z" />',
    },
    trophy: {
      viewbox: '0 0 576 512',
      content: '<path fill="currentColor" d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 77.9 131.7 171.9 142.4C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6C498.4 275.6 576 210.3 576 144V88c0-13.3-10.7-24-24-24zM64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-47.5-16.4-77-49.9-77-70.2zm448 0c0 20.2-29.4 53.8-77 70.2 7-25 11.8-53.6 12.8-86.2H512v16zm-127.3 4.7l-39.6 38.6 9.4 54.6c1.7 9.8-8.7 17.2-17.4 12.6l-49-25.8-49 25.8c-8.8 4.6-19.1-2.9-17.4-12.6l9.4-54.6-39.6-38.6c-7.1-6.9-3.2-19 6.7-20.5l54.8-8 24.5-49.6c4.4-8.9 17.1-8.9 21.5 0l24.5 49.6 54.8 8c9.6 1.5 13.5 13.6 6.4 20.5z" />',
    },
    cancel: {
      viewbox: '0 0 352 512',
      content: '<path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z" />',
    },
    theme: {
      viewbox: '0 0 512 512',
      content: '<path fill="currentColor" d="M204.3 5C104.9 24.4 24.8 104.3 5.2 203.4c-37 187 131.7 326.4 258.8 306.7 41.2-6.4 61.4-54.6 42.5-91.7-23.1-45.4 9.9-98.4 60.9-98.4h79.7c35.8 0 64.8-29.6 64.9-65.3C511.5 97.1 368.1-26.9 204.3 5zM96 320c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm32-128c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128-64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 64c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/>',
    },
    reset: {
      viewbox: '0 0 512 512',
      content: '<path fill="currentColor" d="M370.72 133.28C339.458 104.008 298.888 87.962 255.848 88c-77.458.068-144.328 53.178-162.791 126.85-1.344 5.363-6.122 9.15-11.651 9.15H24.103c-7.498 0-13.194-6.807-11.807-14.176C33.933 94.924 134.813 8 256 8c66.448 0 126.791 26.136 171.315 68.685L463.03 40.97C478.149 25.851 504 36.559 504 57.941V192c0 13.255-10.745 24-24 24H345.941c-21.382 0-32.09-25.851-16.971-40.971l41.75-41.749zM32 296h134.059c21.382 0 32.09 25.851 16.971 40.971l-41.75 41.75c31.262 29.273 71.835 45.319 114.876 45.28 77.418-.07 144.315-53.144 162.787-126.849 1.344-5.363 6.122-9.15 11.651-9.15h57.304c7.498 0 13.194 6.807 11.807 14.176C478.067 417.076 377.187 504 256 504c-66.448 0-126.791-26.136-171.315-68.685L48.97 471.03C33.851 486.149 8 475.441 8 454.059V320c0-13.255 10.745-24 24-24z" />',
    },
    trash: {
      viewbox: '0 0 448 512',
      content: '<path fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z" />',
    },
  },

  convert: true,

} );


