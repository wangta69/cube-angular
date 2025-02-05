
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { Colors } from './Constants';
export class Sea2 {

  private parent;
  private waves;
  private mesh;
  constructor(parent: any) {
    this.parent = parent;

    const geom = new THREE.CylinderGeometry(600,600,800,40,10);
    geom.applyMatrix4(new THREE.Matrix4().makeRotationX(-Math.PI/2));
    // geom.mergeVertices();
    BufferGeometryUtils.mergeVertices(geom);
    // const l = geom.vertices.length;
  
    const positionAttribute = geom.getAttribute('position');
    const vertex = new THREE.Vector3();
    const l = positionAttribute.count
    this.waves = [];
  
    for (let i=0;i<l;i++){
      // const v = geom.vertices[i];
      const v = vertex.fromBufferAttribute(positionAttribute, i);
      //v.y = Math.random()*30;
      this.waves.push({
        y:v.y,
        x:v.x,
        z:v.z,
        ang:Math.random()*Math.PI*2,
        amp:5 + Math.random()*15,
        speed:0.016 + Math.random()*0.032
      });
    };
    const mat = new THREE.MeshPhongMaterial({
      color:Colors.blue,
      transparent:true,
      opacity:.8,
      flatShading: true
    });
  
    this.mesh = new THREE.Mesh(geom, mat);
    // this.mesh.name = "waves";
    this.mesh.receiveShadow = true;
  }

  private moveWaves(){
    // const verts = this.mesh.geometry.vertices;
    // const l = verts.length;

    const positionAttribute = this.mesh.geometry.getAttribute('position');
    const vertex = new THREE.Vector3();
    const l = positionAttribute.count;

    for (let i=0; i<l; i++){
      // const v = verts[i];
      const v = vertex.fromBufferAttribute(positionAttribute, i);
      const vprops = this.waves[i];
      v.x =  vprops.x + Math.cos(vprops.ang)*vprops.amp;
      v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;
      vprops.ang += vprops.speed;
      // this.mesh.geometry.verticesNeedUpdate=true;
      (this.mesh.geometry.attributes as any).position.needsUpdate = true;
      // sea.mesh.rotation.z += .005; step2에서는 이 부부분이 있는데.....
    }
  }
}
