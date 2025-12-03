import * as THREE from 'three';
import gsap from 'gsap';
import { createCardTexture, createCardBackTexture } from '../utils/AssetGenerator';

// Singleton pour éviter de recréer la texture dos 52 fois
const sharedBackTexture = createCardBackTexture();

export class Card {
    public mesh: THREE.Group;
    public rank: string;
    public suit: string;
    public isFaceUp: boolean = false;

    constructor(rank: string, suit: string) {
        this.rank = rank;
        this.suit = suit;

        // Géométrie de la carte (taille standard poker ratio 2.5 x 3.5)
        const geometry = new THREE.PlaneGeometry(2.5, 3.5);

        // Matériaux
        const frontMat = new THREE.MeshStandardMaterial({ 
            map: createCardTexture(rank, suit),
            roughness: 0.4,
            metalness: 0.0
        });
        
        const backMat = new THREE.MeshStandardMaterial({ 
            map: sharedBackTexture,
            roughness: 0.4,
            metalness: 0.1
        });

        // Création des faces (Recto / Verso)
        const frontMesh = new THREE.Mesh(geometry, frontMat);
        frontMesh.rotation.y = Math.PI; // Face vers l'arrière initialement
        frontMesh.receiveShadow = true;
        frontMesh.castShadow = true;
        // Petite épaisseur visuelle pour éviter le z-fighting
        frontMesh.position.z = -0.01; 

        const backMesh = new THREE.Mesh(geometry, backMat);
        backMesh.receiveShadow = true;
        backMesh.castShadow = true;

        // Group pour manipuler la carte entière
        this.mesh = new THREE.Group();
        this.mesh.add(frontMesh);
        this.mesh.add(backMesh);
    }

    // Animation de déplacement vers une position
    moveTo(x: number, y: number, z: number, delay: number = 0, duration: number = 0.6) {
        return gsap.to(this.mesh.position, {
            x: x, y: y, z: z,
            duration: duration,
            delay: delay,
            ease: "power2.out"
        });
    }

    // Animation de rotation
    rotateTo(x: number, y: number, z: number, delay: number = 0, duration: number = 0.6) {
        return gsap.to(this.mesh.rotation, {
            x: x, y: y, z: z,
            duration: duration,
            delay: delay,
            ease: "power2.out"
        });
    }

    // Retourner la carte
    flip(delay: number = 0) {
        this.isFaceUp = !this.isFaceUp;
        
        // Petit saut en Z pour le réalisme
        gsap.to(this.mesh.position, { y: this.mesh.position.y + 1, duration: 0.2, yoyo: true, repeat: 1, delay: delay });
        
        // La rotation du groupe entier
        return gsap.to(this.mesh.rotation, {
            x: -Math.PI / 2, // A plat sur la table
            y: Math.PI,      // Retournée
            z: Math.random() * 0.2 - 0.1, // Légère variation aléatoire
            duration: 0.5,
            delay: delay,
            ease: "back.out(1.2)"
        });
    }
}
