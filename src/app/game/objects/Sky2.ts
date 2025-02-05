
import * as THREE from 'three';
import { Cloud } from './Cloud';
export class Sky2 {

  private parent: any;
  private mesh = new THREE.Object3D();
  private nClouds = 20;
  private clouds: any[] = [];
  constructor(parent: any) {
    this.parent = parent;
    this.mesh = new THREE.Object3D();
    this.nClouds = 20;
    this.clouds = [];
    const stepAngle = Math.PI*2 / this.nClouds;

    for(let i=0; i<this.nClouds; i++){
      const c: any = new Cloud(parent);
      this.clouds.push(c);
      const a = stepAngle*i;
      const h = 750 + Math.random()*200;
      c.mesh.position.y = Math.sin(a)*h;
      c.mesh.position.x = Math.cos(a)*h;
      c.mesh.position.z = -400-Math.random()*400;
      c.mesh.rotation.z = a + Math.PI/2;
      const s = 1+Math.random()*2;
      c.mesh.scale.set(s,s,s);
      this.mesh.add(c.mesh);
    }
  }
  
  private moveClouds() {
    for(let i=0; i<this.nClouds; i++){
      const c = this.clouds[i];
      c.rotate();
    }
    this.mesh.rotation.z += this.parent.game.speed*this.parent.deltaTime;
  
  }
}
