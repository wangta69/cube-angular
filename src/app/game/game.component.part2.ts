import { Component,OnInit,AfterViewInit,ViewChild,ElementRef } from '@angular/core';
import * as THREE from 'three';

import { AirPlane2 as AirPlane} from './objects/AirPlane2';
import { Sea2 as Sea } from './objects/Sea2';
import { Sky2 as Sky } from './objects/Sky2';



@Component({
  selector: 'app-root',
  templateUrl: './game.html',
  styleUrls: ['./scss/demo.scss', './scss/game.scss', './scss/styles.scss']
})
export class GameComponent implements OnInit, AfterViewInit{

 

  // GAME VARIABLES
  private game: any;
  private deltaTime = 0;


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
  private fieldDistance: any;
  private energyBar: any;
  private levelCircle: any;
  private replayMessage: any;
  private fieldLevel: any;

  //SCREEN & MOUSE VARIABLES

  private HEIGHT!: number;
  private WIDTH!: number;
  private mousePos = { x: 0, y: 0 };

  // LIGHTS

  private ambientLight: any;
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
    //camera.lookAt(new THREE.Vector3(0, 400, 0));

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setClearColor( 0x000000, 0 );
    this.renderer.setSize(this.WIDTH, this.HEIGHT);

    this.renderer.shadowMap.enabled = true;

    this.container = document.getElementById('world');
    this.container.appendChild(this.renderer.domElement);

    window.addEventListener('resize', this.handleWindowResize, false);

    /*
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minPolarAngle = -Math.PI / 2;
    controls.maxPolarAngle = Math.PI ;

    //controls.noZoom = true;
    //controls.noPan = true;
    //*/
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

    this.ambientLight = new THREE.AmbientLight(0xdc8874, .5);

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

    // const ch = new THREE.CameraHelper(this.shadowLight.shadow.camera);

    //scene.add(ch);
    this.scene.add(this.hemisphereLight);
    this.scene.add(this.shadowLight);
    this.scene.add(this.ambientLight);
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
    this.airplane.pilot.updateHairs();
    this.updateCameraFov();
    this.sea.moveWaves();
    this.sky.mesh.rotation.z += .01;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  }

  private updateCameraFov(){
    this.camera.fov = this.normalize(this.mousePos.x,-1,1,40, 80);
    this.camera.updateProjectionMatrix();
  }

  private updateDistance(){
    this.game.distance += this.game.speed*this.deltaTime*this.game.ratioSpeedDistance;
    this.fieldDistance.innerHTML = Math.floor(this.game.distance);
    const d = 502*(1-(this.game.distance%this.game.distanceForLevelUpdate)/this.game.distanceForLevelUpdate);
    this.levelCircle.setAttribute("stroke-dashoffset", d);
  }

  private updateEnergy(){
    this.game.energy -= this.game.speed*this.deltaTime*this.game.ratioSpeedEnergy;
    this.game.energy = Math.max(0, this.game.energy);
    this.energyBar.style.right = (100-this.game.energy)+"%";
    this.energyBar.style.backgroundColor = (this.game.energy<50)? "#f25346" : "#68c3c0";

    if (this.game.energy<30){
      this.energyBar.style.animationName = "blinking";
    }else{
      this.energyBar.style.animationName = "none";
    }

    if (this.game.energy <1){
      this.game.status = "gameover";
    }
  }

  private addEnergy(){
    this.game.energy += this.game.coinValue;
    this.game.energy = Math.min(this.game.energy, 100);
  }

  private removeEnergy(){
    this.game.energy -= this.game.ennemyValue;
    this.game.energy = Math.max(0, this.game.energy);
  }

  private updatePlane(){

    const targetY = this.normalize(this.mousePos.y,-.75,.75,25, 175);
    const targetX = this.normalize(this.mousePos.x,-.75,.75,-100, 100);
    this.airplane.mesh.position.y += (targetY-this.airplane.mesh.position.y)*0.1;
    this.airplane.mesh.rotation.z = (targetY-this.airplane.mesh.position.y)*0.0128;
    this.airplane.mesh.rotation.x = (this.airplane.mesh.position.y-targetY)*0.0064;
    this.airplane.propeller.rotation.x += 0.3;
  }

  private showReplay(){
    this.replayMessage.style.display="block";
  }

  private hideReplay(){
    this.replayMessage.style.display="none";
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
    // UI
    this.createScene();
    this.createLights();
    this.createPlane();
    this.createSea();
    this.createSky();

    document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);


    this.loop();
  }

}

