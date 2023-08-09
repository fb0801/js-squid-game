import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

renderer.setClearColor(0xb7c3f3, 1);

const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );

//global var

const start_position = 6
const end_position = -start_position

function createCube(size, positionX, rotY = 0, color= 0xfbc851){
	const geometry = new THREE.BoxGeometry(size.w, size.h, size.d);
	const material = new THREE.MeshBasicMaterial( { color: color } );
	const cube = new THREE.Mesh( geometry, material );
		 cube.position.x = positionX; 
		  cube.rotation.y = rotY;
	scene.add( cube );
	return cube;
}

camera.position.z = 5;

const loader = new THREE.GLTFLoader();


class Doll{
	constructor(){
		loader.load("../models/scene.gltf", (gltf) => {
			scene.add(gltf.scene);
			gltf.scene.scale.set(.4, .4, .4);
			gltf.scene.scale.set(0, -1, 0);
			this.doll = gltf.scene;
		})
	}
	lookBackward(){
		//this.doll.rotation.y = -3.15
		gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
	}
	lookForward(){
		//this.doll.rotation.y = 0
		gsap.to(this.doll.rotation, {y: 0, duration: .45})

	}
}

function createTrack(){
createCube({w: start_position * 2 + .21, h: 1.5, d: 1}, 0, 0, 0xe5a716).position.z = -1
createCube({w: .2, h: 1.5, d: 1}, start_position, -.4)
createCube({w: .2, h: 1.5, d: 1}, end_position, .4)
}

createTrack()

class Player{
	constructor(){
	const geometry = new THREE.SphereGeometry( .3, 32, 16 ); 
	const material = new THREE.MeshBasicMaterial( { color: 0xffffff } ); 
	const sphere = new THREE.Mesh( geometry, material ); 
	sphere.position.x = start_position
	scene.add( sphere );
	this.player = sphere
	this.playerinfo = {
		positionX: start_position,
		velocity: 0,
	}
	}

	run(){
		this.playerInfo.velocity = .03
	}
	stop(){
		 gsap.to(this.playerInfo, { duration: .1, velocity: 0 })
	}

	update(){
		this.playerinfo.positionX -= this.playerinfo.velocity
		this.playerinfo.position.x = this.playerinfo.positionX
	}
}

const player = new Player()

let doll = new Doll();
setTimeout(() => {
	doll.lookBackward()
}, 1000);

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	player.update()
}
animate();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener( "keydown", function(e){
    if(gameStat != "started") return
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.run()
    }
})

window.addEventListener( "keyup", function(e){
    let p = players.find(player => player.key == e.key)
    if(p){
        p.player.stop()
    }
})