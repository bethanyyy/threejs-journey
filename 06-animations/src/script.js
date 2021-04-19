import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Sizes
const sizes = {
    width: 800,
    height: 600
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height)
camera.position.z = 3
scene.add(camera)

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)

// get time by native js?
let time = Date.now()

// get time by three.js clock method
const clock = new THREE.Clock()

// make animation using gsap, gsap handles tick internally, but we still have to render the results by ourselves
// gsap.to(mesh.position, {duration: 1, delay: 1, x: 2})
// gsap.to(mesh.position, {duration: 1, delay: 2, x: 0})

const tick = () => {
    // console.log(tick)

    // Time
    // let currTime = Date.now()
    // let deltaTime = currTime - time
    // time = currTime

    const elapsedTime = clock.getElapsedTime()

    // Update Objects
    // mesh.rotation.y += 0.01 * deltaTime
    // mesh.rotation.y = elapsedTime * 2 * Math.PI
    mesh.position.y = Math.sin(elapsedTime)
    mesh.rotation.y = Math.sin(elapsedTime)

    // Render
    renderer.render(scene, camera)
    
    window.requestAnimationFrame(tick)
}

tick()