import * as THREE from 'three';
import './assets/styles.css';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'lil-gui'

import gsap from 'gsap';


const textureLoader = new THREE.TextureLoader();

// Your code to initialize scene, camera, renderer, etc.

/**
//-------------------------------------------------------------------------------------------------------- Base
 */
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

//----------------------------------------------------------------------------SUN
// Load Sun texture
const sunTexture = textureLoader.load('/images/texture/sun.jpg'); // Add the path to your sun texture

// Create material for the Sun (use emissive material to make it glow)
const sunMaterial = new THREE.MeshBasicMaterial({
    map: sunTexture,
    emissive: 0xFFFFFF,  // White emissive light to simulate the glowing effect
    emissiveIntensity: 4,  // Adjust emissive intensity to control brightness
  
});

// Create Sun sphere geometry and mesh
const sun = new THREE.Mesh(
    new THREE.SphereGeometry(5, 64, 64),  // Larger radius for the Sun
    sunMaterial
);

// Position the Sun far from Earth
sun.position.set(30, 10, 0);  // Adjust the position as necessary
sun.scale.set(0.1, 0.1, 0.1); // Scale the sun to make it larger (5 times)

// Add the Sun to the scene
scene.add(sun);

// Add light source (sun light)
const sunLight = new THREE.PointLight(0xFFFFFF, 1.5, 100);  // Intensity of light
sunLight.position.set(30, 0, 0);  // Position same as the Sun


// Optionally, add a shadow from the Sun (if you need)
sunLight.castShadow = true;

// Add the light to the scene
scene.add(sunLight);

//----------------------SUN LAYER



// Create the material for the sun layer
const sunlayerMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff, // Set the color of the glow (white in this case)
    emissive: 0xffffff, // Make it glow with the same color
    emissiveIntensity: 2, // Initial brightness of the glow
    blending: THREE.AdditiveBlending, // Additive blending for a glowing effect
    transparent: true, // Make it semi-transparent
    opacity: 0.2, // Set the opacity level
});

// Create the sun mesh with a sphere geometry
const sunlayer = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), sunlayerMaterial);

// Position and scale the sun mesh
sunlayer.position.set(30, 10, 0); // Place the sun at the origin
sunlayer.scale.set(1.4, 1.4, 1.4); // Scale it to create the glowing halo

// Add the sun layer to the scene
scene.add(sunlayer);

// Animation Variables for the "bling-bling" effect
let time = 0;
const pulseSpeed = 0.5; // Speed of pulsing
const maxIntensity = 3; // Maximum emissive intensity
const minIntensity = 1; // Minimum emissive intensity
//-------------------------------------------------------------------------------------------------------- Load Earth texture



//-------------------------------------------------------------------------------------------------------- Load Earth texture

// Earth Textures
const earthTexture = textureLoader.load('/images/texture/Earthmap1.jpg');
earthTexture.encoding = THREE.sRGBEncoding; 
earthTexture.wrapS = THREE.RepeatWrapping;  
earthTexture.wrapT = THREE.RepeatWrapping;  
earthTexture.magFilter = THREE.LinearFilter; 

// Earth Material and Mesh (for both Earth objects)
const earthMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: earthTexture,
    metalness: 0.2,
    roughness: 0.4,
    emissiveIntensity: 0.3,
});

const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), earthMaterial);
earth.position.set(0, 0, 0);
earth.scale.set(1.5, 1.5, 1.5);
scene.add(earth);


// voyager
const voyagerTexture = textureLoader.load('/images/bg/tech1.webp');
voyagerTexture.encoding = THREE.sRGBEncoding;
voyagerTexture.wrapS = THREE.RepeatWrapping;
voyagerTexture.wrapT = THREE.RepeatWrapping;
voyagerTexture.magFilter = THREE.LinearFilter;

// Earth Material and Mesh (for both Earth objects)
const voyagerMaterial = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: voyagerTexture,
    metalness: 0.4,
    roughness: 0,
    emissiveIntensity: 0.3,
});

// Create the Voyager mesh
const voyager = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), voyagerMaterial);
voyager.position.set(-2, 0, 2);
voyager.scale.set(0.2, 0.2, 0.2);
scene.add(voyager);





