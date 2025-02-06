import * as THREE from 'three';
export class RoundedBoxGeometry extends THREE.BufferGeometry {

  private radiusSegments: number = 0;
    
  private width: number;
  private height: number; 
  private depth: number;
    
  private radius: number;
    
  private edgeHalfWidth: number;
  private edgeHalfHeight: number;
  private edgeHalfDepth: number;
    

  // private type: string;
  private parameters: any;

  private rs1: number;
  private totalVertexCount: number;
    
  private positions:THREE.BufferAttribute;
  private normals:THREE.BufferAttribute;
    
  private  cornerVerts:any[][] = [];
  private cornerNormals = [];
  private normal = new THREE.Vector3();
  private vertex = new THREE.Vector3();
  private vertexPool = [];
  private normalPool = [];
  private indices = [];

    
  private lastVertex: number;
  private cornerVertNumber: number;



  constructor(size: number, radius: number, radiusSegments: number ) {
    super();
    // this.attributes['type'] = 'RoundedBoxGeometry';
    // this.type = 'RoundedBoxGeometry';

    this.radiusSegments = ! isNaN( radiusSegments ) ? Math.max( 1, Math.floor( radiusSegments ) ) : 1;
    

    
    this.width = this.height = this.depth = size;
    this.radius = size * radius;
    
    this.radius = Math.min( this.radius, Math.min( this.width, Math.min( this.height, Math.min( this.depth ) ) ) / 2 );
    
    this.edgeHalfWidth = this.width / 2 - radius;
    this.edgeHalfHeight = this.height / 2 - radius;
    this.edgeHalfDepth = this.depth / 2 - radius;
    
      this.parameters = {
        width: this.width,
        height: this.height,
        depth: this.depth,
        radius: radius,
        radiusSegments: this.radiusSegments
      };
    
      this.rs1 = this.radiusSegments + 1;
      this.totalVertexCount = ( this.rs1 * this.radiusSegments + 1 ) << 3;
    
      this.positions = new THREE.BufferAttribute( new Float32Array( this.totalVertexCount * 3 ), 3 );
      this.normals = new THREE.BufferAttribute( new Float32Array( this.totalVertexCount * 3 ), 3 );

    
      this.lastVertex = this.rs1 * this.radiusSegments,
      this.cornerVertNumber = this.rs1 * this.radiusSegments + 1;
    
      this.doVertices();
      this.doFaces();
      this.doCorners();
      this.doHeightEdges();
      this.doWidthEdges();
      this.doDepthEdges();
    
 
  }


  private doVertices() {
    
    const cornerLayout = [
      new THREE.Vector3( 1, 1, 1 ),
      new THREE.Vector3( 1, 1, - 1 ),
      new THREE.Vector3( - 1, 1, - 1 ),
      new THREE.Vector3( - 1, 1, 1 ),
      new THREE.Vector3( 1, - 1, 1 ),
      new THREE.Vector3( 1, - 1, - 1 ),
      new THREE.Vector3( - 1, - 1, - 1 ),
      new THREE.Vector3( - 1, - 1, 1 )
    ];

    for ( let j = 0; j < 8; j ++ ) {

      this.cornerVerts.push( [] );
      this.cornerNormals.push( [] );

    }

    const PIhalf = Math.PI / 2;
    const cornerOffset = new THREE.Vector3( this.edgeHalfWidth, this.edgeHalfHeight, this.edgeHalfDepth );

    for ( let y = 0; y <= this.radiusSegments; y ++ ) {

      const v = y / this.radiusSegments;
      const va = v * PIhalf;
      const cosVa = Math.cos( va );
      const sinVa = Math.sin( va );

      if ( y == this.radiusSegments ) {

        this.vertex.set( 0, 1, 0 );
        const vert = this.vertex.clone().multiplyScalar( this.radius ).add( cornerOffset );
        this.cornerVerts[ 0 ].push( vert );
        this.vertexPool.push( vert );
        const norm = this.vertex.clone();
        this.cornerNormals[ 0 ].push( norm );
        this.normalPool.push( norm );
        continue;

      }

      for ( let x = 0; x <= this.radiusSegments; x ++ ) {

        const u = x / this.radiusSegments;
        const ha = u * PIhalf;
        this.vertex.x = cosVa * Math.cos( ha );
        this.vertex.y = sinVa;
        this.vertex.z = cosVa * Math.sin( ha );

        const vert = this.vertex.clone().multiplyScalar( this.radius ).add( cornerOffset );
        this.cornerVerts[ 0 ].push( vert );
        this.vertexPool.push( vert );

        const norm = vertex.clone().normalize();
        this.cornerNormals[ 0 ].push( norm );
        this.normalPool.push( norm );

      }

    }

    for ( let i = 1; i < 8; i ++ ) {

      for ( let j = 0; j < this.cornerVerts[ 0 ].length; j ++ ) {

        const vert = cornerVerts[ 0 ][ j ].clone().multiply( cornerLayout[ i ] );
        this.cornerVerts[ i ].push( vert );
        this.vertexPool.push( vert );

        const norm = this.cornerNormals[ 0 ][ j ].clone().multiply( cornerLayout[ i ] );
        this.cornerNormals[ i ].push( norm );
        this.normalPool.push( norm );

      }

    }

  }

