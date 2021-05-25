import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap from 'gsap'
import TextPlugin from 'gsap/TextPlugin'
import { Vector2, Vector3 } from 'three'
import CANNON from 'cannon'

let currColorVer = 0

let firstVerTxt, secVerTxt, secVerRightLayer

let canvas, camera, renderer, controls, clock
let gui, guiLights
let sceneL, sceneR, groupL
let loadingManager, textureLoader
let meshCubeL, meshCubeR, axesHelper, meshTestL
let dir, tempVec, localTempVec
let diffuseMat, diffuseMat02

let world, moveDirection
let oldElapsedTime = 0
let ifMove = false
let velocity
let euler = new THREE.Euler()
let quat = new THREE.Quaternion()
let threeHeight, threeWidth = 0

let dirLight01

let mouseX = 0
let mouseY = 0

const COLLGROUP1 = 1
const COLLGROUP2 = 2

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

let splitPos = sizes.width / 2
let splitPosPercent = .5
const slider = document.querySelector('.slider')

const parameters = {
    ambColor: 0xffffff,
    dir01Color: 0xffe49c,
    sceneLColor: 0x42bcf5,
    sceneRColor: 0xfff7ea,
    diffuseCol01: 0xff73c5,
    diffuseCol02: 0x73ffc7
}

const parameters02 = {
    sceneLColor: 0xffffff,
    sceneRColor: 0x000000,
    diffuseCol01: 0x000000,
    diffuseCol02: 0xffffff
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
    camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, 22)
    // sceneL.add(camera)

    // Controls
    controls = new OrbitControls(camera, canvas)
    controls.enableDamping = true
    // controls.target = mesh_ico.position
    controls.enabled = false

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
    createObjects()
    initLighting()
    calculateViewportWidth()
    
    TrackMouseMove()
    controlSlider()
    changeColorSet()

    // dir = new THREE.Vector3()
    // tempVec = dir.subVectors(meshTestL.position, meshCubeL.position).normalize()
    // console.log(tempVec)
    // localTempVec = meshCubeL.worldToLocal(tempVec)
    // console.log(localTempVec)

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('pointerdown', onPointerDownBox)

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
    // Creating Threejs Geometries
    const geometryCube = new THREE.BoxBufferGeometry(1, 1, 1, 1)
    const geometryPlane = new THREE.PlaneBufferGeometry(sizes.width, 5, 1, 1)

    // Creating Materials
    diffuseMat = new THREE.MeshPhongMaterial({ 
        color: parameters.diffuseCol01,
    })

    diffuseMat02 = new THREE.MeshPhongMaterial({ 
        color: parameters.diffuseCol02,
    })

    const planeMat = new THREE.ShadowMaterial({
        opacity: .5
    })

    // Creating Threejs Meshes
    createBox(geometryCube, diffuseMat, 1, 1, 1, {x:3, y:0, z:0}, sceneL)
    createBox(geometryCube, diffuseMat02, 1, 1, 1, {x:3, y:0, z:0}, sceneR)

    // // Left Side
    // meshCubeL = new THREE.Mesh(geometryCube, diffuseMat)
    // meshCubeL.rotation.set(Math.PI/6, Math.PI/4, 0)
    // meshTestL = new THREE.Mesh(geometryCube, diffuseMat)
    // meshTestL.position.set(-7, 0, 0) 

    const meshPlaneL = new THREE.Mesh(geometryPlane, planeMat)
    meshPlaneL.rotation.x = - Math.PI/2
    meshPlaneL.position.y = -3
    meshPlaneL.receiveShadow = true

    // groupL.add(meshCubeL)
    // // sceneL.add(meshTestL)
    sceneL.add(meshPlaneL)

    // // Right Side
    // meshCubeR = new THREE.Mesh(geometryCube, diffuseMat02)
    // meshCubeR.rotation.set(Math.PI/6, Math.PI/4, 0)

    const meshPlaneR = new THREE.Mesh(geometryPlane, planeMat)
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
        // angularDamping: 1
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
    const ambientLight = new THREE.AmbientLight(parameters.ambColor, .8)
    sceneL.add(ambientLight.clone())
    sceneR.add(ambientLight.clone())
    
    dirLight01 = new THREE.DirectionalLight(parameters.dir01Color, .5)
    dirLight01.position.set(5, 8, 0)
    dirLight01.castShadow = true
    dirLight01.shadowDarkness = .5

    // const dirLight01Helper = new THREE.DirectionalLightHelper(dirLight01, 1)
    // sceneR.add(dirLight01Helper)

    // Threejs is using Orth Camera internally for directional lights
    dirLight01.shadow.camera.near = 1
    dirLight01.shadow.camera.far = 30
    dirLight01.shadow.camera.top = 5
    dirLight01.shadow.camera.bottom = -30

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

