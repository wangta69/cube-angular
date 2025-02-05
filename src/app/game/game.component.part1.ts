import { Component,OnInit,AfterViewInit,ViewChild,ElementRef } from '@angular/core';
import * as THREE from 'three';

import { AirPlane1 as  AirPlane} from './objects/AirPlane1';
import { Sea1 as Sea } from './objects/Sea1';
import { Sky1 as Sky } from './objects/Sky1';

@Component({
  selector: 'app-root',
  templateUrl: './game.html',
  styleUrls: ['./scss/demo.scss', './scss/game.scss', './scss/styles.scss']
})
export class GameComponent implements OnInit, AfterViewInit{

 

  // GAME VARIABLES
  private game: any;

    //THREEJS RELATED VARIABLES

  private scene: any;
  private camera: any;
  private fieldOfView: any;
  private aspectRatio: any;
  private nearPlane: any;
  private farPlane: any;
  private renderer: any;
  private container: any;

  // HTML Element
 // const fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;
  private fieldLevel: any;

  //SCREEN & MOUSE VARIABLES

  private HEIGHT!: number;
  private WIDTH!: number;
  private mousePos = { x: 0, y: 0 };

  // LIGHTS

  // private ambientLight: any;
  private hemisphereLight: any; 
  private shadowLight: any;


  // 3D Models
  private sea: any;
  private airplane: any;
  private sky: any;

  constructor(
  ) { 
  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.init();
  }


  //INIT THREE JS, SCREEN AND MOUSE EVENTS

  private createScene() {

    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;

    this.scene = new THREE.Scene();
    this.aspectRatio = this.WIDTH / this.HEIGHT;
    this.fieldOfView = 60;
    this.nearPlane = 1;
    this.farPlane = 10000;
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      this.aspectRatio,
      this.nearPlane,
      this.farPlane
    );
    this.scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
    this.camera.position.x = 0;
    this.camera.position.z = 200;
    this.camera.position.y = 100;
    // this.camera.position.y = this.game.planeDefaultHeight;
    //camera.lookAt(new THREE.Vector3(0, 400, 0));

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    this.renderer.shadowMap.enabled = true;

    this.container = document.getElementById('world');
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.handleWindowResize, false);

  }

  // MOUSE AND SCREEN EVENTS

  private handleWindowResize() {
    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.camera.aspect = this.WIDTH / this.HEIGHT;
    this.camera.updateProjectionMatrix();
  }

  private handleMouseMove(event: any) {
    const tx = -1 + (event.clientX / this.WIDTH)*2;
    const ty = 1 - (event.clientY / this.HEIGHT)*2;
    this.mousePos = {x:tx, y:ty};
  }

  private createLights() {

    this.hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
    this.shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    this.shadowLight.position.set(150, 350, 350);
    this.shadowLight.castShadow = true;
    this.shadowLight.shadow.camera.left = -400;
    this.shadowLight.shadow.camera.right = 400;
    this.shadowLight.shadow.camera.top = 400;
    this.shadowLight.shadow.camera.bottom = -400;
    this.shadowLight.shadow.camera.near = 1;
    this.shadowLight.shadow.camera.far = 1000;
    this.shadowLight.shadow.mapSize.width = 2048;
    this.shadowLight.shadow.mapSize.height = 2048;

    //scene.add(ch);
    this.scene.add(this.hemisphereLight);
    this.scene.add(this.shadowLight);
  }


  private createPlane(){
    this.airplane = new AirPlane(this);
    this.airplane.mesh.scale.set(.25,.25,.25);
    this.airplane.mesh.position.y = 100;
    this.scene.add(this.airplane.mesh);
  }


  private createSea(){
    this.sea = new Sea(this);
    this.sea.mesh.position.y = -600;
    this.scene.add(this.sea.mesh);
  }

  private createSky(){
    this.sky = new Sky(this);
    this.sky.mesh.position.y = -600;
    this.scene.add(this.sky.mesh);
  }

  private loop = () => {

    this.updatePlane();
    this.sea.mesh.rotation.z += .005;
    this.sky.mesh.rotation.z += .01;
    this.renderer.render(this.scene, this.camera);;
    requestAnimationFrame(this.loop);
  }

  private updatePlane(){

    const targetY = this.normalize(this.mousePos.y,-.75,.75,25, 175);
    const targetX = this.normalize(this.mousePos.x,-.75,.75,-100, 100);
    this.airplane.mesh.position.y = targetY;
    this.airplane.mesh.position.x = targetX;
    this.airplane.propeller.rotation.x += 0.3;
  }


  private normalize(v: number,vmin: number,vmax: number,tmin: number, tmax: number){
    const nv = Math.max(Math.min(v,vmax), vmin);
    const dv = vmax-vmin;
    const pc = (nv-vmin)/dv;
    const dt = tmax-tmin;
    const tv = tmin + (pc*dt);
    return tv;
  }

  private init(){

    this.createScene();
    this.createLights();
    this.createPlane();
    this.createSea();
    this.createSky();

    document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
    this.loop();
  }

}

