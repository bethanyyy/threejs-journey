import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import TextPlugin from 'gsap/TextPlugin'

/** --------------------------- Debug Setup --------------------------- */
const gui = new dat.GUI({hideable: true})
gui.hide()

const parameters = {
    ambColor: 0xcdff,
    point01Color: 0xff0000
}

gui
    .addColor(parameters, 'ambColor')
    .onChange(() => {
        ambientLight.color.set(parameters.ambColor)
    })

gui
    .addColor(parameters, 'point01Color')
    .onChange(() => {
        pointLight01.color.set(parameters.point01Color)
    })

/** --------------------------- Plugins --------------------------- */
gsap.registerPlugin(TextPlugin)

/** --------------------------- Base --------------------------- */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xffbae2, 10, 50)

const group01 = new THREE.Group()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Resize
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/** --------------------------- Object --------------------------- */
const geometry_cube = new THREE.BoxGeometry(1, 1, 1, 1, 0, 1)
const geometry_ico = new THREE.IcosahedronBufferGeometry(.5,1)

const material = new THREE.MeshPhongMaterial({ 
    color: 0xde9018,
    shininess: 500,
    wireframe: true
 })

 const material_cube01 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
     transparent: true,
     opacity: .6
 })
 const material_cube02 = new THREE.MeshPhongMaterial({
    color: 0xff242f,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
     transparent: true,
     opacity: .8
 })
 const material_cube03 = new THREE.MeshPhongMaterial({
    color: 0x8c34b3,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
     transparent: true,
     opacity: .5
 })

const mesh_ico = new THREE.Mesh(geometry_ico, material)
scene.add(mesh_ico)

let mat_cubes = [material_cube01, material_cube02, material_cube03]

let generated_cubes = []
let cubes_speed = []

for (let i = 0; i < 200; i++)
{
    let rand_mat_idx = Math.round(Math.random()*2)

    let mesh_cube_new = new THREE.Mesh(geometry_cube, mat_cubes[rand_mat_idx])

    let rand_num_x = ((Math.random() - .5) * 21) * 4
    let rand_num_y = ((Math.random() - .5) * 21) * 4
    let rand_num_z = ((Math.random() - .5) * 21) * 4

    let rand_scale_xz = Math.ceil((Math.random() * 5) + .5)
    let rand_scale_y = Math.random()*3 + 1

    mesh_cube_new.position.set(rand_num_x, rand_num_y, rand_num_z)
    mesh_cube_new.scale.set(rand_scale_xz, rand_scale_y, rand_scale_xz)
    
    group01.add(mesh_cube_new)
    scene.add(group01)
    generated_cubes.push(mesh_cube_new)

    let rand_speed = Math.random() * 4 + .5
    cubes_speed.push(rand_speed)
}


/** --------------------------- Camera --------------------------- */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 18
camera.position.z = 0
scene.add(camera)

/** --------------------------- Lighting --------------------------- */
const ambientLight = new THREE.AmbientLight(parameters.ambColor, .5)
scene.add(ambientLight)

const pointLight01 = new THREE.PointLight(parameters.point01Color, .5)
pointLight01.position.set(2, 3, 4)
scene.add(pointLight01)

/** --------------------------- Controls --------------------------- */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.enabled = false

/** --------------------------- Mouse --------------------------- */
let mouseX = 0
let mouseY = 0

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / sizes.width - .5
    mouseY = - (event.clientY / sizes.height - .5)
})

/** --------------------------- Animating Text --------------------------- */
const p = document.querySelector('p')
const tl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 5})

// typewriter effect
tl.to('p', {duration: 2, text: '>>> getting closer...?', ease: 'none', x: '5px'})

/** --------------------------- Animate --------------------------- */
const clockRotation = new THREE.Clock()
const clockMouse = new THREE.Clock()

const tick = () =>
{
    if (Math.abs(mouseY) < .002)
    {
        // restart clock
        clockMouse.start()
    }

    const elapsedTimeRotation = clockRotation.getElapsedTime()
    const elapsedTimeMouse = clockMouse.getElapsedTime()

    for (let i = 0; i < generated_cubes.length; i++)
    {

        let y_movement_cubes = mouseY * elapsedTimeMouse*.01

        generated_cubes[i].position.y += y_movement_cubes * cubes_speed[i]

        generated_cubes[i].position.y = Math.min(Math.max(generated_cubes[i].position.y, -150), 30)
        
    }

    mesh_ico.position.y = Math.cos(elapsedTimeRotation) * 4 - 5

    group01.rotation.y = elapsedTimeRotation * .02

    mesh_ico.rotation.y = elapsedTimeRotation * .1
    mesh_ico.rotation.x = elapsedTimeRotation * .1
    mesh_ico.rotation.z = elapsedTimeRotation * .1

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()