function onPointerDownBox(event)
{
    if (objectsToUpdate[0] && Math.abs(objectsToUpdate[0].body.velocity.y) <= 1)
    {
        ifMove = true

        if (event.clientX / sizes.width < splitPosPercent)
        {
            moveDirection = 0
        }
        else
        {
            moveDirection = 1
        }
    }
}

function controlSlider()
{
    
    function onPointerDownSlider(event)
    {
        if (event.isPrimary === false) return

        window.removeEventListener('pointerdown', onPointerDownBox)

        window.addEventListener('pointermove', onPointerMoveSlider)
        window.addEventListener('pointerup', onPointerUpSlider)

        console.log("hihi")

    }

    function onPointerUpSlider()
    {
        window.addEventListener('pointerdown', onPointerDownBox)

        window.removeEventListener('pointermove', onPointerMoveSlider)
        window.removeEventListener('pointerup', onPointerUpSlider)
    }

    function  onPointerMoveSlider(event)
    {
        if (event.isPrimary === false) return;

        splitPos = Math.max(0, Math.min(sizes.width, event.pageX))
        splitPosPercent = splitPos / sizes.width
        slider.style.left = splitPos - (slider.offsetWidth / 2) + "px"

        if (currColorVer == 1) // second color set
        {
            updateRightLayerPos()
        }
    }

    slider.addEventListener('pointerdown', onPointerDownSlider)
}

function calculateViewportWidth()
{
    const dist = 22

    let vFOV = THREE.MathUtils.degToRad( camera.fov ); // convert vertical fov to radians

    threeHeight = 2 * Math.tan( vFOV / 2 ) * dist; // visible height

    threeWidth = threeHeight * camera.aspect;           // visible width
}

function updateRightLayerPos()
{
    let rightTxtPercent = (splitPos - secVerRightLayer.getBoundingClientRect().left) / secVerRightLayer.offsetWidth
        rightTxtPercent = Math.min(Math.max(rightTxtPercent, 0), 1)

        secVerRightLayer.style.clipPath = `polygon(${rightTxtPercent * 100}% 0, 100% 0, 100% 100%, ${rightTxtPercent * 100}% 100%)`
}

