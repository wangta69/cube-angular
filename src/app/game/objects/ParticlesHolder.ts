
import * as THREE from 'three';
import { Particle } from './Particle';
export class ParticlesHolder {

  private parent;
  private mesh;
  private particlesInUse: any[];


  constructor(parent: any) {
    this.parent = parent;

    this.mesh = new THREE.Object3D();
    this.particlesInUse = [];
  }

  public spawnParticles(pos: any, density: any, color: string, scale: number){

    const nPArticles = density;
    for (let i=0; i<nPArticles; i++){
      let particle;
      if (this.parent.particlesPool.length) {
        particle = this.parent.particlesPool.pop();
      }else{
        particle = new Particle(parent);
      }
      this.mesh.add(particle.mesh);
      particle.mesh.visible = true;
      const _this = this;
      particle.mesh.position.y = pos.y;
      particle.mesh.position.x = pos.x;
      particle.explode(pos,color, scale);
    }
  }
}
