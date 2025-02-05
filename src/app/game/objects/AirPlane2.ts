
import * as THREE from 'three';
import { Colors } from './Constants';
import { Pilot2 as Pilot } from './Pilot2';
export class AirPlane2 {

  private parent;
  private mesh;
  private propeller: any;
  private pilot: any;

  constructor(
    parent: any
  ) { 
    this.parent = parent;
    this.mesh = new THREE.Object3D();
    this.mesh.name = "airPlane";

    // Cabin
    const geomCabin = new THREE.BoxGeometry(80,50,50,1,1,1);
    const matCabin = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
    
    const positionAttribute = geomCabin.getAttribute('position');
    const vertex = new THREE.Vector3();
    
    vertex.fromBufferAttribute(positionAttribute, 4).y-=10;
    vertex.fromBufferAttribute(positionAttribute, 4).z+=20;
    vertex.fromBufferAttribute(positionAttribute, 5).y-=10;
    vertex.fromBufferAttribute(positionAttribute, 5).z-=20;
    vertex.fromBufferAttribute(positionAttribute, 6).y+=30;
    vertex.fromBufferAttribute(positionAttribute, 6).z+=20;
    vertex.fromBufferAttribute(positionAttribute, 7).y+=30;
    vertex.fromBufferAttribute(positionAttribute, 7).z-=20;

    const cabin = new THREE.Mesh(geomCabin, matCabin);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    this.mesh.add(cabin);

    // Engine

    const geomEngine = new THREE.BoxGeometry(20,50,50,1,1,1);
    const matEngine = new THREE.MeshPhongMaterial({color:Colors.white, flatShading: true});
    const engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 50;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // Tail Plane
    const geomTailPlane = new THREE.BoxGeometry(15,20,5,1,1,1);
    const matTailPlane = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
    const tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-40,20,0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // Wings

    const geomSideWing = new THREE.BoxGeometry(30,5,120,1,1,1);
    const matSideWing = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
    const sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.set(0,15,0);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    const geomWindshield = new THREE.BoxGeometry(3,15,20,1,1,1);
    const matWindshield = new THREE.MeshPhongMaterial({color:Colors.white,transparent:true, opacity:.3, flatShading: true});;
    const windshield = new THREE.Mesh(geomWindshield, matWindshield);
    windshield.position.set(5,27,0);

    windshield.castShadow = true;
    windshield.receiveShadow = true;

    this.mesh.add(windshield);

    const geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
    const geomPropellerPositionAttribute = geomPropeller.getAttribute('position');
    const geomPropellerVertex = new THREE.Vector3();

    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 4).y-=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 4).z+=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 5).y-=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 5).z-=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 6).y+=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 6).z+=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 7).y+=5;
    geomPropellerVertex.fromBufferAttribute(geomPropellerPositionAttribute, 7).z-=5;

    const matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading: true});
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);

    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    const geomBlade = new THREE.BoxGeometry(1,80,10,1,1,1);
    const matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading: true});
    const blade1 = new THREE.Mesh(geomBlade, matBlade);
    blade1.position.set(8,0,0);

    blade1.castShadow = true;
    blade1.receiveShadow = true;

    const blade2 = blade1.clone();
    blade2.rotation.x = Math.PI/2;

    blade2.castShadow = true;
    blade2.receiveShadow = true;

    this.propeller.add(blade1);
    this.propeller.add(blade2);
    this.propeller.position.set(60,0,0);
    this.mesh.add(this.propeller);

    const wheelProtecGeom = new THREE.BoxGeometry(30,15,10,1,1,1);
    const wheelProtecMat = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
    const wheelProtecR = new THREE.Mesh(wheelProtecGeom,wheelProtecMat);
    wheelProtecR.position.set(25,-20,25);
    this.mesh.add(wheelProtecR);

    const wheelTireGeom = new THREE.BoxGeometry(24,24,4);
    const wheelTireMat = new THREE.MeshPhongMaterial({color:Colors.brownDark, flatShading: true});
    const wheelTireR = new THREE.Mesh(wheelTireGeom,wheelTireMat);
    wheelTireR.position.set(25,-28,25);

    const wheelAxisGeom = new THREE.BoxGeometry(10,10,6);
    const wheelAxisMat = new THREE.MeshPhongMaterial({color:Colors.brown, flatShading: true});
    const wheelAxis = new THREE.Mesh(wheelAxisGeom,wheelAxisMat);
    wheelTireR.add(wheelAxis);

    this.mesh.add(wheelTireR);

    const wheelProtecL = wheelProtecR.clone();
    wheelProtecL.position.z = -wheelProtecR.position.z ;
    this.mesh.add(wheelProtecL);

    const wheelTireL = wheelTireR.clone();
    wheelTireL.position.z = -wheelTireR.position.z;
    this.mesh.add(wheelTireL);

    const wheelTireB = wheelTireR.clone();
    wheelTireB.scale.set(.5,.5,.5);
    wheelTireB.position.set(-35,-5,0);
    this.mesh.add(wheelTireB);

    const suspensionGeom = new THREE.BoxGeometry(4,20,4);
    suspensionGeom.applyMatrix4(new THREE.Matrix4().makeTranslation(0,10,0))
    const suspensionMat = new THREE.MeshPhongMaterial({color:Colors.red, flatShading: true});
    const suspension = new THREE.Mesh(suspensionGeom,suspensionMat);
    suspension.position.set(-35,-5,0);
    suspension.rotation.z = -.3;
    this.mesh.add(suspension);

    this.pilot = new Pilot(this.parent);
    this.pilot.mesh.position.set(-10,27,0);
    this.mesh.add(this.pilot.mesh);


    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
  }
}
