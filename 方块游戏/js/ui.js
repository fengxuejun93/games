class UIManager {
    constructor(game) {
        this.game = game;
        this.currentSkin = 'blue';
        this.currentMode = 'single';
        this.selectedLevel = 1;
        
        this.bindEvents();
        this.loadSavedData();
    }
    
    bindEvents() {
        document.getElementById('start-single').addEventListener('click', () => this.showLevelSelect());
        document.getElementById('start-endless').addEventListener('click', () => this.startEndlessMode());
        document.getElementById('start-time').addEventListener('click', () => this.showTimeLevelSelect());
        document.getElementById('start-multi').addEventListener('click', () => this.showMultiMenu());
        document.getElementById('leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('shop-btn').addEventListener('click', () => this.showShop());
        document.getElementById('settings-btn').addEventListener('click', () => this.showSettings());
        
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('back-menu-btn').addEventListener('click', () => this.showMainMenu());
        
        document.getElementById('back-from-shop').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-from-settings').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-from-multi').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-from-level').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-from-leaderboard').addEventListener('click', () => this.showMainMenu());
        
        document.getElementById('jump-btn').addEventListener('click', () => this.handleJump());
        document.getElementById('slide-btn').addEventListener('click', () => this.handleSlide());
        
        document.getElementById('sound-toggle').addEventListener('change', (e) => this.toggleSound(e.target.checked));
        document.getElementById('music-toggle').addEventListener('change', (e) => this.toggleMusic(e.target.checked));
        
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('touchstart', (e) => this.handleTouch(e), { passive: true });
        
        window.addEventListener('resize', () => this.handleResize());
    }
    
    loadSavedData() {
        loadSkinData();
        
        const savedSkin = localStorage.getItem('blockRunner_currentSkin');
        if (savedSkin) {
            this.currentSkin = savedSkin;
        }
        
        const soundEnabled = localStorage.getItem('blockRunner_sound');
        if (soundEnabled !== null) {
            document.getElementById('sound-toggle').checked = soundEnabled === 'true';
        }
        
        const musicEnabled = localStorage.getItem('blockRunner_music');
        if (musicEnabled !== null) {
            document.getElementById('music-toggle').checked = musicEnabled === 'true';
        }
    }
    
    showLevelSelect() {
        this.hideAllMenus();
        document.getElementById('level-select').classList.add('active');
        this.renderLevelSelect('single');
    }
    
    showTimeLevelSelect() {
        this.hideAllMenus();
        document.getElementById('level-select').classList.add('active');
        this.renderLevelSelect('time');
    }
    
    renderLevelSelect(mode) {
        const levelGrid = document.getElementById('level-grid');
        levelGrid.innerHTML = '';
        
        const totalLevels = 10;
        const unlockedLevel = this.getUnlockedLevel(mode);
        
        for (let i = 1; i <= totalLevels; i++) {
            const levelItem = document.createElement('div');
            levelItem.className = `level-item ${i > unlockedLevel ? 'locked' : ''}`;
            levelItem.textContent = i;
            
            if (i <= unlockedLevel) {
                const stars = this.getLevelStars(i, mode);
                const starsDiv = document.createElement('div');
                starsDiv.className = 'level-stars';
                starsDiv.innerHTML = '★'.repeat(stars) + '☆'.repeat(3 - stars);
                starsDiv.style.color = stars > 0 ? '#FFD700' : '#666';
                levelItem.appendChild(starsDiv);
                
                levelItem.addEventListener('click', () => {
                    this.selectedLevel = i;
                    this.currentMode = mode;
                    this.startGame();
                });
            }
            
            levelGrid.appendChild(levelItem);
        }
    }
    
    getUnlockedLevel(mode) {
        const saved = localStorage.getItem(`blockRunner_${mode}Unlocked`);
        if (saved) {
            return parseInt(saved);
        }
        return 1;
    }
    
    setUnlockedLevel(mode, level) {
        const current = this.getUnlockedLevel(mode);
        if (level > current) {
            localStorage.setItem(`blockRunner_${mode}Unlocked`, level.toString());
        }
    }
    
    getLevelStars(level, mode) {
        const saved = localStorage.getItem(`blockRunner_${mode}LevelStars`);
        if (saved) {
            const levels = JSON.parse(saved);
            return levels[level] || 0;
        }
        return 0;
    }
    
    startGame() {
        const skin = SKINS.find(s => s.id === this.currentSkin);
        const player = new Player(skin);
        
        this.hideAllMenus();
        document.getElementById('game-ui').style.display = 'block';
        
        this.game.start(player, this.currentMode, this.selectedLevel);
        player.setGroundY(this.game.groundY);
    }
    
    startEndlessMode() {
        const skin = SKINS.find(s => s.id === this.currentSkin);
        const player = new Player(skin);
        
        this.hideAllMenus();
        document.getElementById('game-ui').style.display = 'block';
        
        this.game.start(player, 'endless', 1);
        player.setGroundY(this.game.groundY);
    }
    
    showMultiMenu() {
        this.hideAllMenus();
        document.getElementById('multi-menu').classList.add('active');
        
        setTimeout(() => {
            document.querySelector('#multi-menu p').textContent = '服务器连接成功';
            document.getElementById('player-list').innerHTML = `
                <div style="margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 10px;">
                    <p>👤 在线玩家: 3</p>
                    <p>🏆 房间: 竞速模式</p>
                </div>
            `;
        }, 1500);
    }
    
    showLeaderboard() {
        this.hideAllMenus();
        document.getElementById('leaderboard-menu').classList.add('active');
        this.renderLeaderboard();
    }
    
    renderLeaderboard() {
        const content = document.getElementById('leaderboard-content');
        const leaderboard = getLeaderboard('endless');
        
        content.innerHTML = '';
        
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const rank = document.createElement('div');
            rank.className = `leaderboard-rank ${index < 3 ? 'top3' : ''}`;
            rank.textContent = index + 1;
            
            const name = document.createElement('div');
            name.className = 'leaderboard-name';
            name.textContent = entry.name;
            
            const score = document.createElement('div');
            score.className = 'leaderboard-score';
            score.textContent = entry.score.toLocaleString();
            
            item.appendChild(rank);
            item.appendChild(name);
            item.appendChild(score);
            
            content.appendChild(item);
        });
        
        const highScore = localStorage.getItem('blockRunner_endlessHighScore');
        if (highScore) {
            const highScoreDiv = document.createElement('div');
            highScoreDiv.style.marginTop = '20px';
            highScoreDiv.style.padding = '15px';
            highScoreDiv.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
            highScoreDiv.style.borderRadius = '10px';
            highScoreDiv.style.color = 'white';
            highScoreDiv.style.textAlign = 'center';
            highScoreDiv.innerHTML = `🏅 你的最高分: <strong>${parseInt(highScore).toLocaleString()}</strong>`;
            content.appendChild(highScoreDiv);
        }
    }
    
    showShop() {
        this.hideAllMenus();
        document.getElementById('shop-menu').classList.add('active');
        this.renderShop();
    }
    
    renderShop() {
        const skinList = document.getElementById('skin-list');
        skinList.innerHTML = '';
        
        const coins = getCoins();
        
        SKINS.forEach(skin => {
            const skinItem = document.createElement('div');
            skinItem.className = `skin-item ${skin.id === this.currentSkin ? 'selected' : ''} ${!skin.unlocked ? 'locked' : ''}`;
            skinItem.style.backgroundColor = skin.color;
            skinItem.title = skin.name;
            
            skinItem.addEventListener('click', () => {
                if (skin.unlocked) {
                    this.selectSkin(skin.id);
                } else if (coins >= skin.price) {
                    if (unlockSkin(skin.id)) {
                        skinItem.classList.remove('locked');
                        this.selectSkin(skin.id);
                        this.renderShop();
                    }
                }
            });
            
            const tooltip = document.createElement('div');
            tooltip.style.position = 'absolute';
            tooltip.style.display = 'none';
            tooltip.style.background = 'rgba(0,0,0,0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '5px';
            tooltip.style.fontSize = '12px';
            
            skinItem.addEventListener('mouseenter', () => {
                tooltip.textContent = skin.unlocked ? `${skin.name}` : `${skin.name} - ${skin.price}金币`;
                document.body.appendChild(tooltip);
                const rect = skinItem.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = rect.top - 30 + 'px';
                tooltip.style.display = 'block';
            });
            
            skinItem.addEventListener('mouseleave', () => {
                tooltip.remove();
            });
            
            skinList.appendChild(skinItem);
        });
        
        const coinDisplay = document.createElement('div');
        coinDisplay.textContent = `💰 ${coins} 金币`;
        coinDisplay.style.marginTop = '20px';
        coinDisplay.style.fontSize = '1.2em';
        coinDisplay.style.color = '#FFD700';
        
        skinList.appendChild(coinDisplay);
    }
    
    selectSkin(skinId) {
        this.currentSkin = skinId;
        localStorage.setItem('blockRunner_currentSkin', skinId);
        
        document.querySelectorAll('.skin-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[title="${SKINS.find(s => s.id === skinId)?.name}"]`).classList.add('selected');
    }
    
    showSettings() {
        this.hideAllMenus();
        document.getElementById('settings-menu').classList.add('active');
    }
    
    showMainMenu() {
        this.hideAllMenus();
        document.getElementById('main-menu').classList.add('active');
    }
    
    hideAllMenus() {
        document.querySelectorAll('.menu').forEach(menu => {
            menu.classList.remove('active');
        });
        document.getElementById('game-ui').style.display = 'none';
    }
    
    restartGame() {
        if (this.currentMode === 'endless') {
            this.startEndlessMode();
        } else {
            this.startGame();
        }
    }
    
    handleJump() {
        if (this.game.player) {
            this.game.player.jump();
        }
    }
    
    handleSlide() {
        if (this.game.player) {
            this.game.player.slide();
        }
    }
    
    handleKeyDown(e) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            this.handleJump();
        } else if (e.code === 'ArrowDown' || e.code === 'ShiftLeft') {
            e.preventDefault();
            this.handleSlide();
        } else if (e.code === 'Escape') {
            if (this.game.isRunning && !this.game.gameOver && !this.game.gameWon) {
                this.game.pause();
            }
        }
    }
    
    handleTouch(e) {
        if (!this.game.isRunning || this.game.gameOver || this.game.gameWon) return;
        
        const touch = e.touches[0];
        const screenHeight = window.innerHeight;
        
        if (touch.clientY < screenHeight / 2) {
            this.handleJump();
        } else {
            this.handleSlide();
        }
    }
    
    handleResize() {
        if (this.game) {
            this.game.setupCanvas();
        }
    }
    
    toggleSound(enabled) {
        localStorage.setItem('blockRunner_sound', enabled.toString());
    }
    
    toggleMusic(enabled) {
        localStorage.setItem('blockRunner_music', enabled.toString());
    }
}