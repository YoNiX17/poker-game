import * as THREE from 'three';

// Génère une texture de carte "Dark Mode"
export function createCardTexture(rank: string, suit: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512; // Plus haute résolution pour netteté
    canvas.height = 712;
    const ctx = canvas.getContext('2d')!;
    
    // Background Dark Metal
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Neon Border
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 8;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    ctx.strokeRect(10, 10, 492, 692);
    ctx.shadowBlur = 0; // Reset shadow

    // Determine color (Neon Red or Neon Cyan)
    const isRed = (suit === '♥' || suit === '♦');
    const color = isRed ? '#ff0055' : '#00ccff';
    const glowColor = isRed ? '#ff0055' : '#00ccff';
    
    ctx.fillStyle = color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = glowColor;

    // Font
    const fontFace = 'Arial, sans-serif'; // Canvas n'a pas accès direct aux webfonts parfois sans chargement, on reste safe
    
    // Corner Rank
    ctx.font = 'bold 80px ' + fontFace;
    ctx.textAlign = 'left';
    ctx.fillText(rank, 40, 100);
    ctx.font = '60px ' + fontFace;
    ctx.fillText(suit, 40, 170);

    // Bottom Corner (Rotated)
    ctx.save();
    ctx.translate(canvas.width - 40, canvas.height - 40);
    ctx.rotate(Math.PI);
    ctx.fillText(rank, 0, 0);
    ctx.fillText(suit, 0, 80);
    ctx.restore();

    // Center Large Suit with Glow
    ctx.font = '280px ' + fontFace;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 30;
    ctx.fillText(suit, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// Génère un dos de carte "Cyberpunk"
export function createCardBackTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 712;
    const ctx = canvas.getContext('2d')!;

    // Dark Hex Background
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 3;
    
    // Hex Grid Simulation
    for(let y=0; y<canvas.height; y+=40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Glowing Circuit Lines
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 5;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 50);
    ctx.lineTo(canvas.width/2, canvas.height - 50);
    ctx.moveTo(50, canvas.height/2);
    ctx.lineTo(canvas.width - 50, canvas.height/2);
    ctx.stroke();

    // Central Circle
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Border
    ctx.lineWidth = 15;
    ctx.strokeRect(10, 10, 492, 692);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