  private doCorners() {

    const flips = [
      true,
      false,
      true,
      false,
      false,
      true,
      false,
      true
    ];

    const lastRowOffset = this.rs1 * ( this.radiusSegments - 1 );

    for ( let i = 0; i < 8; i ++ ) {

      const cornerOffset = this.cornerVertNumber * i;

      for ( let v = 0; v < this.radiusSegments - 1; v ++ ) {

        const r1 = v * this.rs1;
        const r2 = ( v + 1 ) * this.rs1;

        for ( let u = 0; u < this.radiusSegments; u ++ ) {

          const u1 = u + 1;
          const a: number = cornerOffset + r1 + u;
          const b = cornerOffset + r1 + u1;
          const c = cornerOffset + r2 + u;
          const d = cornerOffset + r2 + u1;

          if ( ! flips[ i ] ) {

            this.indices.push( a );
            this.indices.push( b );
            this.indices.push( c );

            this.indices.push( b );
            this.indices.push( d );
            this.indices.push( c );

          } else {

            this.indices.push( a );
            this.indices.push( c );
            this.indices.push( b );

            this.indices.push( b );
            this.indices.push( c );
            this.indices.push( d );

          }

        }

      }

      for ( let u = 0; u < this.radiusSegments; u ++ ) {

        const a = cornerOffset + lastRowOffset + u;
        const b = cornerOffset + lastRowOffset + u + 1;
        const c = cornerOffset + this.lastVertex;

        if ( ! flips[ i ] ) {

          this.indices.push( a );
          this.indices.push( b );
          this.indices.push( c );

        } else {

          this.indices.push( a );
          this.indices.push( c );
          this.indices.push( b );

        }

      }

    }

  }
  
  private doFaces() {

    let a = this.lastVertex;
    let b = this.lastVertex + this.cornerVertNumber;
    let c = this.lastVertex + this.cornerVertNumber * 2;
    let d = this.lastVertex + this.cornerVertNumber * 3;

    this.indices.push( a );
    this.indices.push( b );
    this.indices.push( c );
    this.indices.push( a );
    this.indices.push( c );
    this.indices.push( d );

    a = this.lastVertex + this.cornerVertNumber * 4;
    b = this.lastVertex + this.cornerVertNumber * 5;
    c = this.lastVertex + this.cornerVertNumber * 6;
    d = this.lastVertex + this.cornerVertNumber * 7;

    this.indices.push( a );
    this.indices.push( c );
    this.indices.push( b );
    this.indices.push( a );
    this.indices.push( d );
    this.indices.push( c );

    a = 0;
    b = this.cornerVertNumber;
    c = this.cornerVertNumber * 4;
    d = this.cornerVertNumber * 5;

    this.indices.push( a );
    this.indices.push( c );
    this.indices.push( b );
    this.indices.push( b );
    this.indices.push( c );
    this.indices.push( d );

    a = this.cornerVertNumber * 2;
    b = this.cornerVertNumber * 3;
    c = this.cornerVertNumber * 6;
    d = this.cornerVertNumber * 7;

    this.indices.push( a );
    this.indices.push( c );
    this.indices.push( b );
    this.indices.push( b );
    this.indices.push( c );
    this.indices.push( d );

    a = this.radiusSegments;
    b = this.radiusSegments + this.cornerVertNumber * 3;
    c = this.radiusSegments + this.cornerVertNumber * 4;
    d = this.radiusSegments + this.cornerVertNumber * 7;

    this.indices.push( a );
    this.indices.push( b );
    this.indices.push( c );
    this.indices.push( b );
    this.indices.push( d );
    this.indices.push( c );

    a = this.radiusSegments + this.cornerVertNumber;
    b = this.radiusSegments + this.cornerVertNumber * 2;
    c = this.radiusSegments + this.cornerVertNumber * 5;
    d = this.radiusSegments + this.cornerVertNumber * 6;

    this.indices.push( a );
    this.indices.push( c );
    this.indices.push( b );
    this.indices.push( b );
    this.indices.push( c );
    this.indices.push( d );

  }
  
