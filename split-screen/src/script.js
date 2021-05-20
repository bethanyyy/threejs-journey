import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import TextPlugin from 'gsap/TextPlugin'
import { Vector2, Vector3 } from 'three'

let canvas, camera, renderer, controls, clock
let gui, guiLights
let sceneL, sceneR, groupL
let loadingManager, textureLoader
let meshCubeL, meshCubeR, axesHelper, meshTestL
let dir, tempVec, localTempVec

let splitPos = window.innerWidth / 2

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
    sceneL = new THREE.Scene()
    sceneL.background = new THREE.Color(0x42bcf5)
    groupL = new THREE.Group()
    sceneL.add(groupL)

    sceneR = new THREE.Scene()
    sceneR.background = new THREE.Color(0xfff7ea)

    // Clock
    clock = new THREE.Clock()

    // AxesHelper
    axesHelper = new THREE.AxesHelper(1)
    sceneL.add(axesHelper.clone())
    sceneR.add(axesHelper.clone())

    // Camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, 15)
    // sceneL.add(camera)

    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    // controls.target = mesh_ico.position

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        // alpha: true,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setScissorTest(true)


    // Other Initializations
    setUpDebugger()
    otherPluginsSetup()
    initLoaders()
    initLighting()
    createObjects()

    dir = new THREE.Vector3()
    tempVec = dir.subVectors(meshTestL.position, meshCubeL.position).normalize()
    // console.log(tempVec)
    localTempVec = meshCubeL.worldToLocal(tempVec)
    console.log(localTempVec)


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

    const diffuseMat02 = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
        // shininess: 500,
        // specular: 0x038cfc,
        // wireframe: true
        
        // alphaMap: alphaTexture
    })

    // Creating Meshes
    meshCubeL = new THREE.Mesh(geometryCube, diffuseMat)
    meshCubeL.rotation.set(Math.PI/6, Math.PI/4, 0)
    meshTestL = new THREE.Mesh(geometryCube, diffuseMat)
    meshTestL.position.set(-7, 0, 0)
    // Ading Meshes
    groupL.add(meshCubeL)
    // sceneL.add(meshTestL)
    console.log(groupL.rotation)

    meshCubeR = new THREE.Mesh(geometryCube, diffuseMat02)
    meshCubeR.rotation.set(Math.PI/6, Math.PI/4, 0)
    sceneR.add(meshCubeR)

}

function initLighting()
{
    const ambientLight = new THREE.AmbientLight(parameters.ambColor, .5)
    sceneL.add(ambientLight.clone())
    sceneR.add(ambientLight.clone())
    
    const dirLight01 = new THREE.DirectionalLight(parameters.dir01Color, .5)
    dirLight01.position.set(1, 1, 0)
    sceneL.add(dirLight01.clone())
    sceneR.add(dirLight01.clone())

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

    // console.log(axesHelper.)

    // let worldXVector = new Vector3(-3, 0, 0)
    // let localXVector = meshCubeL.worldToLocal(worldXVector)
    // console.log(worldXVector)
    // console.log(localXVector)

    // let dir = new THREE.Vector3()
    // // console.log(meshTestL.position)
    // tempVec = dir.subVectors(meshTestL.position, meshCubeL.position)
    // localTempVec = meshCubeL.worldToLocal(tempVec)
    // console.log(tempVec)
    

    // meshCubeL.position.x -= .1
    // meshCubeL.translateOnAxis(localTempVec, .1)

    // groupL.translateX(-.1)
    // if (groupL.position.x > -10)
    // {
    //     // console.log("test " + groupL.position.x)
    //     groupL.translateX(-.1)
        
    //     // groupL.lookAt(0, 0, 10)
    //     console.log(groupL.position)
    //     // groupL.position.z = 0

    //     groupL.rotateOnAxis(new THREE.Vector3(-1, 0, 0), -.1)
    // }

    // Update controls
    controls.update()

    // Render
    renderer.setScissor(0, 0, splitPos, window.innerHeight)
    renderer.render(sceneL, camera)

    renderer.setScissor(splitPos, 0, window.innerWidth, window.innerHeight)
    renderer.render(sceneR, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}