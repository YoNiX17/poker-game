import { Game } from '../Game';

export function setupControls(game: Game) {
    const btnBet = document.getElementById('btn-bet') as HTMLButtonElement;
    const btnCheck = document.getElementById('btn-check') as HTMLButtonElement;
    const btnFold = document.getElementById('btn-fold') as HTMLButtonElement;

    if (!btnBet || !btnCheck || !btnFold) {
        console.error("UI elements not found");
        return;
    }

    btnBet.addEventListener('click', () => {
        if (game.currentState === 'IDLE') {
            game.dealHoleCards();
            btnBet.textContent = "Bet";
        } else if (game.currentState === 'PREFLOP') {
            game.dealFlop();
        } else if (game.currentState === 'FLOP') {
            game.dealTurn();
        } else if (game.currentState === 'TURN') {
            game.dealRiver();
        } else if (game.currentState === 'RIVER') {
            game.endRound();
            btnBet.textContent = "Deal New Hand";
        }
    });

    btnCheck.addEventListener('click', () => {
        // Logique simplifiée : Check avance comme un Bet ici
        btnBet.click(); 
    });

    btnFold.addEventListener('click', () => {
        game.endRound();
        // Pour un reset rapide, on réinitialise via un nouveau deal au prochain clic
        btnBet.textContent = "Deal New Hand";
    });
}
