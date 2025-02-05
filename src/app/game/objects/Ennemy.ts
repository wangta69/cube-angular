
import * as THREE from 'three';
import { Colors } from './Constants';
export class Ennemy {

  private parent;
  private mesh;
  private angle;
  private dist;
  constructor(parent: any) {
    this.parent = parent;

    const geom = new THREE.TetrahedronGeometry(8,2);
    const mat = new THREE.MeshPhongMaterial({
      color:Colors.red,
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