//--------------------MOON
// Set Moon's distance from Earth
// Set Moon's distance from Earth
const moonDistance = 15;  // Increased distance from Earth (15 units away)

// 1. Load the Moon texture (replace with the path to your Moon texture)
// Load Moon texture
const moonTexture = textureLoader.load('/images/texture/moon.jpg');
moonTexture.encoding = THREE.sRGBEncoding;  // Optional: Ensure proper color space handling

// Create the material for the Moon with the texture and emissive glow
const moonMaterial = new THREE.MeshStandardMaterial({
    map: moonTexture,       // Apply the Moon texture
    metalness: 0.1,         // Slight metalness for realism
    roughness: 0.8,         // Adjust roughness to make it look like the Moon's surface
   
    emissiveIntensity: 1,   // Increase emissive intensity to make it glow more
});

// Create the Moon mesh with the material
const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 32, 32),  // Moon sphere geometry with radius 0.5
    moonMaterial                          // Apply the Moon material
);

// Set the initial position of the Moon (behind the Earth)
moon.position.set(14, 0, -15);  // 15 units behind Earth

// Add the Moon to the scene
scene.add(moon);



//-------------------------------------------
const galaxyParameters = {
    count: 250200,
    size: 0.006,
    radius: 5.01,
    branches: 7,
    spin: -4.342,
    randomness: 0.328,
    randomnessPower: 3,
    insideColor: '#2c485e',  // Core color of the galaxy
    outsideColor: '#000000', // Outer region color of the galaxy
    waveSpeed: 0.1,
    waveHeight: 0,
};

let galaxyGeometry = null;
let galaxyMaterial = null;
let galaxyPoints = null;
let galaxyOriginalPositions = null;

const generateGalaxy = () => {
    if (galaxyPoints !== null) {
        galaxyGeometry.dispose();
        galaxyMaterial.dispose();
        scene.remove(galaxyPoints);
    }

    galaxyGeometry = new THREE.BufferGeometry();
    const galaxyPositions = new Float32Array(galaxyParameters.count * 3);
    const galaxyColors = new Float32Array(galaxyParameters.count * 3);

    const insideGalaxyColor = new THREE.Color(galaxyParameters.insideColor);
    const outsideGalaxyColor = new THREE.Color(galaxyParameters.outsideColor);

    for (let i = 0; i < galaxyParameters.count; i++) {
        const i3 = i * 3;

        const radius = Math.random() * galaxyParameters.radius;
        const spinAngle = radius * galaxyParameters.spin;
        const branchAngle = (i % galaxyParameters.branches) / galaxyParameters.branches * Math.PI * 2;

        const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1);

        galaxyPositions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
        galaxyPositions[i3 + 1] = randomY;
        galaxyPositions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

        const mixedColor = insideGalaxyColor.clone();
        mixedColor.lerp(outsideGalaxyColor, radius / galaxyParameters.radius);

        galaxyColors[i3] = mixedColor.r;
        galaxyColors[i3 + 1] = mixedColor.g;
        galaxyColors[i3 + 2] = mixedColor.b;
    }

    galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
    galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));
    galaxyOriginalPositions = galaxyPositions.slice();

    galaxyMaterial = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    });

    galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
    scene.add(galaxyPoints);
};

generateGalaxy();


const starFieldCount = 5000;
const starPositionsArray = new Float32Array(starFieldCount * 3);
const starFieldMinDistance = 50; // Previously 'minStarDistance'
const starFieldMaxDistance = 200; // Previously 'maxStarDistance'

for (let i = 0; i < starFieldCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const distance = Math.random() * (starFieldMaxDistance - starFieldMinDistance) + starFieldMinDistance;
    const x = distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.cos(phi);
    const z = distance * Math.sin(phi) * Math.sin(theta);

    starPositionsArray[i * 3] = x;
    starPositionsArray[i * 3 + 1] = y;
    starPositionsArray[i * 3 + 2] = z;
}

const starFieldGeometry = new THREE.BufferGeometry();
starFieldGeometry.setAttribute('position', new THREE.BufferAttribute(starPositionsArray, 3));

const starFieldMaterial = new THREE.PointsMaterial({
    color: 0x4fffff,
    sizeAttenuation: true,
    size: 0.03,
});

