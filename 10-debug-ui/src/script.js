import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OrthographicCamera } from 'three'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import { Material } from 'three/build/three.module';

/** --------------------------- Debug Setup --------------------------- */
const gui = new dat.GUI({ closed: true })

function spin()
{
    gsap.to(mesh.rotation, {duration:1, y:mesh.rotation.y + Math.PI/4})
}

const parameters = {
    cubeMatColor: 0xffffff,
    // ambColor: 0x7f007f,
    ambColor: 0x35356b,
    dirColor: 0xaff7af,
    dir02Color: 0xafb3f7,
    dir03Color: 0x74b9f7,
    spin: () => {
        gsap.to(mesh.rotation, {duration:1, y:mesh.rotation.y + Math.PI/4})
    }
}

gui
    .addColor(parameters, 'cubeMatColor')
    .onChange(() => {
        material.color.set(parameters.cubeMatColor)
    })

gui
    .addColor(parameters, 'ambColor')
    .onChange(() => {
        ambientLight.color.set(parameters.ambColor)
    })

gui
    .addColor(parameters, 'dirColor')
    .onChange(() => {
        dirLight01.color.set(parameters.dirColor)
    })

gui
    .addColor(parameters, 'dir02Color')
    .onChange(() => {
        dirLight02.color.set(parameters.dir02Color)
    })

gui
    .addColor(parameters, 'dir03Color')
    .onChange(() => {
        dirLight03.color.set(parameters.dir03Color)
    })

gui
    .add(parameters, 'spin')
/** --------------------------- Base --------------------------- */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Scene
const scene = new THREE.Scene()

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
    // antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/** --------------------------- Object --------------------------- */

const material = new THREE.MeshPhongMaterial({
    color: parameters.cubeMatColor,
    flatShading: true
})
const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
    // new THREE.MeshBasicMaterial({ color: 0xff0000 })
    material
)
mesh.rotation.y = Math.PI / 4
mesh.rotation.x = Math.PI / 4
scene.add(mesh)

// Debug
gui
    .add(mesh.position, 'y')
    .min(-3)
    .max(3)
    .step(0.01)
    .name('cubeYPos')

gui
    .add(mesh, 'visible')

gui
    .add(material, 'wireframe')

/** --------------------------- Camera --------------------------- */

// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, .1, 1000)

let aspectRatio = sizes.width/sizes.height
const camera = new THREE.OrthographicCamera(-2 * aspectRatio, 2 * aspectRatio, 2, -2, .01, 1000)
// const camera = new THREE.OrthographicCamera(-2, 2, 2 * (1/aspectRatio), -2 * (1/aspectRatio), 1, 1000)
// camera.position.x = 2
// camera.position.y = 2
camera.position.z = 3
camera.lookAt(mesh.position)
scene.add(camera)

/** --------------------------- Lighting --------------------------- */
const ambientLight = new THREE.AmbientLight(parameters.ambColor, 1)
scene.add(ambientLight)

const dirLight01 = new THREE.DirectionalLight(parameters.dirColor, 1)
dirLight01.position.set(0, 1, 0)
scene.add(dirLight01)

const dirLight01Helper = new THREE.DirectionalLightHelper(dirLight01, 1)
// scene.add(dirLight01Helper)

const dirLight02= new THREE.DirectionalLight(parameters.dir02Color, 1)
dirLight02.position.set(-1, -1, 0)
scene.add(dirLight02)

const dirLight02Helper = new THREE.DirectionalLightHelper(dirLight02, 1)
// scene.add(dirLight02Helper)

const dirLight03= new THREE.DirectionalLight(parameters.dir03Color, 1)
dirLight03.position.set(1, -1, 0)
scene.add(dirLight03)

const dirLight03Helper = new THREE.DirectionalLightHelper(dirLight03, 1)
// scene.add(dirLight03Helper)


/** --------------------------- Controls --------------------------- */
const orbitControl = new OrbitControls(camera, canvas)
// orbitControl.target.y = 2
orbitControl.enableDamping = true
orbitControl.dampingFactor = .2
// orbitControl.autoRotate = true

/** --------------------------- Resize --------------------------- */
window.addEventListener('resize', (event) => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update perspective camera
    // camera.aspect = sizes.width/sizes.height
    // camera.updateProjectionMatrix()

    // Update ortho camera
    aspectRatio = sizes.width/sizes.height
    camera.left = -2 * aspectRatio
    camera.right = 2 * aspectRatio
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // handle multi screens occasion
})

/** --------------------------- Full Screen --------------------------- */
window.addEventListener('dblclick', (event) => {
    if (!document.fullscreenElement)
    {
        canvas.requestFullscreen()
        console.log(document.fullscreenElement)
    }
    else
    {
        document.exitFullscreen()
        console.log(document.fullscreenElement)
    }
})

/** --------------------------- Mouse --------------------------- */
let mouseX = 0
let mouseY = 0

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / sizes.width - .5
    mouseY = - (event.clientY / sizes.height - .5)
})

// document.addEventListener('m', (event) => {
//     gsap.to(mesh.rotation, {duration:1, y:mesh.rotation.y + Math.PI/4})
// })

function TestClick()
{
    gsap.to(mesh.rotation, {duration:1, y:mesh.rotation.y + Math.PI/4})
}

document.addEventListener('keypress', (event) => {
    if (event.key == 'Enter')
    {
        gsap.to(mesh.rotation, {duration:1, y:mesh.rotation.y + Math.PI/4})
    }
})

/** --------------------------- Animate --------------------------- */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update objects
    // mesh.rotation.y = elapsedTime;

    // Update camera
    // camera.position.x = mouseX * 5
    // camera.position.y = mouseY * 5

    // camera.position.x = Math.sin(mouseX * Math.PI * 2) * 3
    // camera.position.z = Math.cos(mouseX * Math.PI * 2) * 3
    // camera.position.y = mouseY * 5
    // camera.lookAt(mesh.position)

    // Update Controls
    orbitControl.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()