import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import GUI from 'lil-gui'
import CANNON from 'cannon'
import { Sky } from 'three/examples/jsm/objects/Sky.js'

/**
 * Base
 */

// Debug
const gui = new GUI()
const debugObject = {}

debugObject.createBurger = () =>
{
    createBurger(
        0.5,
        0.5,
        0.5,
        {
            x: (Math.random() - 0.5) * 30,
            y: 10,
            z: (Math.random() - 0.5) * 30


        }
    )
}

debugObject.reset = () =>{
    for(const object of objectstoUpdate){
        // remove body
        object.burgerBunBody.removeEventListener('collide', playHitSound)
        world.removeBody(object.burgerBunBody)

        // remove mesh
        scene.remove(object.burgerModel)
    }
    objectstoUpdate.splice(0, objectstoUpdate.length)
}


gui.add(debugObject, 'createBurger')




// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


/** Texture */

const textureLoader = new THREE.TextureLoader()


// Grass/Floor
const floorColorTexture = textureLoader.load('./grass/sparse_grass_diff_1k.jpg')
const floorARMTexture = textureLoader.load('./grass/sparse_grass_arm_1k.jpg')
const floorNormalTexture = textureLoader.load('./grass/sparse_grass_disp_1k.png')
const floorDisplacementTexture = textureLoader.load('static/grass/sparse_grass_disp_1k.png')


floorColorTexture.colorSpace = THREE.SRGBColorSpace

floorColorTexture.repeat.set(8,8)
floorARMTexture.repeat.set(8,8)
floorNormalTexture.repeat.set(8,8)
floorDisplacementTexture.repeat.set(8,8)


floorColorTexture.wrapS = THREE.RepeatWrapping
floorARMTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorDisplacementTexture.wrapS = THREE.RepeatWrapping

floorColorTexture.wrapT = THREE.RepeatWrapping
floorARMTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorDisplacementTexture.wrapT = THREE.RepeatWrapping



/**
 * Sounds 
 */
const hitSound = new Audio('/sounds/zapsplat_cartoon_pop_002_46048.mp3')

const playHitSound = (collision) =>
    {
    const impactStrength = collision.contact.getImpactVelocityAlongNormal()

    if(impactStrength > 1.5)
    {
        hitSound.volume = Math.random()
        hitSound.currentTime = 0
        hitSound.play()
    }

}

/**
 * Models
 */


// let burgerModel = null
// let burgerSize = { width: 0, height: 0, depth: 0 };

// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

// const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

// let mixer = null

// gltfLoader.load(
//     '/models/hamburger1.glb',
//     (gltf) =>
//     {
//     burgerModel = gltf.scene;
//     scene.add(burgerModel);
//     // scene.add(gltf.scene)


//   // Get the size from the bounding box
//     const box = new THREE.Box3().setFromObject(burgerModel);
//     const size = new THREE.Vector3();
//     box.getSize(size);

//   // Save these size values outside the function
//     burgerSize.width = size.x;
//     burgerSize.height = size.y;
//     burgerSize.depth = size.z;
//     }
// )




/**
 * Physics  */
// world
const world = new CANNON.World()
// performance optimization 
world.broadphase = new CANNON.SAPBroadphase(world)
world.allowSleep = true 

world.gravity.set(0 , -9.82, 0)


// Materials
const concreteMaterial = new CANNON.Material('concrete')
const plasticMaterial = new CANNON.Material('plastic')


const concretePlasticContactMaterial = new CANNON.ContactMaterial(
    concreteMaterial,
    plasticMaterial,
    {
        friction:0.1,
        restitution:0.7
    }
)
world.addContactMaterial(concretePlasticContactMaterial)

// burger bun 
// const burgerBunShape = new CANNON.Box(new CANNON.Vec3(burgerSize.width * 0.5, burgerSize.height * 0.5, burgerSize.depth * 0.5));
// const burgerBunBody = new CANNON.Body({
//     mass:1,
//     position:new CANNON.Vec3(0, 3, 0),
//     shape:burgerBunShape,
//     material:plasticMaterial
    
// })

// world.addBody(burgerBunBody)