const starField = new THREE.Points(starFieldGeometry, starFieldMaterial);
scene.add(starField);


let currentSectionIndex = 0;

window.addEventListener('scroll', () => {
    const scrollPositionY = window.scrollY;
    currentSectionIndex = Math.round(scrollPositionY / sizes.height);

    if (galaxyPoints) galaxyPoints.visible = currentSectionIndex === 0;
    if (starField) starField.visible = currentSectionIndex !== 0;
});


const debugGUI = new dat.GUI();

debugGUI.add(galaxyParameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
debugGUI.addColor(galaxyParameters, 'insideColor').onFinishChange(generateGalaxy);
debugGUI.addColor(galaxyParameters, 'outsideColor').onFinishChange(generateGalaxy);
debugGUI.add(galaxyParameters, 'waveSpeed').min(0).max(5).step(0.1);
debugGUI.add(galaxyParameters, 'waveHeight').min(0).max(2).step(0.1);

debugGUI.close();



// Your tick function here...

//--------------------------------------------------------------------------------- * Ozone Layer

const ozoneMaterial = new THREE.MeshBasicMaterial({
    color: 0x027fe0,
    emissive: 0xbde2ff,
    emissiveIntensity: 2,
    transparent: true,
    opacity: 0.20,
});

const ozone = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), ozoneMaterial);
ozone.position.set(0, 0, 0);
ozone.scale.set(1.4, 1.4, 1.4);
scene.add(ozone);



const cloudTexture = textureLoader.load('/images/earth/05_earthcloudmaptrans.png');


const cloudMaterial = new THREE.MeshBasicMaterial({
    map: cloudTexture,
    emissive: 0xbde2ff,
    emissiveIntensity: 2,
    roughness: 0,


    blending: THREE.AdditiveBlending,
   // blending: THREE.MultiplyBlending
    //blending: THREE.NormalBlending
     
    opacity: 0.190, // Fully opaque (since blending is used)
});



const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), cloudMaterial);
cloud.position.set(0, 0, 0);
cloud.scale.set(1.410, 1.400, 1.410);

scene.add(cloud);
//--------------------------------------------------------------------------------EARTH LIGHTS

const earthlightTexture = textureLoader.load('/images/earth/03_earthlights1k.jpg');

const earthlightMaterial = new THREE.MeshBasicMaterial({
    map: earthlightTexture,
    emissive: 0xbde2ff,
    emissiveIntensity: 2,
    blending: THREE.CustomBlending,
    blendEquation: THREE.AddEquation, // Or any other blend equation
    blendSrc: THREE.SrcAlphaFactor, // Or other blend factors
    blendDst: THREE.OneMinusSrcAlphaFactor, // Or other blend factors

    //blending: THREE.AdditiveBlending
   // blending: THREE.MultiplyBlending
    //blending: THREE.NormalBlending
     
    opacity: 0.7, // Fully opaque (since blending is used)
});



const earthlight = new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 64), earthlightMaterial);
earthlight.position.set(0, 0, 0);
earthlight.scale.set(1.420, 1.420, 1.420);

scene.add(earthlight);
//-------------------------------------------------------------------  Correctly set the position and scale for the `cloud` object





//--------------------------------------------------------------------------------- * Particles (Asteroids)

const particleTexture = textureLoader.load('/images/texture/asteroid.avif');
const particlesCount = 250;
const radius = 10;
const minDistance = 0.5;
const particlesGroup = new THREE.Group();
const particleVelocities = [];
const asteroidPositions = [];

