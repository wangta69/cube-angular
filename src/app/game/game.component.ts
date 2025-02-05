import { Component,OnInit,AfterViewInit,ViewChild,ElementRef } from '@angular/core';
import * as THREE from 'three';

import { AirPlane } from './objects/AirPlane';
import { Sea } from './objects/Sea';
import { Sky } from './objects/Sky';
import { CoinsHolder } from './objects/CoinsHolder';
import { Ennemy } from './objects/Ennemy';
import { EnnemiesHolder } from './objects/EnnemiesHolder';
import { Particle } from './objects/Particle';
import { ParticlesHolder } from './objects/ParticlesHolder';



@Component({
  selector: 'app-root',
  templateUrl: './game.html',
  styleUrls: ['./scss/demo.scss', './scss/game.scss', './scss/styles.scss']
})
export class GameComponent implements OnInit, AfterViewInit{

 

  // GAME VARIABLES
  private game: any;
  private deltaTime = 0;
  private newTime = new Date().getTime();
  private oldTime = new Date().getTime();
  private ennemiesPool: any[] = [];
  private particlesPool: any[] = [];
  private particlesInUse = [];

    //THREEJS RELATED VARIABLES

  private scene: any;
  private camera: any;
  private fieldOfView: any;
  private aspectRatio: any;
  private nearPlane: any;
  private farPlane: any;
  private renderer: any;
  private container: any;
  private controls: any;
  private blinkEnergy=false;

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
  private coinsHolder: any;
  private ennemiesHolder: any;
  private particlesHolder: any;

  constructor(
  ) { 
  }

  ngOnInit() {

  }
  ngAfterViewInit() {
    this.init();
  }

  private resetGame(){
    this.game = {
      speed:0,
      initSpeed:.00035,
      baseSpeed:.00035,
      targetBaseSpeed:.00035,
      incrementSpeedByTime:.0000025,
      incrementSpeedByLevel:.000005,
      distanceForSpeedUpdate:100,
      speedLastUpdate:0,

      distance:0,
      ratioSpeedDistance:50,
      energy:100,
      ratioSpeedEnergy:3,

      level:1,
      levelLastUpdate:0,
      distanceForLevelUpdate:1000,

      planeDefaultHeight:100,
      planeAmpHeight:80,
      planeAmpWidth:75,
      planeMoveSensivity:0.005,
      planeRotXSensivity:0.0008,
      planeRotZSensivity:0.0004,
      planeFallSpeed:.001,
      planeMinSpeed:1.2,
      planeMaxSpeed:1.6,
      planeSpeed:0,
      planeCollisionDisplacementX:0,
      planeCollisionSpeedX:0,

      planeCollisionDisplacementY:0,
      planeCollisionSpeedY:0,

      seaRadius:600,
      seaLength:800,
      //seaRotationSpeed:0.006,
      wavesMinAmp : 5,
      wavesMaxAmp : 20,
      wavesMinSpeed : 0.001,
      wavesMaxSpeed : 0.003,

      cameraFarPos:500,
      cameraNearPos:150,
      cameraSensivity:0.002,

      coinDistanceTolerance:15,
      coinValue:3,
      coinsSpeed:.5,
      coinLastSpawn:0,
      distanceForCoinsSpawn:100,

      ennemyDistanceTolerance:10,
      ennemyValue:10,
      ennemiesSpeed:.6,
      ennemyLastSpawn:0,
      distanceForEnnemiesSpawn:50,

      status : "playing",
    };
    this.fieldLevel.innerHTML = Math.floor(this.game.level);
  }



  //INIT THREE JS, SCREEN AND MOUSE EVENTS

