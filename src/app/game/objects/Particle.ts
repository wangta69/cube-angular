import * as THREE from 'three';
export class Particle {

  private confetti;
  private options;

  private velocity:THREE.Vector3;
  private force:THREE.Vector3;

  private mesh:any;
  // private mesh:THREE.Mesh;
  private completed!:boolean;
  private color!:THREE.Color;
  private speed!:number;
  private revolutionSpeed!:number;
  private revolutionAxis!:string;

  private size;


  constructor( confetti: any ) {

    this.confetti = confetti;
    this.options = this.confetti.options;

    this.velocity = new THREE.Vector3();
    this.force = new THREE.Vector3();

    this.mesh = new THREE.Mesh( this.confetti.geometry, this.confetti.material.clone() );
    this.confetti.object.add( this.mesh );

    this.size = THREE.MathUtils.randFloat( this.options.size.min, this.options.size.max );
    this.mesh.scale.set( this.size, this.size, this.size );

 

  }

  reset( randomHeight = true ) {

    this.completed = false;

    this.color = new THREE.Color( this.options.colors[ Math.floor( Math.random() * this.options.colors.length ) ] );
    this.mesh.material.color.set( this.color );

    this.speed = THREE.MathUtils.randFloat( this.options.speed.min, this.options.speed.max ) * - 1;
    this.mesh.position.x = THREE.MathUtils.randFloat( - this.confetti.width / 2, this.confetti.width / 2 );
    this.mesh.position.y = ( randomHeight )
      ? THREE.MathUtils.randFloat( this.size, this.confetti.height + this.size )
      : this.size;

    this.revolutionSpeed = THREE.MathUtils.randFloat( this.options.revolution.min, this.options.revolution.max );
    this.revolutionAxis = [ 'x', 'y', 'z' ][ Math.floor( Math.random() * 3 ) ];
    this.mesh.rotation.set( Math.random() * Math.PI / 3, Math.random() * Math.PI / 3, Math.random() * Math.PI / 3 );

  }

  stop() {

    this.completed = true;
    this.confetti.completed ++;

  }

  update( delta:number ) {

    this.mesh.position.y += this.speed * delta;
    this.mesh.rotation[ this.revolutionAxis ] += this.revolutionSpeed;

    if ( this.mesh.position.y < - this.confetti.height - this.size )
      ( this.confetti.playing ) ? this.reset( false ) : this.stop();

  }

}