for (let i = 0; i < particlesCount; i++) {
    const asteroidRadius = Math.random() * 0.05 + 0.03;
    const particleGeometry = new THREE.SphereGeometry(asteroidRadius, 13, 2);
    const positions = particleGeometry.attributes.position.array;

    for (let j = 0; j < positions.length; j += 3) {
        const noiseFactor = 0.02 * asteroidRadius;
        positions[j] += (Math.random() - 0.5) * noiseFactor;
        positions[j + 1] += (Math.random() - 0.5) * noiseFactor;
        positions[j + 2] += (Math.random() - 0.5) * noiseFactor;
    }
    particleGeometry.attributes.position.needsUpdate = true;

    const particleMaterial = new THREE.MeshStandardMaterial({
        map: particleTexture,

      
        emissiveIntensity: 0.1,
        roughness: 0.8,
        metalness: 0.3,
    });

    const particle = new THREE.Mesh(particleGeometry, particleMaterial);

    let positionValid = false;
    let x, y, z;

    while (!positionValid) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const distance = radius + Math.random() * 4;

        x = distance * Math.sin(phi) * Math.cos(theta);
        y = distance * Math.cos(phi);
        z = distance * Math.sin(phi) * Math.sin(theta);

        positionValid = true;
        for (const pos of asteroidPositions) {
            const dx = pos.x - x;
            const dy = pos.y - y;
            const dz = pos.z - z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (dist < minDistance) {
                positionValid = false;
                break;
            }
        }
    }

    asteroidPositions.push({ x, y, z });
    particle.position.set(x, y, z);
    particlesGroup.add(particle);

    particleVelocities.push({
        x: (Math.random() - 0.5) * 0.005,  // Reduced to slow down movement
        y: (Math.random() - 0.5) * 0.005,  // Reduced to slow down movement
        z: (Math.random() - 0.5) * 0.005,  // Reduced to slow down movement
    });
}// Move particlesGroup closer to the camera





scene.add(particlesGroup);


const loader = new GLTFLoader();

// Array to store the satellites
let satellites = [];
const numberOfSatellites = 3;  // Reduce the number of satellites

const satelliteOrbitSpeed = 0.001;  // Slow orbit speed for the satellite
const satelliteScale = 0.01;  // Smaller scale for satellites

const satelliteDistances = [radius - 6.6, radius - 10, radius - 14, radius - 18, radius - 22];  // Distances of the satellites from Earth



// Load the satellites
for (let i = 0; i < numberOfSatellites; i++) {
    loader.load('/images/3D/satellite.glb', (gltf) => {
        const satellite = gltf.scene;
        satellite.scale.set(satelliteScale, satelliteScale, satelliteScale);  // Scale of the satellite
        satellite.position.set(satelliteDistances[i], 0, 0);  // Position the satellite at a different distance

        // Loop through all the materials of the satellite
        satellite.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = false;

                // Set the material properties for roughness and metalness
                if (child.material.isMeshStandardMaterial) {
                    child.material.roughness = 0;  // Set roughness to 0 (shiny)
                    child.material.metalness = 0.3;  // Set metalness to 1 (fully metallic)
                }
            }
        });

        // Add lighting for realism
        const satelliteLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.1, 2);
        satelliteLight.position.set(40, 5, 5);
        satelliteLight.target = satellite;
        scene.add(satelliteLight);

        scene.add(satellite);  // Add satellite to the scene

        // Store the satellite in the satellites array
        satellites.push(satellite);
    });
}



//--------------------------------------------------------------------------------- * astronaut


let astronaut, mixer;  // Declare a variable to store the astronaut object and mixer
const astroDistance = 5;  // Increased distance from Earth (15 units away)
// Load the Bee model (assuming it is in the same directory or path)
loader.load('/images/3D/Walkingastronaut.glb', (gltf) => {
    astronaut = gltf.scene;

    // Set the scale of the astronaut (adjust to your preference)
    astronaut.scale.set(0.10, 0.10, 0.10);  // Adjust scale as needed

    // Position the astronaut at a specific location in the scene (e.g., next to Earth)
    astronaut.position.set(24, 0, -1);  // Adjust x, y, z values to bring it closer

    // Loop through all the materials of the astronaut to apply lighting/shadow
    astronaut.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            // Set the material properties for roughness and metalness (if applicable)
            if (child.material.isMeshStandardMaterial) {
                child.material.roughness = 0.9;  // Adjust as needed
                child.material.metalness = 0.7;  // Adjust as needed
            }
        }
    });

    // Set up the animation mixer to handle the animations in the model
    mixer = new THREE.AnimationMixer(astronaut);

    // Get animations from the glTF and add them to the mixer
    gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();  // Play all animations
    });

    // Add any additional lighting for the astronaut (optional)
    const astronautLight = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.1, 2);
    astronautLight.position.set(15, 15, 10);  // Position the light to illuminate the astronaut
    astronautLight.target = astronaut;  // Target the astronaut with the light
    scene.add(astronautLight);

    // Add the astronaut to the scene
    scene.add(astronaut);
});
//--------------------------------------------------------------------------------- * Lights
 
