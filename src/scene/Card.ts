import * as THREE from 'three';
import gsap from 'gsap';
import { createCardTexture, createCardBackTexture } from '../utils/AssetGenerator';

const sharedBackTexture = createCardBackTexture();

export class Card {
    public mesh: THREE.Group;
    public rank: string;
    public suit: string;
    public isFaceUp: boolean = false;

    constructor(rank: string, suit: string) {
        this.rank = rank;
        this.suit = suit;

        const geometry = new THREE.PlaneGeometry(2.5, 3.5);

        // Matériau physique pour mieux réagir aux lumières colorées
        const frontMat = new THREE.MeshStandardMaterial({ 
            map: createCardTexture(rank, suit),
            roughness: 0.3,
            metalness: 0.1,
            emissive: 0x222222, // Légère auto-luminescence pour le noir
            emissiveIntensity: 0.2
        });
        
        const backMat = new THREE.MeshStandardMaterial({ 
            map: sharedBackTexture,
            roughness: 0.4,
            metalness: 0.6
        });

        const frontMesh = new THREE.Mesh(geometry, frontMat);
        frontMesh.rotation.y = Math.PI;
        frontMesh.position.z = -0.01; 
        frontMesh.castShadow = true;

        const backMesh = new THREE.Mesh(geometry, backMat);
        backMesh.castShadow = true;

        this.mesh = new THREE.Group();
        this.mesh.add(frontMesh);
        this.mesh.add(backMesh);
    }

    // Déplacement fluide avec "power2.inOut" pour moins de rigidité
    moveTo(x: number, y: number, z: number, delay: number = 0, duration: number = 0.8) {
        return gsap.to(this.mesh.position, {
            x: x, y: y, z: z,
            duration: duration,
            delay: delay,
            ease: "power2.inOut"
        });
    }

    // Rotation
    rotateTo(x: number, y: number, z: number, delay: number = 0, duration: number = 0.8) {
        return gsap.to(this.mesh.rotation, {
            x: x, y: y, z: z,
            duration: duration,
            delay: delay,
            ease: "power2.inOut"
        });
    }

    // Flip amélioré : on lève la carte plus haut pour éviter qu'elle traverse la table
    flip(delay: number = 0) {
        this.isFaceUp = !this.isFaceUp;
        
        const tl = gsap.timeline({ delay: delay });

        // 1. Monter
        tl.to(this.mesh.position, { 
            y: this.mesh.position.y + 2.5, 
            duration: 0.3, 
            ease: "power1.out" 
        }, 0);

        // 2. Tourner (pendant la montée/descente)
        tl.to(this.mesh.rotation, {
            x: -Math.PI / 2, // A plat
            y: Math.PI,      // Tourné
            z: (Math.random() * 0.1) - 0.05, // Imperfection naturelle
            duration: 0.6,
            ease: "back.out(1.2)"
        }, 0);

        // 3. Redescendre
        tl.to(this.mesh.position, { 
            y: 0.1, // Hauteur finale sur la table (fixe pour éviter les erreurs d'arrondi)
            duration: 0.4, 
            ease: "bounce.out" 
        }, 0.3);

        return tl;
    }
}