// Physics FLoor
const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body()
// default mass is 0 so this code below is not neccsary but still
floorBody.mass = 0 
// floorBody.material = defaultMaterial
floorBody.addShape(floorShape)
// rotating the floor object 
floorBody.quaternion.setFromAxisAngle(
    new CANNON.Vec3(-1,0,0),
    Math.PI * 0.5
)
world.addBody(floorBody)



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        // alphaMap:floorAlphaTexture,
        transparent: true,
        map:floorColorTexture,
        aoMap:floorARMTexture,
        roughnessMap:floorARMTexture,
        metalnessMap:floorARMTexture,
        normalMap:floorNormalTexture,
        displacementMap:floorDisplacementTexture,
        displacementScale:0.3,
        displacementBias:-0.2,
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2.4)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = - 7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = - 7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(- 8, 4, 8)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/** function to create burgers */
const objectstoUpdate = []


// const createBurger = (position) => {
//     const dracoLoader = new DRACOLoader();
//     dracoLoader.setDecoderPath('/draco/');

//     const gltfLoader = new GLTFLoader();
//     gltfLoader.setDRACOLoader(dracoLoader);



//     gltfLoader.load('/models/hamburger1.glb', (gltf) => {
//         let burgerSize = { width: 0, height: 0, depth: 0 };
//         const burgerModel = gltf.scene;

//         burgerModel.castShadow = true;
//         burgerModel.position.copy(position);
//         scene.add(burgerModel);

//         const box = new THREE.Box3().setFromObject(burgerModel);
//         const size = new THREE.Vector3();
//         box.getSize(size);

//         burgerSize.width = size.x;
//         burgerSize.height = size.y;
//         burgerSize.depth = size.z;



//         const burgerBunShape = new CANNON.Box(new CANNON.Vec3(burgerSize.width * 0.5, burgerSize.height * 0.5, burgerSize.depth * 0.5));
//         const burgerBunBody = new CANNON.Body({
//             mass: 1,
//             // position: new CANNON.Vec3(position.x, position.y, position.z), 
//             position: new CANNON.Vec3(0, 10, 0),
//             shape: burgerBunShape,
//             material: plasticMaterial,



          
//         });


        // burgerBunBody.position.copy(position)
        // world.addBody(burgerBunBody);



//         objectstoUpdate.push({
//             burgerModel,
//             burgerBunBody: burgerBunBody,
//         })
//     });
 

// }
const createBurger = (width, height, depth,position) => {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);



    gltfLoader.load('/models/hamburger1.glb', (gltf) => {
        const burgerModel = gltf.scene;

        burgerModel.scale.set(width, height, depth)
        burgerModel.castShadow = true;
        burgerModel.position.copy(position);
        scene.add(burgerModel);


        const burgerBunShape = new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, depth * 0.5));
        const burgerBunBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 0),
            shape: burgerBunShape,
            material: plasticMaterial,         
        });


        burgerBunBody.position.copy(position)
        burgerBunBody.addEventListener('collide' , playHitSound)
        world.addBody(burgerBunBody);


        objectstoUpdate.push({
            burgerModel,
            burgerBunBody: burgerBunBody,
        })
    });
 

}

createBurger(0.5, 0.5, 0.5, { x: 0, y: 3, z: 0 })



/** SKy */

const sky = new Sky()
sky.scale.setScalar( 450000 );
scene.add(sky)

sky.material.uniforms['turbidity'].value = 20
sky.material.uniforms['rayleigh'].value = 0.558
sky.material.uniforms['mieCoefficient'].value = 0.009
sky.material.uniforms['mieDirectionalG'].value = 0.999998
sky.material.uniforms['sunPosition'].value.set(15, 180, 0.5)

// scene.fog = new THREE.FogExp2('#d1efff', 0.05) // much lighter fog


/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime


    // update Physics world 
    world.step(1/60, deltaTime ,3)

    for (const object of objectstoUpdate) {
        object.burgerModel.position.copy(object.burgerBunBody.position)
        object.burgerModel.quaternion.copy(object.burgerBunBody.quaternion)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()