import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import TextPlugin from 'gsap/TextPlugin'

let canvas, camera, renderer, controls, clock
let gui, guiLights
let scene
let loadingManager, textureLoader

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

const parameters = {
    ambColor: 0xffffff,
    dir01Color: 0xffe49c
}

init()
update()

function init()
{
    // Canvas
    canvas = document.querySelector('canvas.webgl')

    // Scene
    scene = new THREE.Scene()
    const group01 = new THREE.Group()

    // Clock
    clock = new THREE.Clock()

    // AxesHelper
    const axesHelper = new THREE.AxesHelper(1)
    scene.add(axesHelper)

    // Camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(1, 1, 3)
    scene.add(camera)

    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    // controls.target = mesh_ico.position

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    // Other Initializations
    setUpDebugger()
    otherPluginsSetup()
    initLoaders()
    initLighting()
    createObjects()


    window.addEventListener('resize', onWindowResize)

}

function otherPluginsSetup()
{
    gsap.registerPlugin(TextPlugin)
}

function setUpDebugger()
{
    gui = new dat.GUI({hideable: true})
    
    guiLights = gui.addFolder('lights')

}

function initLoaders()
{
    loadingManager = new THREE.LoadingManager()
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
    textureLoader = new THREE.TextureLoader(loadingManager)
    
}

function createObjects()
{
    // Loading Textures
    const colorTexture = textureLoader.load('/textures/door/color.jpg')
    // const colorTexture = textureLoader.load('/textures/checkerboard-1024x1024.png')
    
    colorTexture.minFilter = THREE.NearestFilter
    // colorTexture.generateMipmaps = false
    // colorTexture.magFilter = THREE.NearestFilter

    // Creating Geometries
    const geometryCube = new THREE.BoxBufferGeometry(1, 1, 1, 1)

    // console.log(geometry.attributes.uv)

    // Creating Materials
    const diffuseMat = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
        // shininess: 500,
        // specular: 0x038cfc,
        // wireframe: true
        
        // alphaMap: alphaTexture
    })

    // Creating Meshes
    const meshCube = new THREE.Mesh(geometryCube, diffuseMat)

    // Ading Meshes
    scene.add(meshCube)
}

function initLighting()
{
    const ambientLight = new THREE.AmbientLight(parameters.ambColor, .5)
    scene.add(ambientLight)
    
    const dirLight01 = new THREE.DirectionalLight(parameters.dir01Color, .5)
    dirLight01.position.set(1, 1, 0)
    scene.add(dirLight01)

    // Debug
    guiLights
        .addColor(parameters, 'ambColor')
        .onChange(() => {
            ambientLight.color.set(parameters.ambColor)
        })

    guiLights
        .addColor(parameters, 'dir01Color')
        .onChange(() => {
            dirLight01.color.set(parameters.dir01Color)
        })

}

function onWindowResize()
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
}

function update()
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}