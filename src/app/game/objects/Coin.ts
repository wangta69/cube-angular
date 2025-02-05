
import * as THREE from 'three';
export class Coin {

private mesh;
  private angle: number;
  private dist: number;

  constructor() {
    const geom = new THREE.TetrahedronGeometry(5,0);
    const mat = new THREE.MeshPhongMaterial({
      color:0x009999,
      shininess:0,
      specular:0xffffff,
      flatShading: true
    });
    this.mesh = new THREE.Mesh(geom,mat);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
  }
}
