import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'

/** --------------------------- Debug Setup --------------------------- */
const gui = new dat.GUI()

const parameters = {
    ambColor: 0x93daff,
    point01Color: 0xff3e3e
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
/** --------------------------- Base --------------------------- */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const group01 = new THREE.Group()

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
    // antialias: true
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

// console.log(geometry.attributes.uv)

const material = new THREE.MeshPhongMaterial({ 
    map: colorTexture,
    shininess: 200
    // alphaMap: alphaTexture
 })
 // material.map = colorTexture
material.wireframe = true

 const material_toon = new THREE.MeshPhongMaterial({
    //  color: 0xffffff,
     shininess: 500,
     specular: 0xf542d7,
     wireframe: true,
 })

const mesh_cube = new THREE.Mesh(geometry_cube, material)
const mesh_cube02 = new THREE.Mesh(geometry_cube, material_toon)
mesh_cube02.position.set(1, .25, 0)
mesh_cube02.scale.set(1, 1.5, 1)

group01.add(mesh_cube)
group01.add(mesh_cube02)

scene.add(group01)

for (let i = 0; i < 50; i++)
{
    let mesh_cube_new = new THREE.Mesh(geometry_cube, material_toon)
    let rand_num_x = (Math.random() - .5) * 10
    let rand_num_y = (Math.random() - .5) * 10
    let rand_num_z = (Math.random() - .5) * 10
    mesh_cube_new.position.set(rand_num_x, rand_num_y, rand_num_z)
    scene.add(mesh_cube_new)
}

const mesh_torus = new THREE.Mesh(geometry_torus, material_toon)
mesh_torus.position.set(-2, 0, 0)
// scene.add(mesh_torus)

/** --------------------------- Camera --------------------------- */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 2
camera.position.y = 2
camera.position.z = 3
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

/** --------------------------- Animate --------------------------- */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()