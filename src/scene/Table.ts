import * as THREE from 'three';

export class Table {
    public mesh!: THREE.Group;
    private scene: THREE.Scene;
    public seats: THREE.Vector3[] = [];

    // Dimensions
    private width = 30;
    private depth = 16;
    private railWidth = 2.5;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.createMesh();
        this.setupSeats();
    }

    private createMesh() {
        this.mesh = new THREE.Group();

        // --- 1. Forme de base (Stade) ---
        const shape = new THREE.Shape();
        const w = this.width / 2;
        const d = this.depth / 2;
        const radius = d; // Rayon pour les bouts ronds

        // Dessin du tracé de la table (centre rectangulaire + bouts ronds)
        shape.moveTo(-w + radius, -d);
        shape.lineTo(w - radius, -d);
        shape.absarc(w - radius, 0, radius, -Math.PI / 2, Math.PI / 2, false);
        shape.lineTo(-w + radius, d);
        shape.absarc(-w + radius, 0, radius, Math.PI / 2, -Math.PI / 2, false);

        // --- 2. Le Tapis (Felt) ---
        // Géométrie plate pour le centre
        const feltGeom = new THREE.ShapeGeometry(shape);
        // Rotation pour être à plat
        feltGeom.rotateX(-Math.PI / 2);

        const feltMat = new THREE.MeshStandardMaterial({ 
            color: 0x050505, // Gris très foncé presque noir
            roughness: 1.0,  // Très rugueux (tissu)
            metalness: 0.0,
        });

        const felt = new THREE.Mesh(feltGeom, feltMat);
        felt.receiveShadow = true;
        felt.position.y = 0; // Niveau 0 de référence
        this.mesh.add(felt);

        // --- 3. Le Rebord (Rail) ---
        // On extrude la même forme mais avec un trou au milieu pour faire le tour
        const railShape = new THREE.Shape(shape.getPoints());
        
        // Créer le trou (un peu plus petit que la table globale)
        const holePath = new THREE.Path();
        const innerRadius = radius - this.railWidth;
        const innerW = w - this.railWidth;
        
        // Logique inverse pour le trou (Clockwise)
        holePath.moveTo(-w + radius, -d + this.railWidth);
        holePath.absarc(w - radius, 0, innerRadius, -Math.PI / 2, Math.PI / 2, false);
        holePath.lineTo(-w + radius, d - this.railWidth);
        holePath.absarc(-w + radius, 0, innerRadius, Math.PI / 2, -Math.PI / 2, false);
        railShape.holes.push(holePath);

        const railGeom = new THREE.ExtrudeGeometry(railShape, {
            depth: 1.5, // Epaisseur du rebord
            bevelEnabled: true,
            bevelThickness: 0.5,
            bevelSize: 0.5,
            bevelSegments: 8 // Arrondi lisse
        });
        railGeom.rotateX(-Math.PI / 2);

        // Matériau Cuir / Carbone
        const railMat = new THREE.MeshPhysicalMaterial({
            color: 0x111111,
            roughness: 0.4,
            metalness: 0.1,
            clearcoat: 0.8, // Effet vernis/cuir
            clearcoatRoughness: 0.3
        });

        const rail = new THREE.Mesh(railGeom, railMat);
        rail.position.y = 0; // Pose sur le même plan, l'extrusion monte
        rail.castShadow = true;
        rail.receiveShadow = true;
        this.mesh.add(rail);

        // --- 4. Bandeau Néon (Sous le rebord) ---
        // Un tube fin qui suit le contour intérieur
        // Simplification: on réutilise le shapeGeometry du trou, on le scale un peu
        const neonGeom = new THREE.TorusGeometry(1, 0.1, 8, 100); 
        // Note: Pour suivre parfaitement la forme "stade" avec un tube, c'est complexe mathématiquement
        // On va tricher avec un plan lumineux juste sous le rebord intérieur
        
        const innerShapePoints = holePath.getPoints();
        const neonShape = new THREE.Shape(innerShapePoints);
        const neonMeshGeom = new THREE.ShapeGeometry(neonShape);
        neonMeshGeom.rotateX(-Math.PI / 2);
        
        const neonMat = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            side: THREE.DoubleSide
        });
        
        const neon = new THREE.Mesh(neonMeshGeom, neonMat);
        neon.position.y = 0.05; // Juste au dessus du tapis
        // On le scale pour qu'il ne soit visible que comme une fine ligne
        neon.scale.set(0.99, 0.99, 0.99); 
        this.mesh.add(neon);

        // --- 5. Pieds / Base (Pour la profondeur) ---
        const baseGeom = new THREE.CylinderGeometry(8, 12, 6, 32);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.8 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = -3;
        this.mesh.add(base);

        this.scene.add(this.mesh);
    }

    private setupSeats() {
        // Positions ajustées à la nouvelle taille
        const rX = this.width / 2 + 2; // Un peu en dehors de la table
        const rZ = this.depth / 2 + 2;

        // Positions elliptiques approximatives pour le placement des cartes
        // On vise l'intérieur de la table (le tapis) donc on réduit les rayons
        const cardPlaceX = this.width / 2 - 4;
        const cardPlaceZ = this.depth / 2 - 3;

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
                Math.cos(angle) * cardPlaceX,
                0.2, // Y = 0.2 pour être sûr d'être au dessus du tapis (Y=0)
                Math.sin(angle) * cardPlaceZ
            );
        });
    }
}
