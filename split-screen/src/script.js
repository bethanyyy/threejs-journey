import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import TextPlugin from 'gsap/TextPlugin'
import { Vector2, Vector3 } from 'three'
import CANNON from 'cannon'

let canvas, camera, renderer, controls, clock
let gui, guiLights
let sceneL, sceneR, groupL
let loadingManager, textureLoader
let meshCubeL, meshCubeR, axesHelper, meshTestL
let dir, tempVec, localTempVec

let world, moveDirection
let oldElapsedTime = 0
let ifMove = false

let mouseX = 0
let mouseY = 0

const COLLGROUP1 = 1
const COLLGROUP2 = 2

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let splitPos = sizes.width / 2

const parameters = {
    ambColor: 0xffffff,
    dir01Color: 0xffe49c,
    sceneLColor: 0x42bcf5,
    sceneRColor: 0xfff7ea
}

const boxMaterial = new CANNON.Material('box')
const floorMaterial = new CANNON.Material('floor')
const boxFloorContactMaterial = new CANNON.ContactMaterial(
    boxMaterial,
    floorMaterial,
    {
        friction: .1,
        restitution: .7
    }
)

const objectsToUpdate = []

init()
update()

function init()
{
    // Canvas
    canvas = document.querySelector('canvas.webgl')

    // Scene
    sceneL = new THREE.Scene()
    sceneL.background = new THREE.Color(parameters.sceneLColor)
    groupL = new THREE.Group()
    sceneL.add(groupL)

    sceneR = new THREE.Scene()
    sceneR.background = new THREE.Color(parameters.sceneRColor)

    // Cannon
    world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)
    world.addContactMaterial(boxFloorContactMaterial)

    // Clock
    clock = new THREE.Clock()

    // AxesHelper
    axesHelper = new THREE.AxesHelper(1)
    // sceneL.add(axesHelper.clone())
    // sceneR.add(axesHelper.clone())

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
    renderer.shadowMap.enabled = true


    // Other Initializations
    setUpDebugger()
    otherPluginsSetup()
    initLoaders()
    initLighting()
    createObjects()
    TrackMouseMove()

    dir = new THREE.Vector3()
    // tempVec = dir.subVectors(meshTestL.position, meshCubeL.position).normalize()
    // console.log(tempVec)
    // localTempVec = meshCubeL.worldToLocal(tempVec)
    // console.log(localTempVec)


    window.addEventListener('resize', onWindowResize)
    // window.addEventListener('mousedown', onMouseClick(new CANNON.Vec3(-1, 0, 0)))

    document.addEventListener('pointerdown', (event) => {
        ifMove = true

        if ((event.clientX / sizes.width - .5) < 0)
        {
            moveDirection = 0
        }
        else
        {
            moveDirection = 1
        }

        // for (const object of objectsToUpdate)
        // {
        //     // if (object.body.position.x >= -3)
        //     moveDirection = new CANNON.Vec3(-2, 0, 0)
        //     const forcePoint = new CANNON.Vec3(object.body.position.x , object.body.position.y + .4, object.body.position.z)
        //     // object.body.applyForce(moveDirection, forcePoint)
        //     object.body.applyImpulse(moveDirection, forcePoint)
        //     object.body.angularDamping = 0
        // }
    })


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

    // Creating Threejs Geometries
    const geometryCube = new THREE.BoxBufferGeometry(1, 1, 1, 1)
    const geometryPlane = new THREE.PlaneBufferGeometry(20, 5, 1, 1)

    // Creating Materials
    const diffuseMat = new THREE.MeshPhongMaterial({ 
        color: 0xff0000,
    })

    const diffuseMat02 = new THREE.MeshPhongMaterial({ 
        color: 0x00ff00,
    })

    const planeMatL = new THREE.ShadowMaterial({
        opacity: .5
    })

    const planeMatR = new THREE.ShadowMaterial({
        opacity: .5
    })

    // Creating Threejs Meshes
    createBox(geometryCube, diffuseMat, 1, 1, 1, {x:0, y:0, z:0}, sceneL)
    createBox(geometryCube, diffuseMat02, 1, 1, 1, {x:0, y:0, z:0}, sceneR)

    // // Left Side
    // meshCubeL = new THREE.Mesh(geometryCube, diffuseMat)
    // meshCubeL.rotation.set(Math.PI/6, Math.PI/4, 0)
    // meshTestL = new THREE.Mesh(geometryCube, diffuseMat)
    // meshTestL.position.set(-7, 0, 0) 

    const meshPlaneL = new THREE.Mesh(geometryPlane, planeMatL)
    meshPlaneL.rotation.x = - Math.PI/2
    meshPlaneL.position.y = -3
    meshPlaneL.receiveShadow = true

    // groupL.add(meshCubeL)
    // // sceneL.add(meshTestL)
    sceneL.add(meshPlaneL)

    // // Right Side
    // meshCubeR = new THREE.Mesh(geometryCube, diffuseMat02)
    // meshCubeR.rotation.set(Math.PI/6, Math.PI/4, 0)

    const meshPlaneR = new THREE.Mesh(geometryPlane, planeMatR)
    meshPlaneR.rotation.x = - Math.PI/2
    meshPlaneR.position.y = -3
    meshPlaneR.receiveShadow = true

    // sceneR.add(meshCubeR)
    sceneR.add(meshPlaneR)

    // Creating Cannon Floor Object
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
    floorBody.position = new CANNON.Vec3(0, -3, 0)
    floorBody.material = floorMaterial
    floorBody.collisionFilterGroup = COLLGROUP2
    world.addBody(floorBody)

}

