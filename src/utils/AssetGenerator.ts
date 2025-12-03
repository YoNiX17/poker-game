import * as THREE from 'three';

// Génère une texture de carte procédurale (Canvas)
export function createCardTexture(rank: string, suit: string): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 356;
    const ctx = canvas.getContext('2d')!;
    
    // Background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 252, 352);

    // Determine color
    const color = (suit === '♥' || suit === '♦') ? '#d00' : '#111';
    
    // Corner Rank
    ctx.fillStyle = color;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(rank, 15, 50);
    ctx.font = '30px Arial';
    ctx.fillText(suit, 15, 90);

    // Bottom Corner (Rotated)
    ctx.save();
    ctx.translate(canvas.width - 15, canvas.height - 15);
    ctx.rotate(Math.PI);
    ctx.fillStyle = color;
    ctx.font = 'bold 40px Arial';
    ctx.fillText(rank, 0, 0);
    ctx.font = '30px Arial';
    ctx.fillText(suit, 0, 40);
    ctx.restore();

    // Center Large Suit
    ctx.font = '140px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(suit, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// Génère une texture de dos de carte stylée
export function createCardBackTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 356;
    const ctx = canvas.getContext('2d')!;

    // Dark pattern
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 2;
    
    // Diamond pattern
    for(let i=0; i<300; i+=20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(i, 0);
        ctx.stroke();
    }

    // Border
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, 246, 346);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}
