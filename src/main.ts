import './styles.css';
import * as THREE from 'three';
import { Table } from './scene/Table';
import { Game } from './Game';
import { setupControls } from './ui/Controls';

// 1. Scene Setup
const scene = new THREE.Scene();
// Noir profond pour le contraste néon
scene.background = new THREE.Color(0x050505); 
scene.fog = new THREE.FogExp2(0x050505, 0.015);

// 2. Camera
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 30, 40); // Un peu plus haut pour vue tactique
camera.lookAt(0, 0, -2);

// 3. Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Tone mapping pour éviter que les couleurs saturent trop
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const container = document.getElementById('game-container');
if (container) {
    container.appendChild(renderer.domElement);
}

// 4. Lumières Cyberpunk
// Ambient sombre bleu
const ambientLight = new THREE.AmbientLight(0x001133, 0.5);
scene.add(ambientLight);

// Lumière principale Cyan (Gauche)
const rectLight1 = new THREE.RectAreaLight(0x00ffff, 2, 20, 20);
rectLight1.position.set(-15, 10, 10);
rectLight1.lookAt(0, 0, 0);
scene.add(rectLight1);

// Lumière secondaire Magenta (Droite)
const rectLight2 = new THREE.RectAreaLight(0xff00ff, 2, 20, 20);
rectLight2.position.set(15, 10, 10);
rectLight2.lookAt(0, 0, 0);
scene.add(rectLight2);

// Spot central pour bien voir les cartes
const spotLight = new THREE.SpotLight(0xffffff, 100);
spotLight.position.set(0, 40, 5);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 2;
spotLight.distance = 100;
spotLight.castShadow = true;
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

    // Petit mouvement flottant de la table pour effet "vaisseau spatial"
    if (table.mesh) {
        table.mesh.position.y = -0.5 + Math.sin(time * 0.5) * 0.05;
    }

    renderer.render(scene, camera);
}

animate();

console.log("Neon System Online.");
