class GameEngine {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 400;
        this.scale = 1;
        
        this.player = null;
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        
        this.gameSpeed = 3;
        this.baseSpeed = 3;
        this.score = 0;
        this.distance = 0;
        this.level = 1;
        
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        this.gameWon = false;
        
        this.groundY = this.height - 60;
        this.groundHeight = 60;
        
        this.cameraX = 0;
        this.obstacleTimer = 0;
        this.collectibleTimer = 0;
        
        this.bgOffset = 0;
        this.clouds = [];
        
        this.gameMode = 'single';
        this.timeLimit = 60;
        this.timeLeft = 60;
        this.targetDistance = 500;
        
        this.setupCanvas();
        this.initClouds();
    }
    
    setupCanvas() {
        const maxWidth = window.innerWidth - 40;
        const maxHeight = window.innerHeight - 40;
        
        if (maxWidth < this.width) {
            this.scale = maxWidth / this.width;
        }
        if (maxHeight * this.scale < this.height) {
            this.scale = maxHeight / this.height;
        }
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.transform = `scale(${this.scale})`;
    }
    
    initClouds() {
        for (let i = 0; i < 5; i++) {
            this.clouds.push({
                x: Math.random() * this.width,
                y: 30 + Math.random() * 80,
                width: 60 + Math.random() * 40,
                speed: 0.5 + Math.random() * 0.5
            });
        }
    }
    
    start(player, mode = 'single', level = 1) {
        this.player = player;
        this.obstacles = [];
        this.collectibles = [];
        this.particles = [];
        this.score = 0;
        this.distance = 0;
        this.level = level;
        this.gameSpeed = this.baseSpeed;
        this.cameraX = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.isRunning = true;
        this.gameMode = mode;
        
        if (mode === 'time') {
            this.timeLimit = 90 - level * 10;
            this.timeLeft = this.timeLimit;
            this.targetDistance = 300 + level * 100;
        } else if (mode === 'endless') {
            this.timeLeft = 0;
        }
        
        this.updateUI();
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        this.update();
        this.render();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.isPaused || this.gameOver || this.gameWon) return;
        
        this.distance += this.gameSpeed * 0.1;
        this.score = Math.floor(this.distance * 10 + this.player.coins * 100);
        
        if (this.gameMode === 'endless') {
            this.gameSpeed = this.baseSpeed + Math.floor(this.distance / 400) * 0.3;
        } else {
            this.gameSpeed = this.baseSpeed + (this.level - 1) * 0.2;
        }
        
        if (this.gameMode === 'single' && this.distance >= this.level * 500) {
            this.gameWonHandler();
            return;
        }
        
        if (this.gameMode === 'time') {
            this.timeLeft -= 1 / 60;
            if (this.timeLeft <= 0) {
                this.gameOverHandler();
                return;
            }
            if (this.distance >= this.targetDistance) {
                this.gameWonHandler();
                return;
            }
        }
        
        this.cameraX += this.gameSpeed;
        this.bgOffset += this.gameSpeed * 0.5;
        
        this.player.update(this.gameSpeed);
        
        const obstacleInterval = this.gameMode === 'endless' 
            ? Math.max(60, 100 - Math.floor(this.distance / 300) * 5)
            : Math.max(60, 100 - (this.level - 1) * 5);
        
        this.obstacleTimer++;
        if (this.obstacleTimer > obstacleInterval) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }
        
        this.collectibleTimer++;
        if (this.collectibleTimer > (this.gameMode === 'endless' ? 80 : 100)) {
            this.spawnCollectible();
            this.collectibleTimer = 0;
        }
        
        this.updateObstacles();
        this.updateCollectibles();
        this.updateParticles();
        this.updateClouds();
        
        this.checkCollisions();
        this.updateUI();
    }
    
    spawnObstacle() {
        const types = ['spike', 'block', 'pit'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let obstacle = null;
        const x = this.width + 50 + this.cameraX;
        
        switch (type) {
            case 'spike':
                obstacle = new Obstacle(x, this.groundY - 30, 'spike');
                break;
            case 'block':
                obstacle = new Obstacle(x, this.groundY - 50, 'block');
                break;
            case 'pit':
                obstacle = new Obstacle(x, this.groundY, 'pit');
                break;
        }
        
        if (obstacle) {
            this.obstacles.push(obstacle);
        }
    }
    
    spawnCollectible() {
        const types = ['coin', 'speed', 'shield', 'magnet'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = this.width + 50 + this.cameraX;
        const y = this.groundY - 80 - Math.random() * 100;
        
        this.collectibles.push(new Collectible(x, y, type));
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obs => {
            obs.update(this.gameSpeed);
            return obs.x > this.cameraX - 100;
        });
    }
    
    updateCollectibles() {
        this.collectibles = this.collectibles.filter(col => {
            col.update(this.gameSpeed);
            return col.x > this.cameraX - 50;
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.update();
            return p.life > 0;
        });
    }
    
    updateClouds() {
        this.clouds.forEach(cloud => {
            cloud.x -= cloud.speed;
            if (cloud.x < -cloud.width) {
                cloud.x = this.width + Math.random() * 100;
            }
        });
    }
    
    checkCollisions() {
        if (!this.player.isInvincible) {
            for (const obs of this.obstacles) {
                if (this.player.collidesWith(obs)) {
                    this.gameOverHandler();
                    return;
                }
            }
        }
        
        for (let i = this.collectibles.length - 1; i >= 0; i--) {
            const col = this.collectibles[i];
            if (this.player.collidesWith(col)) {
                this.collectibles.splice(i, 1);
                this.collectItem(col);
            }
        }
    }
    
    collectItem(item) {
        switch (item.type) {
            case 'coin':
                this.player.coins++;
                this.spawnParticles(item.x, item.y, 'coin');
                break;
            case 'speed':
                this.player.activateSpeedBoost();
                this.spawnParticles(item.x, item.y, 'speed');
                break;
            case 'shield':
                this.player.activateShield();
                this.spawnParticles(item.x, item.y, 'shield');
                break;
            case 'magnet':
                this.player.activateMagnet();
                this.spawnParticles(item.x, item.y, 'magnet');
                break;
        }
    }
    
    spawnParticles(x, y, type) {
        const colors = {
            coin: ['#FFD700', '#FFA500'],
            speed: ['#00FF00', '#00CC00'],
            shield: ['#00BFFF', '#1E90FF'],
            magnet: ['#FF1493', '#FF69B4'],
            levelup: ['#FFD700', '#FFA500', '#FF6347'],
            win: ['#00FF00', '#00CC00', '#009900']
        };
        
        const colorSet = colors[type] || ['#FFFFFF'];
        
        for (let i = 0; i < 10; i++) {
            this.particles.push(new Particle(x, y, colorSet));
        }
    }
    
    gameOverHandler() {
        this.gameOver = true;
        this.isRunning = false;
        
        if (this.gameMode === 'endless') {
            const savedHighScore = localStorage.getItem('blockRunner_endlessHighScore') || 0;
            if (this.score > savedHighScore) {
                localStorage.setItem('blockRunner_endlessHighScore', this.score.toString());
                updateLeaderboard('endless', this.score);
            }
        }
        
        addCoinsOnGameOver(this.player.coins);
        this.showGameOver(false);
    }
    
    gameWonHandler() {
        this.gameWon = true;
        this.isRunning = false;
        
        if (this.gameMode === 'time') {
            const stars = this.calculateStars();
            this.saveLevelStars(this.level, stars);
            
            if (stars >= 3) {
                addCoinsOnGameOver(50);
            }
        }
        
        addCoinsOnGameOver(this.player.coins);
        this.showGameOver(true);
    }
    
    calculateStars() {
        const timeBonus = this.timeLeft / this.timeLimit;
        if (timeBonus > 0.6) return 3;
        if (timeBonus > 0.3) return 2;
        return 1;
    }
    
    saveLevelStars(level, stars) {
        const savedLevels = localStorage.getItem('blockRunner_levelStars') || '{}';
        const levels = JSON.parse(savedLevels);
        if (!levels[level] || stars > levels[level]) {
            levels[level] = stars;
            localStorage.setItem('blockRunner_levelStars', JSON.stringify(levels));
        }
    }
    
    getLevelStars(level) {
        const savedLevels = localStorage.getItem('blockRunner_levelStars') || '{}';
        const levels = JSON.parse(savedLevels);
        return levels[level] || 0;
    }
    
    showGameOver(won) {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-distance').textContent = Math.floor(this.distance);
        
        const starsDisplay = document.getElementById('stars-display');
        const stars = won && this.gameMode === 'time' ? this.calculateStars() : 0;
        
        if (stars > 0) {
            starsDisplay.style.display = 'block';
            document.getElementById('star1').className = stars >= 1 ? 'star active' : 'star';
            document.getElementById('star2').className = stars >= 2 ? 'star active' : 'star';
            document.getElementById('star3').className = stars >= 3 ? 'star active' : 'star';
        } else {
            starsDisplay.style.display = 'none';
        }
        
        document.getElementById('game-over').classList.add('active');
        document.getElementById('game-ui').style.display = 'none';
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('distance').textContent = Math.floor(this.distance);
        document.getElementById('level').textContent = this.level;
        
        const timeStat = document.querySelector('.time-stat');
        if (this.gameMode === 'time') {
            timeStat.style.display = 'inline';
            document.getElementById('time-left').textContent = Math.ceil(this.timeLeft);
        } else {
            timeStat.style.display = 'none';
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.drawClouds();
        this.drawGround();
        
        if (this.gameMode === 'time') {
            this.drawProgressBar();
        }
        
        this.obstacles.forEach(obs => obs.render(this.ctx, this.cameraX));
        this.collectibles.forEach(col => col.render(this.ctx, this.cameraX));
        this.particles.forEach(p => p.render(this.ctx));
        
        if (this.player) {
            this.player.render(this.ctx, this.cameraX);
        }
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        
        if (this.gameMode === 'endless') {
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(0.5, '#16213e');
            gradient.addColorStop(1, '#0f3460');
        } else if (this.gameMode === 'time') {
            gradient.addColorStop(0, '#ffecd2');
            gradient.addColorStop(1, '#fcb69f');
        } else {
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F6FF');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawClouds() {
        this.ctx.fillStyle = this.gameMode === 'endless' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.8)';
        this.clouds.forEach(cloud => {
            this.drawCloud(cloud.x, cloud.y, cloud.width);
        });
    }
    
    drawCloud(x, y, width) {
        const height = width * 0.5;
        this.ctx.beginPath();
        this.ctx.arc(x, y, height * 0.5, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.3, y - height * 0.2, height * 0.4, 0, Math.PI * 2);
        this.ctx.arc(x + width * 0.6, y, height * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGround() {
        let groundGradient;
        
        if (this.gameMode === 'endless') {
            groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
            groundGradient.addColorStop(0, '#2d3436');
            groundGradient.addColorStop(1, '#1e272e');
        } else if (this.gameMode === 'time') {
            groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
            groundGradient.addColorStop(0, '#ff6b6b');
            groundGradient.addColorStop(1, '#ee5a24');
        } else {
            groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
            groundGradient.addColorStop(0, '#4CAF50');
            groundGradient.addColorStop(1, '#2E7D32');
        }
        
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.groundY, this.width, this.groundHeight);
        
        if (this.gameMode === 'endless') {
            this.ctx.fillStyle = '#636e72';
        } else if (this.gameMode === 'time') {
            this.ctx.fillStyle = '#c23616';
        } else {
            this.ctx.fillStyle = '#388E3C';
        }
        
        const grassWidth = 8;
        const offset = this.bgOffset % grassWidth;
        
        for (let x = -offset; x < this.width; x += grassWidth) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, this.groundY);
            this.ctx.lineTo(x + grassWidth / 2, this.groundY - 8);
            this.ctx.lineTo(x + grassWidth, this.groundY);
            this.ctx.fill();
        }
    }
    
    drawProgressBar() {
        const progress = this.distance / this.targetDistance;
        const barWidth = this.width - 40;
        const barHeight = 8;
        const barX = 20;
        const barY = 20;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.beginPath();
        this.ctx.roundRect(barX, barY, barWidth, barHeight, 4);
        this.ctx.fill();
        
        const progressColor = progress > 0.7 ? '#00FF00' : progress > 0.4 ? '#FFD700' : '#FF6347';
        this.ctx.fillStyle = progressColor;
        this.ctx.beginPath();
        this.ctx.roundRect(barX, barY, barWidth * Math.min(progress, 1), barHeight, 4);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`目标: ${Math.floor(this.targetDistance)}m`, this.width / 2, barY + barHeight + 15);
    }
    
    pause() {
        this.isPaused = !this.isPaused;
    }
    
    stop() {
        this.isRunning = false;
    }
}