function createBox(geometry, material, width, height, depth, position, scene)
{
    const boxMesh = new THREE.Mesh(geometry, material)
    boxMesh.castShadow = true
    boxMesh.position.copy(position)
    scene.add(boxMesh)

    const boxShape = new CANNON.Box(new CANNON.Vec3(width * .5, height * .5, depth * .5))

    const boxBody = new CANNON.Body({
        mass: 1,
        shape: boxShape,
        material: boxMaterial,
        collisionFilterGroup: COLLGROUP1,
        collisionFilterMask: COLLGROUP2,
        angularDamping: 1
    })
    boxBody.position.copy(position)
    world.addBody(boxBody)

    objectsToUpdate.push({
        mesh: boxMesh,
        body: boxBody
    })
}

function initLighting()
{
    const ambientLight = new THREE.AmbientLight(parameters.ambColor, .5)
    sceneL.add(ambientLight.clone())
    sceneR.add(ambientLight.clone())
    
    const dirLight01 = new THREE.DirectionalLight(parameters.dir01Color, 1)
    dirLight01.position.set(1, 1, 0)
    dirLight01.castShadow = true
    dirLight01.shadowDarkness = .5
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

function TrackMouseMove()
{
    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / sizes.width - .5
        mouseY = - (event.clientY / sizes.height - .5)
    })
}

function moveBox(targetBody, direction)
{
    targetBody.applyForce(direction, targetBody.position)
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
    splitPos = sizes.width / 2
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function update()
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - oldElapsedTime
    oldElapsedTime = elapsedTime

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

    // Update Physics
    world.step(1/60, deltaTime, 3)

    for (const object of objectsToUpdate)
    {
        object.mesh.position.copy(object.body.position)
        object.mesh.quaternion.copy(object.body.quaternion)
    }

    if (ifMove)
    {
        
        if (moveDirection == 0)
        {
            console.log("left")
            for (const object of objectsToUpdate)
            {
                if (object.body.position.x >= -3)
                {
                    const moveVec = new CANNON.Vec3(-.1, 0, 0)
                    const forcePoint = new CANNON.Vec3(object.body.position.x , object.body.position.y + .4, object.body.position.z)
                    // object.body.applyForce(moveDirection, forcePoint)
                    object.body.applyImpulse(moveVec, forcePoint)
                    object.body.angularDamping = 0
                }
                // else
                // {
                //     ifMove = false
                // }
            }
        }
        else if(moveDirection == 1)
        {
            console.log("right")
            for (const object of objectsToUpdate)
            {
                if (object.body.position.x <= 3)
                {
                    const moveVec = new CANNON.Vec3(.1, 0, 0)
                    const forcePoint = new CANNON.Vec3(object.body.position.x , object.body.position.y + .4, object.body.position.z)
                    // object.body.applyForce(moveDirection, forcePoint)
                    object.body.applyImpulse(moveVec, forcePoint)
                    object.body.angularDamping = 0
                }
                // else
                // {
                //     ifMove = false
                // }
            }
        }
        
    }

    // for (const object of objectsToUpdate)
    // {
    //     // console.log(mouseX)
    //     moveDirection = new CANNON.Vec3(mouseX * 1, 0, 0)
    //     const forcePoint = new CANNON.Vec3(object.body.position.x , object.body.position.y + .4, object.body.position.z)
    //     // object.body.applyForce(moveDirection, forcePoint)
    //     object.body.applyImpulse(moveDirection * elapsedTime, forcePoint)
    //     object.body.angularDamping = 0
    // }

    // Update controls
    controls.update()

    // Render
    renderer.setScissor(0, 0, splitPos, sizes.height)
    renderer.render(sceneL, camera)

    renderer.setScissor(splitPos, 0, sizes.width, sizes.height)
    renderer.render(sceneR, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}