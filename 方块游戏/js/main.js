document.addEventListener('DOMContentLoaded', () => {
    const game = new GameEngine();
    const ui = new UIManager(game);
    
    window.game = game;
    window.ui = ui;
    
    if (navigator.userAgent.match(/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i)) {
        document.body.classList.add('mobile');
    }
    
    const highScore = localStorage.getItem('blockRunner_highScore');
    if (highScore) {
        console.log(`最高分数: ${highScore}`);
    }
});

function addCoinsOnGameOver(coins) {
    const current = getCoins();
    setCoins(current + coins);
}

function getHighScore() {
    return parseInt(localStorage.getItem('blockRunner_highScore') || '0');
}

function setHighScore(score) {
    localStorage.setItem('blockRunner_highScore', score.toString());
}