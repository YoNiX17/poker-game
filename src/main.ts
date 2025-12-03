import './styles.css'; // Import des styles via Vite
import * as THREE from 'three';
import { Table } from './scene/Table';
import { Game } from './Game';
import { setupControls } from './ui/Controls';

// 1. Initialisation Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x1a1a1a, 20, 80);

// 2. Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 25, 35);
camera.lookAt(0, 0, -5);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.getElementById('game-container');
if (container) {
    container.appendChild(renderer.domElement);
}

// 4. Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xffd700, 1.5);
spotLight.position.set(0, 40, 10);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 2048;
spotLight.shadow.mapSize.height = 2048;
scene.add(spotLight);

// 5. Initialisation du Jeu
const table = new Table(scene);
const game = new Game(scene, table);

// 6. UI
setupControls(game);

// Retrait du loader
const loader = document.getElementById('loader');
if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
}

// 7. Responsive
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 8. Boucle d'animation
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();

console.log("Poker Starter (Vite Module) Loaded.");