  private createScene() {

    this.HEIGHT = window.innerHeight;
    this.WIDTH = window.innerWidth;

    this.scene = new THREE.Scene();
    this.aspectRatio = this.WIDTH / this.HEIGHT;
    this.fieldOfView = 50;
    this.nearPlane = .1;
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
    this.camera.position.y = this.game.planeDefaultHeight;
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

  private handleTouchMove(event: any) {
    event.preventDefault();
    const tx = -1 + (event.touches[0].pageX / this.WIDTH)*2;
    const ty = 1 - (event.touches[0].pageY / this.HEIGHT)*2;
    this.mousePos = {x:tx, y:ty};
  }

  private handleMouseUp(){
    if (this.game.status == "waitingReplay"){
      this.resetGame();
      this.hideReplay();
    }
  }

  private handleTouchEnd(){
    if (this.game.status == "waitingReplay"){
      this.resetGame();
      this.hideReplay();
    }
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
    this.shadowLight.shadow.mapSize.width = 4096;
    this.shadowLight.shadow.mapSize.height = 4096;

    // const ch = new THREE.CameraHelper(this.shadowLight.shadow.camera);

    //scene.add(ch);
    this.scene.add(this.hemisphereLight);
    this.scene.add(this.shadowLight);
    this.scene.add(this.ambientLight);
  }


  private createPlane(){
    this.airplane = new AirPlane(this);
    this.airplane.mesh.scale.set(.25,.25,.25);
    this.airplane.mesh.position.y = this.game.planeDefaultHeight;
    this.scene.add(this.airplane.mesh);
  }

  private createSea(){
    this.sea = new Sea(this);
    this.sea.mesh.position.y = -this.game.seaRadius;
    this.scene.add(this.sea.mesh);
  }

  private createSky(){
    this.sky = new Sky(this);
    this.sky.mesh.position.y = -this.game.seaRadius;
    this.scene.add(this.sky.mesh);
  }

  private createCoins(){
    this.coinsHolder = new CoinsHolder(this, 20);
    this.scene.add(this.coinsHolder.mesh)
  }

  private createEnnemies(){
    for (let i=0; i<10; i++){
      const ennemy = new Ennemy(this);
      this.ennemiesPool.push(ennemy);
    }
    this.ennemiesHolder = new EnnemiesHolder(this);
    //ennemiesHolder.mesh.position.y = -game.seaRadius;
    this.scene.add(this.ennemiesHolder.mesh)
  }

  private createParticles(){
    for (let i=0; i<10; i++){
      const particle = new Particle(this);
      this.particlesPool.push(particle);
    }
    this.particlesHolder = new ParticlesHolder(this);
    //ennemiesHolder.mesh.position.y = -game.seaRadius;
    this.scene.add(this.particlesHolder.mesh)
  }

  private loop = () => {

    this.newTime = new Date().getTime();
    this.deltaTime = this.newTime-this.oldTime;
    this.oldTime = this.newTime;

    if (this.game.status=="playing"){

      // Add energy coins every 100m;
      if (Math.floor(this.game.distance)%this.game.distanceForCoinsSpawn == 0 && Math.floor(this.game.distance) > this.game.coinLastSpawn){
        this.game.coinLastSpawn = Math.floor(this.game.distance);
        this.coinsHolder.spawnCoins();
      }

      if (Math.floor(this.game.distance)%this.game.distanceForSpeedUpdate == 0 && Math.floor(this.game.distance) > this.game.speedLastUpdate){
        this.game.speedLastUpdate = Math.floor(this.game.distance);
        this.game.targetBaseSpeed += this.game.incrementSpeedByTime*this.deltaTime;
      }


      if (Math.floor(this.game.distance)%this.game.distanceForEnnemiesSpawn == 0 && Math.floor(this.game.distance) > this.game.ennemyLastSpawn){
        this.game.ennemyLastSpawn = Math.floor(this.game.distance);
        this.ennemiesHolder.spawnEnnemies();
      }

      if (Math.floor(this.game.distance)%this.game.distanceForLevelUpdate == 0 && Math.floor(this.game.distance) > this.game.levelLastUpdate){
        this.game.levelLastUpdate = Math.floor(this.game.distance);
        this.game.level++;
        this.fieldLevel.innerHTML = Math.floor(this.game.level);

        this.game.targetBaseSpeed = this.game.initSpeed + this.game.incrementSpeedByLevel*this.game.level
      }

      this.updatePlane();
      this.updateDistance();
      this.updateEnergy();
      this.game.baseSpeed += (this.game.targetBaseSpeed - this.game.baseSpeed) * this.deltaTime * 0.02;
      this.game.speed = this.game.baseSpeed * this.game.planeSpeed;

    } else if(this.game.status=="gameover"){
      this.game.speed *= .99;
      this.airplane.mesh.rotation.z += (-Math.PI/2 - this.airplane.mesh.rotation.z)*.0002*this.deltaTime;
      this.airplane.mesh.rotation.x += 0.0003*this.deltaTime;
      this.game.planeFallSpeed *= 1.05;
      this.airplane.mesh.position.y -= this.game.planeFallSpeed*this.deltaTime;

      if (this.airplane.mesh.position.y <-200){
        this.showReplay();
        this.game.status = "waitingReplay";

      }
    }else if (this.game.status=="waitingReplay"){

    }

    // 프로펠러 움직이기
    this.airplane.propeller.rotation.x +=.2 + this.game.planeSpeed * this.deltaTime*.005;

    // 바다 움직이기
    this.sea.mesh.rotation.z += this.game.speed*this.deltaTime;//*game.seaRotationSpeed;

    if ( this.sea.mesh.rotation.z > 2*Math.PI)  this.sea.mesh.rotation.z -= 2*Math.PI;

    this.ambientLight.intensity += (.5 - this.ambientLight.intensity)*this.deltaTime*0.005;

    this.coinsHolder.rotateCoins();
    this.ennemiesHolder.rotateEnnemies();

    this.sky.moveClouds();
    this.sea.moveWaves();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
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

    this.game.planeSpeed = this.normalize(this.mousePos.x,-.5,.5,this.game.planeMinSpeed, this.game.planeMaxSpeed);
    let targetY = this.normalize(this.mousePos.y,-.75,.75,this.game.planeDefaultHeight-this.game.planeAmpHeight, this.game.planeDefaultHeight+this.game.planeAmpHeight);
    let targetX = this.normalize(this.mousePos.x,-1,1,-this.game.planeAmpWidth*.7, -this.game.planeAmpWidth);

    this.game.planeCollisionDisplacementX += this.game.planeCollisionSpeedX;
    targetX += this.game.planeCollisionDisplacementX;


    this.game.planeCollisionDisplacementY += this.game.planeCollisionSpeedY;
    targetY += this.game.planeCollisionDisplacementY;

    this.airplane.mesh.position.y += (targetY-this.airplane.mesh.position.y)*this.deltaTime*this.game.planeMoveSensivity;
    this.airplane.mesh.position.x += (targetX-this.airplane.mesh.position.x)*this.deltaTime*this.game.planeMoveSensivity;

    this.airplane.mesh.rotation.z = (targetY-this.airplane.mesh.position.y)*this.deltaTime*this.game.planeRotXSensivity;
    this.airplane.mesh.rotation.x = (this.airplane.mesh.position.y-targetY)*this.deltaTime*this.game.planeRotZSensivity;
    // const targetCameraZ = this.normalize(this.game.planeSpeed, this.game.planeMinSpeed, this.game.planeMaxSpeed, this.game.cameraNearPos, this.game.cameraFarPos);
    this.camera.fov = this.normalize(this.mousePos.x,-1,1,40, 80);
    this.camera.updateProjectionMatrix ()
    this.camera.position.y += (this.airplane.mesh.position.y - this.camera.position.y)*this.deltaTime*this.game.cameraSensivity;

    this.game.planeCollisionSpeedX += (0-this.game.planeCollisionSpeedX)*this.deltaTime * 0.03;
    this.game.planeCollisionDisplacementX += (0-this.game.planeCollisionDisplacementX)*this.deltaTime *0.01;
    this.game.planeCollisionSpeedY += (0-this.game.planeCollisionSpeedY)*this.deltaTime * 0.03;
    this.game.planeCollisionDisplacementY += (0-this.game.planeCollisionDisplacementY)*this.deltaTime *0.01;
    // 파일럿의 hairs 날리기
    this.airplane.pilot.updateHairs();
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
    this.fieldDistance = document.getElementById("distValue");
    this.energyBar = document.getElementById("energyBar");
    this.replayMessage = document.getElementById("replayMessage");
    this.fieldLevel = document.getElementById("levelValue");
    this.levelCircle = document.getElementById("levelCircleStroke");

    this.resetGame();
    this.createScene();

    this.createLights();
    this.createPlane();
    this.createSea();
    this.createSky();
    this.createCoins();
    this.createEnnemies();
    this.createParticles();

    document.addEventListener('mousemove', this.handleMouseMove.bind(this), false);
    document.addEventListener('touchmove', this.handleTouchMove.bind(this), false);
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), false);
    document.addEventListener('touchend', this.handleTouchEnd.bind(this), false);

    this.loop();
  }

}

