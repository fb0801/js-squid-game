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
const text =  document.querySelector('.text')
const TIME_LIMIT = 10
let gameStat = 'loading'
let isLookingBackward = true

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

function delay(ms){
	return new Promise(resolve => setTimeout(resolve, ms));
}


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
		
		gsap.to(this.doll.rotation, {y: -3.15, duration: .45})
		setTimeout(() => isLookingBackward = true, 150)
	}
	lookForward(){
		//this.doll.rotation.y = 0
		gsap.to(this.doll.rotation, {y: 0, duration: .45})
		setTimeout(() => isLookingBackward = false, 450)

	}
	async start(){
		this.lookBackward()
		await delay((Math.random() * 1000) + 1000)
		this.lookForward()
		await delay((Math.random() * 750) + 750)
		this.start()
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
	check(){
		if(this.playerInfo.isDead) return
        if(!dallFacingBack && this.playerInfo.velocity > 0){
            text.innerText = this.playerInfo.name + " lost!!!"
            this.playerInfo.isDead = true
            this.stop()
            DEAD_PLAYERS++
            loseMusic.play()
            if(DEAD_PLAYERS == players.length){
                text.innerText = "Everyone lost!!!"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
        if(this.playerInfo.positionX < end_position + .7){
            text.innerText = this.playerInfo.name + " is safe!!!"
            this.playerInfo.isDead = true
            this.stop()
            SAFE_PLAYERS++
            winMusic.play()
            if(SAFE_PLAYERS == players.length){
                text.innerText = "Everyone is safe!!!"
                gameStat = "ended"
            }
            if(DEAD_PLAYERS + SAFE_PLAYERS == players.length){
                gameStat = "ended"
            }
        }
	}
	update(){
		this.check()
		this.playerinfo.positionX -= this.playerinfo.velocity
		this.playerinfo.position.x = this.playerinfo.positionX
	}
}

const player = new Player()

let doll = new Doll();

async function init(){
	await delay(500)
	text.innerText = 'starting in 3'
	await delay(500)
	text.innerText = 'starting in 2'
	await delay(500)
	text.innerText = 'starting in 1'
	await delay(500)
	text.innerText = 'GOOO!!'
	startGame()
}

function startGame(){
	gameStat = 'started'
	let progressBar = createCube({w: 8, h: .1, d: 1}, 0, 0, 0xebaa12)
	progressBar.position.y = 3.35
	gsap.to(progressBar.scale, {duration: TIME_LIMIT, x: 0, ease: "none"})
	doll.start()
	setTimeout(() => {
        if(gameStat != "over"){
            text.innerText = "Ran out of Time!!!"
            gameStat = "over"
        }
    }, TIME_LIMIT * 1000)
}

init()


function animate() {
	if (gameStat =='over') return
	renderer.render( scene, camera );
	requestAnimationFrame( animate );
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