class Particle {
    constructor(x, y, colors) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 30;
        this.maxLife = 30;
        this.size = 4 + Math.random() * 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.3;
        this.life--;
    }
    
    render(ctx) {
        ctx.globalAlpha = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function updateLeaderboard(mode, score) {
    const leaderboard = getLeaderboard(mode);
    const playerName = '玩家' + Math.floor(Math.random() * 1000);
    leaderboard.push({ name: playerName, score: score, date: Date.now() });
    leaderboard.sort((a, b) => b.score - a.score);
    const top10 = leaderboard.slice(0, 10);
    localStorage.setItem(`blockRunner_${mode}Leaderboard`, JSON.stringify(top10));
}

function getLeaderboard(mode) {
    const saved = localStorage.getItem(`blockRunner_${mode}Leaderboard`);
    if (saved) {
        return JSON.parse(saved);
    }
    
    const mockData = [
        { name: '方块大师', score: 25000, date: Date.now() - 86400000 },
        { name: '跑酷达人', score: 22000, date: Date.now() - 172800000 },
        { name: '闪电侠', score: 18500, date: Date.now() - 259200000 },
        { name: '疾风玩家', score: 15000, date: Date.now() - 345600000 },
        { name: '新手小白', score: 12000, date: Date.now() - 432000000 },
        { name: '游戏王者', score: 10000, date: Date.now() - 518400000 },
        { name: '快乐方块', score: 8000, date: Date.now() - 604800000 },
        { name: '冲冲冲', score: 6500, date: Date.now() - 691200000 },
        { name: '速度之星', score: 5000, date: Date.now() - 777600000 },
        { name: '方块新手', score: 3000, date: Date.now() - 864000000 }
    ];
    
    localStorage.setItem(`blockRunner_${mode}Leaderboard`, JSON.stringify(mockData));
    return mockData;
}