const directionalLight = new THREE.DirectionalLight('#ffffff', 3);
directionalLight.position.set(30, 10, 0);
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0x404040, 1);
scene.add(ambientLight);

/**
 * Stars
 */
const starsCount = 20000;
const starPositions = new Float32Array(starsCount * 3);
const minStarDistance = 50;
const maxStarDistance = 200;

for (let i = 0; i < starsCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const distance = Math.random() * (maxStarDistance - minStarDistance) + minStarDistance;
    const x = distance * Math.sin(phi) * Math.cos(theta);
    const y = distance * Math.cos(phi);
    const z = distance * Math.sin(phi) * Math.sin(theta);

    starPositions[i * 3 + 0] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;
}

const starsGeometry = new THREE.BufferGeometry();
starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starsMaterial = new THREE.PointsMaterial({
    color: 0x4fffff,
    sizeAttenuation: true,
    size: 0.03,
});

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);





 //--------------------------------------------------------------------------------- * Camera

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 6;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.enablePan = true;

// Set full rotation for both X and Y axes
controls.maxPolarAngle = Math.PI;  // Allow full vertical rotation (360-degree)
controls.minPolarAngle = 0;        // Allow the camera to rotate all the way down to the ground

controls.maxDistance = 17;
controls.minDistance = 2.6;

const groundHeight = -10;


function checkCameraPosition() {
    // Prevent camera from going below the ground height
    if (camera.position.y < groundHeight) {
        camera.position.y = groundHeight;
    }

    
}

 //--------------------------------------------------------------------------------- * Renderer
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Soft shadows for realism

/**
 //--------------------------------------------------------------------------------- * Animate
 */
 const clock = new THREE.Clock();
let previousTime = 0;
let isVoyagerInView = false;
let rotationSpeed = 0;
let timeout;

// Scroll Event Listener
window.addEventListener('scroll', () => {
    const homeSection = document.querySelector('#home');
    const homeSectionRect = homeSection.getBoundingClientRect();

    // Check if the 'home' section is in view
    if (homeSectionRect.top <= window.innerHeight && homeSectionRect.bottom >= 0) {
        if (!isVoyagerInView) {
            isVoyagerInView = true;
            rotationSpeed = 1;  // Start faster rotation speed
            console.log('Voyager is in view, rotation started at fast speed');

            // Set a timeout to revert back to normal speed after 5 seconds
            clearTimeout(timeout);  // Clear any existing timeout
            timeout = setTimeout(() => {
                rotationSpeed = 0.01;  // Set to normal speed
                console.log('Rotation speed reverted to normal');
            }, 5000); // Revert after 5 seconds
        }
    } else {
        if (isVoyagerInView) {
            isVoyagerInView = false;
            rotationSpeed = 0;  // Stop rotation when out of view
            console.log('Voyager is out of view, rotation stopped');
        }
    }

    // Trigger GSAP animation when the section changes
    // Assuming `newSection` and `currentSection` are properly set and used
     if (newSection !== currentSection) {
         gsap.to(voyager.rotation, {
             duration: 1.5,
             ease: 'power2.inOut',
             x: '+=6',
             y: '+=3'
         });
     }
});





