
import * as THREE from 'three';
import { Colors } from './Constants';
export class Cloud1 {

  private parent;
  private mesh;
  constructor(parent: any) {
    this.parent = parent;

    this.mesh = new THREE.Object3D();
    this.mesh.name = "cloud";
    const geom = new THREE.BoxGeometry(20,20,20);
    const mat = new THREE.MeshPhongMaterial({
      color:Colors.white,
    });

    const nBlocs = 3+Math.floor(Math.random()*3);
    for (let i=0; i<nBlocs; i++ ){
      const m = new THREE.Mesh(geom.clone(), mat);
      m.position.x = i*15;
      m.position.y = Math.random()*10;
      m.position.z = Math.random()*10;
      m.rotation.z = Math.random()*Math.PI*2;
      m.rotation.y = Math.random()*Math.PI*2;
      const s = .1 + Math.random()*.9;
      m.scale.set(s,s,s);
      m.castShadow = true;
      m.receiveShadow = true;
      this.mesh.add(m);
    }
  }


}
