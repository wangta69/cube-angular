
import * as THREE from 'three';
import { Coin } from './Coin';
export class CoinsHolder {

  private parent;
  private mesh = new THREE.Object3D();
  private coinsInUse: any[] = [];
  private coinsPool: any[] = [];

  constructor(parent: any, nCoins: number) {
    this.parent = parent;
    this.mesh = new THREE.Object3D();
    this.coinsInUse = [];
    this.coinsPool = [];
    for (let i=0; i<nCoins; i++){
      const coin = new Coin();
      this.coinsPool.push(coin);
    }
  }
  
  private spawnCoins() {

    const nCoins = 1 + Math.floor(Math.random()*10);
    const d = this.parent.game.seaRadius + this.parent.game.planeDefaultHeight + (-1 + Math.random() * 2) * (this.parent.game.planeAmpHeight-20);
    const amplitude = 10 + Math.round(Math.random()*10);
    for (let i=0; i<nCoins; i++){
      let coin;
      if (this.coinsPool.length) {
        coin = this.coinsPool.pop();
      }else{
        coin = new Coin();
      }
      this.mesh.add(coin.mesh);
      this.coinsInUse.push(coin);
      coin.angle = - (i*0.02);
      coin.distance = d + Math.cos(i*.5)*amplitude;
      coin.mesh.position.y = -this.parent.game.seaRadius + Math.sin(coin.angle)*coin.distance;
      coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
    }
  }


  private rotateCoins(){
    for (let i=0; i<this.coinsInUse.length; i++){
      const coin = this.coinsInUse[i];
      if (coin.exploding) continue;
      coin.angle += this.parent.game.speed*this.parent.deltaTime*this.parent.game.coinsSpeed;
      if (coin.angle>Math.PI*2) coin.angle -= Math.PI*2;
      coin.mesh.position.y = -this.parent.game.seaRadius + Math.sin(coin.angle)*coin.distance;
      coin.mesh.position.x = Math.cos(coin.angle)*coin.distance;
      coin.mesh.rotation.z += Math.random()*.1;
      coin.mesh.rotation.y += Math.random()*.1;
  
      //const globalCoinPosition =  coin.mesh.localToWorld(new THREE.Vector3());
      const diffPos = this.parent.airplane.mesh.position.clone().sub(coin.mesh.position.clone());
      const d = diffPos.length();
      if (d<this.parent.game.coinDistanceTolerance){
        this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
        this.mesh.remove(coin.mesh);
        this.parent.particlesHolder.spawnParticles(coin.mesh.position.clone(), 5, 0x009999, .8);
        this.parent.addEnergy();
        i--;
      }else if (coin.angle > Math.PI){
        this.coinsPool.unshift(this.coinsInUse.splice(i,1)[0]);
        this.mesh.remove(coin.mesh);
        i--;
      }
    }
  }
}
