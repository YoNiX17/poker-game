import * as THREE from 'three';
import gsap from 'gsap';
import { Card } from './scene/Card';
import { Table } from './scene/Table';

export type GameState = 'IDLE' | 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER';

export class Game {
    private scene: THREE.Scene;
    private table: Table;
    private deck: { rank: string, suit: string }[] = [];
    private drawnCards: Card[] = []; // Cartes instanciées (pour cleanup)
    private playerHands: Card[][] = [[],[],[],[],[],[]];
    private boardCards: Card[] = [];
    
    // Positions fixes
    private deckPosition = new THREE.Vector3(-10, 2, 0);
    private boardPositions: THREE.Vector3[] = [];

    public currentState: GameState = 'IDLE';

    constructor(scene: THREE.Scene, table: Table) {
        this.scene = scene;
        this.table = table;
        
        // Positions des cartes communes (Flop, Turn, River)
        for(let i=0; i<5; i++) {
            this.boardPositions.push(new THREE.Vector3((i - 2) * 3, 0.1, 0));
        }
    }

    private initDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];

        // Nettoyage scène précédente
        this.drawnCards.forEach(c => this.scene.remove(c.mesh));
        this.drawnCards = [];
        this.playerHands = [[],[],[],[],[],[]];
        this.boardCards = [];

        // Création logique
        for(let s of suits) {
            for(let r of ranks) {
                this.deck.push({ rank: r, suit: s });
            }
        }
        this.shuffle();
    }

    private shuffle() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    private spawnCard(): Card {
        const data = this.deck.pop();
        if (!data) throw new Error("Deck empty");

        const card = new Card(data.rank, data.suit);
        
        // Position de départ (le deck)
        card.mesh.position.copy(this.deckPosition);
        card.mesh.rotation.x = -Math.PI / 2; // A plat, dos visible
        card.mesh.rotation.z = Math.random() * 0.2;
        
        this.scene.add(card.mesh);
        this.drawnCards.push(card);
        return card;
    }

    // --- Phases de jeu ---

    public async dealHoleCards() {
        if (this.currentState !== 'IDLE') return;
        this.initDeck();
        this.currentState = 'PREFLOP';
        this.updateStatus("Distribution...");

        // Distribution 2 cartes à 6 joueurs
        for (let k = 0; k < 2; k++) {
            for (let p = 0; p < 6; p++) {
                const card = this.spawnCard();
                this.playerHands[p].push(card);

                const seatPos = this.table.seats[p];
                const offsetX = (k === 0) ? -0.7 : 0.7; 
                
                const delay = (k * 6 + p) * 0.1; // Séquentiel
                
                card.moveTo(seatPos.x + offsetX, seatPos.y, seatPos.z, delay);
                
                // Calcul angle vers le centre
                const lookAtVec = new THREE.Vector3(0,0,0);
                const angle = Math.atan2(lookAtVec.z - seatPos.z, lookAtVec.x - seatPos.x);
                
                // Animation spécifique pour le joueur principal (index 0)
                if (p === 0) {
                    gsap.to(card.mesh.rotation, {
                        x: -Math.PI / 3, // Incliné vers la caméra
                        y: angle + Math.PI / 2,
                        z: 0,
                        delay: delay, duration: 0.6
                    });
                    
                    // Révéler les cartes du joueur (animation de flip simple)
                     setTimeout(() => {
                         gsap.to(card.mesh.rotation, {
                             x: -Math.PI/4,
                             y: Math.PI, // Face visible
                             z: 0,
                             delay: delay + 0.5
                         });
                    }, 0);
                } else {
                    // Bots : cartes à plat cachées
                    card.rotateTo(-Math.PI/2, angle + Math.PI/2, 0, delay);
                }
            }
        }
    }

    public async dealFlop() {
        if (this.currentState !== 'PREFLOP') return;
        this.updateStatus("Le Flop");
        
        for(let i=0; i<3; i++) {
            const card = this.spawnCard();
            this.boardCards.push(card);
            const pos = this.boardPositions[i];
            
            card.moveTo(pos.x, pos.y, pos.z, i*0.2);
            card.flip(0.6 + i*0.2);
        }
        this.currentState = 'FLOP';
    }

    public async dealTurn() {
        if (this.currentState !== 'FLOP') return;
        this.updateStatus("Le Turn");

        const card = this.spawnCard();
        this.boardCards.push(card);
        const pos = this.boardPositions[3];

        card.moveTo(pos.x, pos.y, pos.z, 0);
        card.flip(0.6);
        this.currentState = 'TURN';
    }

    public async dealRiver() {
        if (this.currentState !== 'TURN') return;
        this.updateStatus("La River");

        const card = this.spawnCard();
        this.boardCards.push(card);
        const pos = this.boardPositions[4];

        card.moveTo(pos.x, pos.y, pos.z, 0);
        card.flip(0.6);
        this.currentState = 'RIVER';
    }

    public endRound() {
        this.updateStatus("Fin de manche. Relancez !");
        this.currentState = 'IDLE';
    }

    private updateStatus(text: string) {
        const el = document.getElementById('game-status');
        if (el) el.innerText = text;
    }
}
