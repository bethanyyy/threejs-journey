import './style.css'
import * as THREE from 'three'
import CANNON from 'cannon'

// Global Project Variables
let currSet = 0
let ifMove = false // if box can move
const objectsToUpdate = [] // list of scene objects
const parametersFirstSet = {
    ambColor: 0xffffff,
    dir01Color: 0xffe49c,
    sceneLColor: 0x42bcf5,
    sceneRColor: 0xfff7ea,
    diffuseCol01: 0xff73c5,
    diffuseCol02: 0x73ffc7
}
const parametersSecSet = {
    sceneLColor: 0xffffff,
    sceneRColor: 0x000000,
    diffuseCol01: 0x000000,
    diffuseCol02: 0xffffff
}

// DOM Element
let secSetRightLayer

// Threejs Variables
let canvas, camera, renderer, clock
let sceneL, sceneR
let diffuseMat, diffuseMat02
let threeHeight, threeWidth = 0 // visible region
const cameraDist = 22
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Cannon Variables
let world, moveDirection
let oldElapsedTime = 0
const COLLGROUP1 = 1
const COLLGROUP2 = 2
const boxCannonMat = new CANNON.Material('box')
const floorCannonMat = new CANNON.Material('floor')
const boxFloorContactMaterial = new CANNON.ContactMaterial(
    boxCannonMat,
    floorCannonMat,
    {
        friction: .1,
        restitution: .7
    }
)

// Split Screen Variables
let splitPos = sizes.width / 2
let splitPosPercent = .5
const slider = document.querySelector('.slider')

// Call Init and Update
init()
update()

// Initialize Threejs and window settings
function init()
{
    // Canvas
    canvas = document.querySelector('canvas.webgl')

    // Scene
    sceneL = new THREE.Scene()
    sceneL.background = new THREE.Color(parametersFirstSet.sceneLColor)

    sceneR = new THREE.Scene()
    sceneR.background = new THREE.Color(parametersFirstSet.sceneRColor)

    // Cannon
    world = new CANNON.World()
    world.gravity.set(0, -9.82, 0)
    world.addContactMaterial(boxFloorContactMaterial)

    // Clock
    clock = new THREE.Clock()

    // Camera
    camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 1000)
    camera.position.set(0, 0, cameraDist)

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setScissorTest(true)
    renderer.shadowMap.enabled = true

    // Other Initializations
    createObjects()
    initLighting()
    calculateViewportWidth()
    
    controlSlider()
    changeColorSet()

    window.addEventListener('resize', onWindowResize)
    window.addEventListener('pointerdown', onPointerDownBox)
}

function createObjects()
{
    // Creating Threejs Geometries
    const geometryCube = new THREE.BoxBufferGeometry(1, 1, 1, 1)
    const geometryPlane = new THREE.PlaneBufferGeometry(sizes.width, 5, 1, 1)

    // Creating Materials
    diffuseMat = new THREE.MeshPhongMaterial({ 
        color: parametersFirstSet.diffuseCol01,
    })

    diffuseMat02 = new THREE.MeshPhongMaterial({ 
        color: parametersFirstSet.diffuseCol02,
    })

    const planeMat = new THREE.ShadowMaterial({
        opacity: .5
    })

    // Creating Threejs Box Meshes
    createBox(geometryCube, diffuseMat, 1, 1, 1, {x:3, y:-.5, z:0}, sceneL)
    createBox(geometryCube, diffuseMat02, 1, 1, 1, {x:3, y:-.5, z:0}, sceneR)

    // Creating Threejs Plane Meshes
    const meshPlaneL = new THREE.Mesh(geometryPlane, planeMat)
    meshPlaneL.rotation.x = - Math.PI/2
    meshPlaneL.position.y = -3.7
    meshPlaneL.receiveShadow = true
    sceneL.add(meshPlaneL)

    const meshPlaneR = new THREE.Mesh(geometryPlane, planeMat)
    meshPlaneR.rotation.x = - Math.PI/2
    meshPlaneR.position.y = -3.7
    meshPlaneR.receiveShadow = true
    sceneR.add(meshPlaneR)

    // Creating Cannon Floor Object
    const floorShape = new CANNON.Plane()
    const floorBody = new CANNON.Body()
    floorBody.mass = 0
    floorBody.addShape(floorShape)
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(- 1, 0, 0), Math.PI * 0.5)
    floorBody.position = new CANNON.Vec3(0, -3.7, 0)
    floorBody.material = floorCannonMat
    floorBody.collisionFilterGroup = COLLGROUP2
    world.addBody(floorBody)
}