function changeColorSet()
{
    const firstSet = document.querySelector('.firstSet')
    const secSet = document.querySelector('.secondSet')
    const leftTxt = document.querySelector('.leftText')
    const rightTxt = document.querySelector('.rightText')
    const liLis = document.querySelectorAll('li')

    firstVerTxt = document.getElementById('firstVerTxt')
    secVerTxt = document.getElementById('secondVerTxt')

    secVerRightLayer = document.getElementById('rightLayer')

    function onPointerDownFirstSet(){
        window.removeEventListener('pointerdown', onPointerDownBox)

        currColorVer = 0

        sceneL.background = new THREE.Color(parameters.sceneLColor)
        sceneR.background = new THREE.Color(parameters.sceneRColor)

        diffuseMat.color = new THREE.Color(parameters.diffuseCol01)
        diffuseMat02.color = new THREE.Color(parameters.diffuseCol02)

        secVerTxt.style.display = 'none'
        firstVerTxt.style.display = 'inherit'

        // // leftTxt.style.color = '#000000'
        // // rightTxt.style.color = '#000000'
        // for (let i = 0; i < liLis.length; i++)
        // {
        //     liLis[i].style.backgroundColor = '#000000'
        // }
        
        window.addEventListener('pointerup', onPointerUpFirstSet)
    }

    function onPointerUpFirstSet()
    {
        window.addEventListener('pointerdown', onPointerDownBox)
    }

    function onPointerDownSecSet()
    {
        window.removeEventListener('pointerdown', onPointerDownBox)

        currColorVer = 1

        sceneL.background = new THREE.Color(parameters02.sceneLColor)
        sceneR.background = new THREE.Color(parameters02.sceneRColor)

        diffuseMat.color = new THREE.Color(parameters02.diffuseCol01)
        diffuseMat02.color = new THREE.Color(parameters02.diffuseCol02)

        firstVerTxt.style.display = 'none'
        secVerTxt.style.display = 'inherit'

        updateRightLayerPos()

        // // leftTxt.style.color = '#ff0000'
        // // rightTxt.style.color = '#ff0000'
        // for (let i = 0; i < liLis.length; i++)
        // {
        //     liLis[i].style.backgroundColor = '#ff0000'
        // }

        window.addEventListener('pointerup', onPointerUpSecSet)
    }

    function onPointerUpSecSet()
    {
        window.addEventListener('pointerdown', onPointerDownBox)
    }

    firstSet.addEventListener('pointerdown', onPointerDownFirstSet)
    secSet.addEventListener('pointerdown', onPointerDownSecSet)
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
    splitPos = sizes.width * splitPosPercent
    slider.style.left = splitPos - (slider.offsetWidth / 2) + "px"

    calculateViewportWidth()
    updateRightLayerPos()

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
        let boxL = objectsToUpdate[0]
        if (moveDirection == 0)
        {
            // console.log(splitPos)
            
            if (((threeWidth/2 + boxL.body.position.x)/threeWidth - Math.max(splitPosPercent, .05)) >= -.05)
            {
                for (const object of objectsToUpdate)
                {
                    
                    // const moveVec = new CANNON.Vec3(-.1, 0, 0)
                    // const forcePoint = new CANNON.Vec3(object.body.position.x , object.body.position.y + .4, object.body.position.z)
                    // // object.body.applyForce(moveDirection, forcePoint)
                    // object.body.applyImpulse(moveVec, forcePoint)
                    // object.body.angularDamping = 0

                    object.body.angularVelocity = new CANNON.Vec3(0, 0, 4)
                    // dirLight01L.lookAt(boxL.mesh.position)
                    // dirLight01R.lookAt(boxL.mesh.position)

                }
                
            }
            else
            {
                ifMove = false
            }
        }
        else if(moveDirection == 1)
        {
            console.log(boxL.body.position)
            console.log(threeWidth)
            console.log((threeWidth/2 + boxL.body.position.x)/threeWidth)
            if (((threeWidth/2 + boxL.body.position.x)/threeWidth - Math.min(splitPosPercent, .95)) <= .05)
            {
                for (const object of objectsToUpdate)
                {
                    
                    // const moveVec = new CANNON.Vec3(.1, 0, 0)
                    // const forcePoint = new CANNON.Vec3(object.body.position.x , object.body.position.y + .4, object.body.position.z)
                    // // object.body.applyForce(moveDirection, forcePoint)
                    // object.body.applyImpulse(moveVec, forcePoint)
                    // // object.body.angularDamping = 0

                    object.body.angularVelocity = new CANNON.Vec3(0, 0, -4)
                }
                
            }
            else
            {
                ifMove = false
            }
        }
        
    }

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