  private doHeightEdges() {

    for ( let i = 0; i < 4; i ++ ) {

      const cOffset = i * this.cornerVertNumber;
      const cRowOffset = 4 * this.cornerVertNumber + cOffset;
      const needsFlip = i & 1 === 1;

      for ( let u = 0; u < this.radiusSegments; u ++ ) {

        const u1 = u + 1;
        const a = cOffset + u;
        const b = cOffset + u1;
        const c = cRowOffset + u;
        const d = cRowOffset + u1;

        if ( ! needsFlip ) {

          this.indices.push( a );
          this.indices.push( b );
          this.indices.push( c );
          this.indices.push( b );
          this.indices.push( d );
          this.indices.push( c );

        } else {

          this.indices.push( a );
          this.indices.push( c );
          this.indices.push( b );
          this.indices.push( b );
          this.indices.push( c );
          this.indices.push( d );

        }

      }

    }

  }
  
  private doDepthEdges() {

    const cStarts = [ 0, 2, 4, 6 ];
    const cEnds = [ 1, 3, 5, 7 ];

    for ( let i = 0; i < 4; i ++ ) {

      const cStart = this.cornerVertNumber * cStarts[ i ];
      const cEnd = this.cornerVertNumber * cEnds[ i ];

      const needsFlip = 1 >= i;

      for ( let u = 0; u < this.radiusSegments; u ++ ) {

        const urs1 = u * this.rs1;
        const u1rs1 = ( u + 1 ) * this.rs1;

        const a = cStart + urs1;
        const b = cStart + u1rs1;
        const c = cEnd + urs1;
        const d = cEnd + u1rs1;

        if ( needsFlip ) {

          this.indices.push( a );
          this.indices.push( c );
          this.indices.push( b );
          this.indices.push( b );
          this.indices.push( c );
          this.indices.push( d );

        } else {

          this.indices.push( a );
          this.indices.push( b );
          this.indices.push( c );
          this.indices.push( b );
          this.indices.push( d );
          this.indices.push( c );

        }

      }

    }

  }
  
  private doWidthEdges() {

    const end = this.radiusSegments - 1;

    const cStarts = [ 0, 1, 4, 5 ];
    const cEnds = [ 3, 2, 7, 6 ];
    const needsFlip = [ 0, 1, 1, 0 ];

    for ( let i = 0; i < 4; i ++ ) {

      const cStart = cStarts[ i ] * this.cornerVertNumber;
      const cEnd = cEnds[ i ] * this.cornerVertNumber;

      for ( let u = 0; u <= end; u ++ ) {

        const a = cStart + this.radiusSegments + u * this.rs1;
        const b = cStart + ( u != end ? this.radiusSegments + ( u + 1 ) * this.rs1 : this.cornerVertNumber - 1 );

        const c = cEnd + this.radiusSegments + u * this.rs1;
        const d = cEnd + ( u != end ? this.radiusSegments + ( u + 1 ) * this.rs1 : this.cornerVertNumber - 1 );

        if ( ! needsFlip[ i ] ) {

          this.indices.push( a );
          this.indices.push( b );
          this.indices.push( c );
          this.indices.push( b );
          this.indices.push( d );
          this.indices.push( c );

        } else {

          this.indices.push( a );
          this.indices.push( c );
          this.indices.push( b );
          this.indices.push( b );
          this.indices.push( c );
          this.indices.push( d );

        }

      }

    }

  }
  

}