const tick = () => {
    const elapsedTime = clock.getElapsedTime();  // Get elapsed time
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

   
    if (galaxyPoints && galaxyOriginalPositions) {
        const positions = galaxyPoints.geometry.attributes.position.array;
        for (let i = 0; i < galaxyParameters.count; i++) {
            const i3 = i * 3;
            const x = galaxyOriginalPositions[i3];
            const z = galaxyOriginalPositions[i3 + 2];
            const distance = Math.sqrt(x * x + z * z);
            positions[i3 + 1] =
                galaxyOriginalPositions[i3 + 1] +
                Math.sin(distance * 2 + elapsedTime * galaxyParameters.waveSpeed) *
                galaxyParameters.waveHeight *
                (1 - distance / galaxyParameters.radius);
        }
        galaxyPoints.geometry.attributes.position.needsUpdate = true;
    }
    

    controls.update(); // Update camera controls

    // Update Earth's rotation
    earth.rotation.x += 0.010 * deltaTime;
    earth.rotation.y += 0.010 * deltaTime;

    ozone.rotation.x += 0.010 * deltaTime;
    ozone.rotation.y += 0.010 * deltaTime;

   
    earthlight.rotation.x += 0.010 * deltaTime;
    earthlight.rotation.y += 0.010 * deltaTime;

    cloud.rotation.x += 0.020 * deltaTime;
    cloud.rotation.y += 0.020 * deltaTime;

    // Update the Moon's orbit around Earth
    const orbitRadius = moonDistance;  
    const moonOrbitSpeed = 0.010;      

    const voyagerDistance = 2;  // Distance from Earth to Voyager (larger than Moon's orbit)
const voyagerOrbitSpeed = 0.005;  // Speed of the Voyager's orbit
let voyagerRotationSpeed = 0.02; // Rotation speed of Voyager (for its own spin)

    moon.position.x = orbitRadius * Math.cos(elapsedTime * moonOrbitSpeed);
    moon.position.z = orbitRadius * Math.sin(elapsedTime * moonOrbitSpeed);
    moon.rotation.y = elapsedTime * moonOrbitSpeed;

      // Update the Voyager's position for orbiting around Earth
      voyager.position.x = voyagerDistance * Math.cos(elapsedTime * voyagerOrbitSpeed);  // X position
      voyager.position.z = voyagerDistance * Math.sin(elapsedTime * voyagerOrbitSpeed);  // Z position
  
      // Optionally rotate Voyager around its own axis
      voyager.rotation.y = elapsedTime * voyagerRotationSpeed;  // Spin around Y-axis

    if (isVoyagerInView) {
        voyager.rotation.x = elapsedTime * rotationSpeed;  // Rotate around X axis
        voyager.rotation.y = elapsedTime * rotationSpeed;  // Rotate around Y axis
    }
    
    
     // Rotate galaxy for a dynamic effect (optional)
  
   /// Update astronaut's orbit around the Moon
    if (astronaut) {
        const astroOffset = 1.5;  // Distance offset from the Moon
        astronaut.position.x = moon.position.x + astroOffset * Math.cos(elapsedTime * moonOrbitSpeed);
        astronaut.position.z = moon.position.z + astroOffset * Math.sin(elapsedTime * moonOrbitSpeed);
        astronaut.position.y = moon.position.y;

    }
        
     // Animation mixer
    if (mixer) mixer.update(deltaTime);

    

    // Update sun properties
    const sunScaleFactor = 1 + 0.2 * Math.abs(Math.sin(elapsedTime));  // Dynamic sun scale
    sunlayer.scale.set(sunScaleFactor, sunScaleFactor, sunScaleFactor);
    sunlayerMaterial.emissiveIntensity = minIntensity + Math.sin(elapsedTime * pulseSpeed) * (maxIntensity - minIntensity);
    sunlayerMaterial.opacity = 0.2 + 0.1 * Math.sin(elapsedTime * pulseSpeed);

       // Update the particles' positions
       particlesGroup.children.forEach((particle, i) => {
        const velocity = particleVelocities[i];
        particle.position.x += velocity.x;
        particle.position.y += velocity.y;
        particle.position.z += velocity.z;
        
    });
    // Rotate the sphere if it's in view
    

    
   
     
    
    
        satellites.forEach((satellite, index) => {
            const orbitRadius = satelliteDistances[index];  // Get the distance of each satellite from Earth
    
            // Update the satellite's position based on its orbit
            satellite.position.x = orbitRadius * Math.cos(elapsedTime * satelliteOrbitSpeed * (index + 1));  // Multiply by index to make each satellite orbit differently
            satellite.position.z = orbitRadius * Math.sin(elapsedTime * satelliteOrbitSpeed * (index + 1));
    
            // Rotate the satellite (if desired, you can change rotation logic here)
            satellite.rotation.y += 0.10 * deltaTime;
        });
    // Render the scene
    renderer.render(scene, camera);

    // Continue the animation loop
    window.requestAnimationFrame(tick);
    renderer.autoClear = false; // Prevent clearing
    renderer.render(galaxyScene, galaxyCamera);
};


// Start the animation
tick();