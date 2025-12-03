import * as THREE from 'three';

export class Table {
    public mesh!: THREE.Mesh;
    private scene: THREE.Scene;
    public seats: THREE.Vector3[] = []; // Positions des 6 joueurs

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createMesh();
        this.setupSeats();
    }

    private createMesh() {
        // Forme de la table (Stade / Ellipse)
        const geometry = new THREE.CylinderGeometry(18, 18, 1, 64);
        geometry.scale(1.4, 1, 1); // Rendre ovale

        // Texture feutrine
        const material = new THREE.MeshStandardMaterial({ 
            color: 0x0f3b1e, // Vert poker sombre
            roughness: 0.9,
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.y = -0.5;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Bordure en bois
        const borderGeom = new THREE.TorusGeometry(18, 1.5, 16, 100);
        borderGeom.scale(1.4, 1, 1);
        borderGeom.rotateX(Math.PI / 2);
        const borderMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.3 });
        const border = new THREE.Mesh(borderGeom, borderMat);
        border.position.y = 0;
        this.scene.add(border);
    }

    private setupSeats() {
        // Calcul des positions pour 6 joueurs autour de l'ellipse
        const radii = { x: 20, z: 12 };
        const angles = [
            Math.PI / 2,     // P1 (User) - Bottom
            Math.PI / 6,     // P2
            -Math.PI / 6,    // P3
            -Math.PI / 2,    // P4 - Top
            -5 * Math.PI / 6,// P5
            5 * Math.PI / 6  // P6
        ];

        this.seats = angles.map(angle => {
            return new THREE.Vector3(
                Math.cos(angle) * radii.x,
                0.1, // Juste au dessus de la table
                Math.sin(angle) * radii.z
            );
        });
    }
}
