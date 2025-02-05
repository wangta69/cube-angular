
import * as THREE from 'three';
import { Ennemy } from './Ennemy';
import { Colors } from './Constants';
export class EnnemiesHolder {

  private parent;
  private mesh;
  private ennemiesInUse: any[];

  constructor(parent: any) {
    this.parent = parent;
    console.log('EnnemiesHolder constructor >> parent>>', this.parent);
    this.mesh = new THREE.Object3D();
    this.ennemiesInUse = [];
  }

  private spawnEnnemies(){
    const nEnnemies = this.parent.game.level;
  
    for (let i=0; i<nEnnemies; i++){
      let ennemy;
      if (this.parent.ennemiesPool.length) {
        ennemy = this.parent.ennemiesPool.pop();
      }else{
        ennemy = new Ennemy(parent);
      }
  
      ennemy.angle = - (i*0.1);
      ennemy.distance = this.parent.game.seaRadius + this.parent.game.planeDefaultHeight + (-1 + Math.random() * 2) * (this.parent.game.planeAmpHeight-20);
      ennemy.mesh.position.y = -this.parent.game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
      ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
  
      this.mesh.add(ennemy.mesh);
      this.ennemiesInUse.push(ennemy);
    }
  }


  private rotateEnnemies(){
    for (let i=0; i<this.ennemiesInUse.length; i++){
      const ennemy = this.ennemiesInUse[i];
      ennemy.angle += this.parent.game.speed*this.parent.deltaTime*this.parent.game.ennemiesSpeed;
  
      if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;
  
      ennemy.mesh.position.y = -this.parent.game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
      ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
      ennemy.mesh.rotation.z += Math.random()*.1;
      ennemy.mesh.rotation.y += Math.random()*.1;
  
      //const globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
      const diffPos = this.parent.airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
      const d = diffPos.length();
      if (d < this.parent.game.ennemyDistanceTolerance){
        console.log('this.parent:', this.parent);
        console.log('this.parent.particlesHolder:', this.parent.particlesHolder);
        this.parent.particlesHolder.spawnParticles(ennemy.mesh.position.clone(), 15, Colors.red, 3);
  
        this.parent.ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
        this.mesh.remove(ennemy.mesh);
        this.parent.game.planeCollisionSpeedX = 100 * diffPos.x / d;
        this.parent. game.planeCollisionSpeedY = 100 * diffPos.y / d;
        this.parent.ambientLight.intensity = 2;
  
        this.parent.removeEnergy();
        i--;
      }else if (ennemy.angle > Math.PI){
        this.parent.ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
        this.mesh.remove(ennemy.mesh);
        i--;
      }
    }
  }
}