// Helper function for creating box
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
        material: boxCannonMat,
        collisionFilterGroup: COLLGROUP1,
        collisionFilterMask: COLLGROUP2,
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
    const ambientLight = new THREE.AmbientLight(parametersFirstSet.ambColor, .8)
    sceneL.add(ambientLight.clone())
    sceneR.add(ambientLight.clone())
    
    const dirLight01 = new THREE.DirectionalLight(parametersFirstSet.dir01Color, .5)
    dirLight01.position.set(5, 8, 0)
    dirLight01.castShadow = true
    dirLight01.shadowDarkness = .5

    // Threejs is using Orth Camera internally for directional lights
    dirLight01.shadow.camera.near = 1
    dirLight01.shadow.camera.far = 30
    dirLight01.shadow.camera.top = 14
    dirLight01.shadow.camera.bottom = -30

    sceneL.add(dirLight01.clone())
    sceneR.add(dirLight01.clone())
}

// Check if box is movable and set move direction
function onPointerDownBox(event)
{
    // Check if the box is close to the ground
    if (objectsToUpdate[0] && Math.abs(objectsToUpdate[0].body.velocity.y) <= 1)
    {
        ifMove = true

        // Decide move direction based on position relative to the split screen position
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

        if (currSet == 1) // second color set
        {
            updateRightLayerPos()
        }
    }

    slider.addEventListener('pointerdown', onPointerDownSlider)
}

// Calculate threejs visible region - https://stackoverflow.com/questions/13350875/three-js-width-of-view
function calculateViewportWidth()
{
    let verticalFOV = THREE.MathUtils.degToRad( camera.fov ); // convert vertical fov to radians
    threeHeight = 2 * Math.tan( verticalFOV / 2 ) * cameraDist; // visible height
    threeWidth = threeHeight * camera.aspect; // visible width
}

// Update mask for the layers if the second set is active
function updateRightLayerPos()
{
    let rightTxtPercent = (splitPos - secSetRightLayer.getBoundingClientRect().left) / secSetRightLayer.offsetWidth
        rightTxtPercent = Math.min(Math.max(rightTxtPercent, 0), 1)

        secSetRightLayer.style.clipPath = `polygon(${rightTxtPercent * 100}% 0, 100% 0, 100% 100%, ${rightTxtPercent * 100}% 100%)`
}

function changeColorSet()
{
    const firstSetBtns = document.querySelectorAll('.firstSetCTA')
    const secSetBtns = document.querySelectorAll('.secondSetCTA')

    const firstSet = document.getElementById('firstSet')
    const secSet = document.getElementById('secondSet')

    secSetRightLayer = document.getElementById('rightLayer')

    function onPointerDownFirstSet(){
        window.removeEventListener('pointerdown', onPointerDownBox)

        currSet = 0

        sceneL.background = new THREE.Color(parametersFirstSet.sceneLColor)
        sceneR.background = new THREE.Color(parametersFirstSet.sceneRColor)

        diffuseMat.color = new THREE.Color(parametersFirstSet.diffuseCol01)
        diffuseMat02.color = new THREE.Color(parametersFirstSet.diffuseCol02)

        secSet.style.display = 'none'
        firstSet.style.display = 'inherit'

        
        window.addEventListener('pointerup', onPointerUpFirstSet)
    }

    function onPointerUpFirstSet()
    {
        window.addEventListener('pointerdown', onPointerDownBox)
    }

    function onPointerDownSecSet()
    {
        window.removeEventListener('pointerdown', onPointerDownBox)

        currSet = 1

        sceneL.background = new THREE.Color(parametersSecSet.sceneLColor)
        sceneR.background = new THREE.Color(parametersSecSet.sceneRColor)

        diffuseMat.color = new THREE.Color(parametersSecSet.diffuseCol01)
        diffuseMat02.color = new THREE.Color(parametersSecSet.diffuseCol02)

        firstSet.style.display = 'none'
        secSet.style.display = 'inherit'

        updateRightLayerPos()

        window.addEventListener('pointerup', onPointerUpSecSet)
    }

    function onPointerUpSecSet()
    {
        window.addEventListener('pointerdown', onPointerDownBox)
    }

    firstSetBtns.forEach(element => {
        element.addEventListener('pointerdown', onPointerDownFirstSet)
    });

    secSetBtns.forEach(element => {
        element.addEventListener('pointerdown', onPointerDownSecSet)
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

    // Update Cannon Physics
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
            if (((threeWidth/2 + boxL.body.position.x)/threeWidth - Math.max(splitPosPercent, .05)) >= -.05)
            {
                for (const object of objectsToUpdate)
                {
                    object.body.angularVelocity = new CANNON.Vec3(0, 0, 4)
                }
            }
            else
            {
                ifMove = false
            }
        }
        else if(moveDirection == 1)
        {
            if (((threeWidth/2 + boxL.body.position.x)/threeWidth - Math.min(splitPosPercent, .95)) <= .05)
            {
                for (const object of objectsToUpdate)
                {
                    object.body.angularVelocity = new CANNON.Vec3(0, 0, -4)
                }
            }
            else
            {
                ifMove = false
            }
        }
    }

    // Render
    renderer.setScissor(0, 0, splitPos, sizes.height)
    renderer.render(sceneL, camera)

    renderer.setScissor(splitPos, 0, sizes.width, sizes.height)
    renderer.render(sceneR, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(update)
}