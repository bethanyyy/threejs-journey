import './style.css'
import * as THREE from 'three'

window.onload = function(){
    animate()
}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objects
 */

const mouseCube = new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1), new THREE.MeshPhongMaterial({color: 0xffffff, flatShading: true}))
// make mouseCube render on top of other objects
mouseCube.renderOrder = 2
mouseCube.material.depthTest = false

mouseCube.position.set(1,1,1)
scene.add(mouseCube)

const group = new THREE.Object3D()
scene.add(group)

const cubeNew = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), new THREE.MeshBasicMaterial({color: 0xa9ff9c}))
cubeNew.position.z = -1
group.add(cubeNew)

const geometry = new THREE.BoxGeometry(1, 1, 1)
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    shading: THREE.FlatShading
})
const mesh = new THREE.Mesh(geometry, material)
mesh.position.set(1,0,0.5)

mesh.scale.y = 0.5
mesh.rotation.x = Math.PI/2

group.add(mesh)

group.rotation.z = Math.PI / 4

const axesHelper = new THREE.AxesHelper(2)
// scene.add(axesHelper)

const ambientLight = new THREE.AmbientLight(0x85b4ff)
scene.add(ambientLight)

var lights = [];
lights[0] = new THREE.DirectionalLight( 0xffffff, 1 );
lights[0].position.set( 1, 0, 0 );
lights[1] = new THREE.DirectionalLight( 0x11E8BB, 1 );
lights[1].position.set( 0.75, 1, 0.5 );
lights[2] = new THREE.DirectionalLight( 0x8200C9, 1 );
lights[2].position.set( -0.75, -1, 0.5 );
scene.add( lights[0] );
scene.add( lights[1] );
scene.add( lights[2] );

/**
 * Sizes
 */
const sizes = {
    width: 800,
    height: 600
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)

camera.position.z = 3

console.log(mesh.position.distanceTo(camera.position))
scene.add(camera)

camera.lookAt(group.position)


// Mouse

let mouseX = 0
let mouseY = 0

window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / sizes.width * 2 - 1
    mouseY = - (event.clientY / sizes.height) * 2 + 1
    
    // can also write it here
    // var vector = new THREE.Vector3(mouseX, mouseY, 0.5);
	// vector.unproject( camera );
	// var dir = vector.sub( camera.position ).normalize();
	// var distance = - camera.position.z / dir.z;
	// var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	// mouseCube.position.copy(pos);

})


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
// renderer.render(scene, camera)

function animate() {
    requestAnimationFrame(animate);
  
    mesh.rotation.x -= 0.0020;
    mesh.rotation.y -= 0.0030;

    // mouseCube.position.x = mouseX
    // mouseCube.position.y = mouseY
    // mouseCube.position.z = 1

    // convert screen coordinates to threejs world position
    // ref: https://jsfiddle.net/atwfxdpd/10/
    var vector = new THREE.Vector3(mouseX, mouseY, 0.5);
	vector.unproject( camera );
	var dir = vector.sub( camera.position ).normalize();
	var distance = - camera.position.z / dir.z;
	var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
	mouseCube.position.copy(pos);

    renderer.clear();
  
    renderer.render( scene, camera )
  };
  