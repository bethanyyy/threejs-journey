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

/** --------------------------- Texture Loader --------------------------- */
const loadingManager = new THREE.LoadingManager()
loadingManager.onStart = () =>{
    console.log('loading start')
}
loadingManager.onLoad = () =>{
    console.log('loaded')
}
loadingManager.onProgress = () =>{
    console.log('in progress')
}
loadingManager.onError = () =>{
    console.log('error!')
}
const textureLoader = new THREE.TextureLoader(loadingManager)

const colorTexture = textureLoader.load('/textures/door/color.jpg')
// const colorTexture = textureLoader.load('/textures/checkerboard-1024x1024.png')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const aoTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')

colorTexture.minFilter = THREE.NearestFilter
// colorTexture.generateMipmaps = false
// colorTexture.magFilter = THREE.NearestFilter

/** --------------------------- Object --------------------------- */
const geometry_cube = new THREE.BoxGeometry(1, 1, 1, 1, 0, 1)
const geometry_torus = new THREE.TorusBufferGeometry(1, .35, 16, 16)
const geometry_ico = new THREE.IcosahedronBufferGeometry(.5,1)

// console.log(geometry.attributes.uv)

const material = new THREE.MeshPhongMaterial({ 
    map: colorTexture,
    shininess: 500,
    // specular: 0x038cfc,
    wireframe: true
    
    // alphaMap: alphaTexture
 })

const material_ico = new THREE.MeshPhongMaterial({
    color: 0xffffff,
     shininess: 500,
     specular: 0xffffff,
     wireframe: true,
     transparent: true,
 })

 const material_toon01 = new THREE.MeshPhongMaterial({
    color: 0xffffff,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
     transparent: true,
     opacity: .6
 })
 const material_toon02 = new THREE.MeshPhongMaterial({
    color: 0xff242f,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
     transparent: true,
     opacity: .8
 })
 const material_toon03 = new THREE.MeshPhongMaterial({
    color: 0x8c34b3,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
     transparent: true,
     opacity: .5
 })
//  material_toon.color.set(0xfcdf03)

const mesh_cube = new THREE.Mesh(geometry_cube, material)
const mesh_cube02 = new THREE.Mesh(geometry_cube, material_toon01)
mesh_cube02.position.set(1, .25, 0)
mesh_cube02.scale.set(1, 1.5, 1)

const mesh_ico = new THREE.Mesh(geometry_ico, material)

scene.add(mesh_ico)

// scene.add(group01)

let mat_toons = [material_toon01, material_toon02, material_toon03]

let generated_cubes = []

for (let i = 0; i < 200; i++)
{
    let rand_mat_idx = Math.round(Math.random()*2)

    let mesh_cube_new = new THREE.Mesh(geometry_cube, mat_toons[rand_mat_idx])

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
}
console.log(generated_cubes.length)

const mesh_torus = new THREE.Mesh(geometry_torus, material_toon01)
mesh_torus.position.set(-2, 0, 0)
// scene.add(mesh_torus)

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

const pointLight01Helper = new THREE.PointLightHelper(pointLight01, 1)
// scene.add(pointLight01Helper)

/** --------------------------- Controls --------------------------- */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// controls.target = mesh_ico.position

/** --------------------------- Mouse --------------------------- */
let mouseX = 0
let mouseY = 0

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / sizes.width - .5
    mouseY = - (event.clientY / sizes.height - .5)
})

// window.addEventListener("wheel", onMouseWheel)

// let scroll_y = 0
// let position = 0

// function onMouseWheel(event)
// {
//     // console.log(event.deltaY)
//     y = event.deltaY * .0007
// }

/** --------------------------- Animating Text --------------------------- */
const p = document.querySelector('p')
const tl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 5})

// clip path
// tl.to(p, {duration: 3, clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', x: '20px'})

// typewriter effect
tl.to('p', {duration: 2, text: '>>> getting closer...?', ease: 'none', x: '5px'})

/** --------------------------- Animate --------------------------- */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // let y_movement_cubes = mouseY * elapsedTime*.003
    // console.log("ymovement:")

    for (let i = 0; i < generated_cubes.length; i++)
    {
        // generated_cubes[i].position.y += Math.sin(mouseY * elapsedTime)*.005
        // generated_cubes[i].position.x += Math.cos(mouseY * elapsedTime)*.005
        // mouseY *= .9

        let y_movement_cubes = mouseY * elapsedTime*.006
        let x_movement_cubes = mouseX * elapsedTime*.006

        generated_cubes[i].position.y += Math.min(.1,y_movement_cubes * 3)
        generated_cubes[i].position.z += Math.min(.7,y_movement_cubes) * .5
        generated_cubes[i].position.x += - Math.min(.7, x_movement_cubes)
        
    }

    // mesh_ico.position.x = Math.sin(elapsedTime)
    mesh_ico.position.y = Math.cos(elapsedTime) * 4 - 5

    group01.rotation.y = elapsedTime * .02

    mesh_ico.rotation.y = elapsedTime * .1
    mesh_ico.rotation.x = elapsedTime * .1
    mesh_ico.rotation.z = elapsedTime * .1

    // Update controls
    // controls.target = mesh_ico.position
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()