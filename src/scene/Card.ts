import * as THREE from 'three';
import gsap from 'gsap';
import { createCardTexture, createCardBackTexture } from '../utils/AssetGenerator';

const sharedBackTexture = createCardBackTexture();

export class Card {
    public mesh: THREE.Mesh; // C'est maintenant un seul Mesh (Box) au lieu d'un Groupe
    public rank: string;
    public suit: string;
    public isFaceUp: boolean = false;

    constructor(rank: string, suit: string) {
        this.rank = rank;
        this.suit = suit;

        // Géométrie BOITE pour donner de l'épaisseur (adieu l'effet papier)
        // Largeur 2.5, Hauteur 3.5, Epaisseur 0.04
        const geometry = new THREE.BoxGeometry(2.5, 3.5, 0.04);

        // Textures
        const frontTexture = createCardTexture(rank, suit);
        // Il faut tourner la texture front car BoxGeometry UV mapping est différent de Plane
        frontTexture.center = new THREE.Vector2(0.5, 0.5);
        frontTexture.rotation = 0; // Ajuster si besoin selon le générateur

        // Matériaux : Array de 6 matériaux pour les faces du cube
        // Ordre: Right, Left, Top, Bottom, Front, Back
        // Note: Avec BoxGeometry standard, Front est Z+, Back est Z-
        
        const sideMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.5 }); // Tranche blanche/grise
        const frontMat = new THREE.MeshStandardMaterial({ 
            map: frontTexture, 
            roughness: 0.3, 
            metalness: 0.1 
        });
        const backMat = new THREE.MeshStandardMaterial({ 
            map: sharedBackTexture, 
            roughness: 0.4, 
            metalness: 0.4 
        });

        const materials = [
            sideMat, // Right
            sideMat, // Left
            sideMat, // Top
            sideMat, // Bottom
            backMat, // Front (Z+) -> On met le dos ici par défaut (carte cachée)
            frontMat // Back (Z-) -> La face visible sera derrière
        ];

        this.mesh = new THREE.Mesh(geometry, materials);
        
        // Par défaut, carte posée sur le dos (Back visible vers le haut si RotX = -90)
        // BoxGeometry est centrée en 0,0,0. Si on la pose à Y=0, la moitié est sous terre.
        // On décale la géométrie pour que le pivot soit au "dos" de la carte
        geometry.translate(0, 0, 0); 
        
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Rotation initiale : Dos vers le haut
        this.mesh.rotation.x = -Math.PI / 2;
    }

    moveTo(x: number, y: number, z: number, delay: number = 0, duration: number = 0.8) {
        // IMPORTANT: On force Y à être au moins égal à l'épaisseur/2 + marge
        // Si la table est à Y=0, la carte doit être à Y=0.03 min
        const safeY = Math.max(y, 0.03);

        return gsap.to(this.mesh.position, {
            x: x, y: safeY, z: z,
            duration: duration,
            delay: delay,
            ease: "power2.inOut"
        });
    }

    rotateTo(x: number, y: number, z: number, delay: number = 0, duration: number = 0.8) {
        return gsap.to(this.mesh.rotation, {
            x: x, y: y, z: z,
            duration: duration,
            delay: delay,
            ease: "power2.inOut"
        });
    }

    flip(delay: number = 0) {
        this.isFaceUp = !this.isFaceUp;
        
        const tl = gsap.timeline({ delay: delay });

        // On saute assez haut pour être sûr de ne pas clipper le rebord de la table
        tl.to(this.mesh.position, { 
            y: this.mesh.position.y + 3, 
            duration: 0.4, 
            ease: "power1.out" 
        }, 0);

        // Rotation : 
        // Etat initial (Dos visible) : X = -PI/2
        // Etat final (Face visible) : X = PI/2 (pour montrer la face arrière du cube qui contient la texture Front)
        const targetRotX = this.isFaceUp ? Math.PI / 2 : -Math.PI / 2;

        tl.to(this.mesh.rotation, {
            x: targetRotX, 
            y: this.mesh.rotation.y + Math.PI, // On ajoute un tour complet ou demi-tour en Y pour le style
            z: (Math.random() * 0.1) - 0.05,
            duration: 0.7,
            ease: "back.out(1.0)"
        }, 0);

        // Atterrissage safe
        tl.to(this.mesh.position, { 
            y: 0.04, // Juste au dessus du tapis
            duration: 0.5, 
            ease: "bounce.out" 
        }, 0.3);

        return tl;
    }
}
