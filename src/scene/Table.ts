import * as THREE from 'three';

export class Table {
    public mesh!: THREE.Group; // Changed to Group to hold multiple parts
    private scene: THREE.Scene;
    public seats: THREE.Vector3[] = [];

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createMesh();
        this.setupSeats();
    }

    private createMesh() {
        this.mesh = new THREE.Group();

        // 1. Surface principale (Sombre, réfléchissante)
        const geometry = new THREE.CylinderGeometry(18, 18, 0.5, 64);
        geometry.scale(1.4, 1, 1);
        
        const material = new THREE.MeshPhysicalMaterial({ 
            color: 0x111111,
            roughness: 0.2,
            metalness: 0.8,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        const tableTop = new THREE.Mesh(geometry, material);
        tableTop.receiveShadow = true;
        this.mesh.add(tableTop);

        // 2. Bordure Néon (Glowing Rim)
        const rimGeom = new THREE.TorusGeometry(18, 0.3, 16, 100);
        rimGeom.scale(1.4, 1, 1);
        rimGeom.rotateX(Math.PI / 2);
        
        const rimMat = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff,
            toneMapped: false // Make it glow brighter if using bloom (optional)
        });
        
        const rim = new THREE.Mesh(rimGeom, rimMat);
        rim.position.y = 0.3; // Légèrement au dessus
        this.mesh.add(rim);

        // 3. Grille holographique au centre (Optionnel visuel)
        const gridHelper = new THREE.GridHelper(20, 20, 0x004444, 0x002222);
        gridHelper.position.y = 0.26;
        gridHelper.scale.set(1.5, 1, 1);
        // On le rend un peu transparent
        (gridHelper.material as THREE.Material).transparent = true;
        (gridHelper.material as THREE.Material).opacity = 0.3;
        this.mesh.add(gridHelper);

        this.mesh.position.y = -0.5;
        this.scene.add(this.mesh);
    }

    private setupSeats() {
        const radii = { x: 20, z: 12 };
        const angles = [
            Math.PI / 2,     // P1 (User)
            Math.PI / 6,     // P2
            -Math.PI / 6,    // P3
            -Math.PI / 2,    // P4
            -5 * Math.PI / 6,// P5
            5 * Math.PI / 6  // P6
        ];

        this.seats = angles.map(angle => {
            return new THREE.Vector3(
                Math.cos(angle) * radii.x,
                0.1,
                Math.sin(angle) * radii.z
            );
        });
    }
}
