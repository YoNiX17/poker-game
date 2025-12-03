import './styles.css';
import * as THREE from 'three';
import { Table } from './scene/Table';
import { Game } from './Game';
import { setupControls } from './ui/Controls';

// 1. Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505); 
scene.fog = new THREE.FogExp2(0x050505, 0.012); // Brouillard un peu moins dense

// 2. Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
// Position ajustée pour la nouvelle table plus large
camera.position.set(0, 35, 45); 
camera.lookAt(0, 0, 0);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
// PCFSoft est bien, mais VSM peut être plus smooth si bien réglé. Restons sur PCFSoft safe.
renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;

const container = document.getElementById('game-container');
if (container) {
    container.appendChild(renderer.domElement);
}

// 4. Lumières
const ambientLight = new THREE.AmbientLight(0x001133, 0.6);
scene.add(ambientLight);

// RectLights pour l'ambiance Cyberpunk (Plus larges pour reflets sur le cuir)
const rectLight1 = new THREE.RectAreaLight(0x00ffff, 3, 30, 30);
rectLight1.position.set(-20, 15, 0); // Coté gauche
rectLight1.lookAt(0, 0, 0);
scene.add(rectLight1);

const rectLight2 = new THREE.RectAreaLight(0xff00ff, 3, 30, 30);
rectLight2.position.set(20, 15, 0); // Coté droit
rectLight2.lookAt(0, 0, 0);
scene.add(rectLight2);

// Spot principal (Le "Dealer") - Ombres précises
const spotLight = new THREE.SpotLight(0xffffff, 80);
spotLight.position.set(0, 50, 10);
spotLight.angle = Math.PI / 5;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 100;
spotLight.castShadow = true;
// Optimisation des ombres pour éviter les artefacts sur la table
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
spotLight.shadow.bias = -0.0001; 
spotLight.shadow.normalBias = 0.02; // Important pour les objets courbes
scene.add(spotLight);

// 5. Init Game
const table = new Table(scene);
const game = new Game(scene, table);

setupControls(game);

const loader = document.getElementById('loader');
if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
}

// 6. Responsive
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Animation subtile des lumières néon (pulsation)
    const pulse = 2 + Math.sin(time * 2) * 1;
    rectLight1.intensity = pulse;
    rectLight2.intensity = 3 + Math.cos(time * 1.5) * 1;

    renderer.render(scene, camera);
}

animate();

console.log("Realistic Neon System Online.");
