class Player {
    constructor(skin) {
        this.x = 100;
        this.y = 0;
        this.width = 40;
        this.height = 40;
        
        this.skin = skin || { color: '#3498db', pattern: 'solid' };
        
        this.baseSpeed = 5;
        this.speedBoost = 0;
        
        this.jumpForce = 15;
        this.gravity = 0.8;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        
        this.coins = 0;
        this.isInvincible = false;
        this.isMagnetActive = false;
        
        this.invincibleTimer = 0;
        this.magnetTimer = 0;
        this.speedTimer = 0;
        
        this.animationFrame = 0;
        
        this.groundY = 0;
    }
    
    setGroundY(y) {
        this.groundY = y;
        this.y = this.groundY - this.height;
    }
    
    update(gameSpeed) {
        const currentSpeed = gameSpeed + this.speedBoost;
        
        if (this.isSliding && !this.isJumping) {
            this.height = 20;
            this.y = this.groundY - this.height;
        } else if (!this.isJumping) {
            this.height = 40;
            this.y = this.groundY - this.height;
        }
        
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        if (this.y >= this.groundY - this.height) {
            this.y = this.groundY - this.height;
            this.velocityY = 0;
            this.isJumping = false;
        }
        
        this.animationFrame++;
        
        if (this.isInvincible) {
            this.invincibleTimer--;
            if (this.invincibleTimer <= 0) {
                this.isInvincible = false;
            }
        }
        
        if (this.isMagnetActive) {
            this.magnetTimer--;
            if (this.magnetTimer <= 0) {
                this.isMagnetActive = false;
            }
        }
        
        if (this.speedBoost > 0) {
            this.speedTimer--;
            if (this.speedTimer <= 0) {
                this.speedBoost = 0;
            }
        }
    }
    
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.velocityY = -this.jumpForce;
            this.isJumping = true;
        }
    }
    
    slide() {
        if (!this.isJumping) {
            this.isSliding = true;
            setTimeout(() => {
                this.isSliding = false;
            }, 500);
        }
    }
    
    activateSpeedBoost() {
        this.speedBoost = 3;
        this.speedTimer = 300;
    }
    
    activateShield() {
        this.isInvincible = true;
        this.invincibleTimer = 600;
    }
    
    activateMagnet() {
        this.isMagnetActive = true;
        this.magnetTimer = 400;
    }
    
    collidesWith(obj) {
        return this.x < obj.x + obj.width &&
               this.x + this.width > obj.x &&
               this.y < obj.y + obj.height &&
               this.y + this.height > obj.y;
    }
    
    render(ctx, cameraX) {
        const screenX = this.x - cameraX;
        
        ctx.save();
        
        if (this.isInvincible && Math.floor(this.animationFrame / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        const gradient = ctx.createLinearGradient(screenX, this.y, screenX + this.width, this.y + this.height);
        gradient.addColorStop(0, this.skin.color);
        gradient.addColorStop(1, this.darkenColor(this.skin.color, 30));
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = this.skin.color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.roundRect(screenX, this.y, this.width, this.height, 6);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        this.drawFace(ctx, screenX);
        
        if (this.isInvincible) {
            this.drawShield(ctx, screenX);
        }
        
        if (this.isMagnetActive) {
            this.drawMagnetEffect(ctx, screenX);
        }
        
        ctx.restore();
    }
    
    drawFace(ctx, x) {
        ctx.fillStyle = '#FFFFFF';
        const eyeSize = 6;
        const eyeY = this.y + this.height / 3;
        const eyeOffset = this.width / 4;
        
        ctx.beginPath();
        ctx.arc(x + eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.arc(x + this.width - eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#2C3E50';
        const pupilOffset = Math.sin(this.animationFrame * 0.1) * 2;
        ctx.beginPath();
        ctx.arc(x + eyeOffset + pupilOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(x + this.width - eyeOffset + pupilOffset, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        
        const mouthY = this.y + this.height * 0.65;
        const mouthWidth = this.width * 0.3;
        const mouthHeight = 4;
        
        ctx.strokeStyle = '#2C3E50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + this.width / 2, mouthY, mouthWidth / 2, 0, Math.PI);
        ctx.stroke();
    }
    
    drawShield(ctx, x) {
        ctx.strokeStyle = '#00BFFF';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x + this.width / 2, this.y + this.height / 2, this.width * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.shadowBlur = 0;
    }
    
    drawMagnetEffect(ctx, x) {
        ctx.strokeStyle = '#FF1493';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5 + Math.sin(this.animationFrame * 0.2) * 0.3;
        
        for (let i = 0; i < 3; i++) {
            const angle = (this.animationFrame * 0.1 + i * Math.PI * 2 / 3);
            const radius = this.width * 0.6 + i * 10;
            ctx.beginPath();
            ctx.arc(x + this.width / 2, this.y + this.height / 2, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    darkenColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    setSkin(skin) {
        this.skin = skin;
    }
}

const SKINS = [
    { id: 'blue', name: '蓝色方块', color: '#3498db', pattern: 'solid', price: 0, unlocked: true },
    { id: 'red', name: '热情红', color: '#E74C3C', pattern: 'solid', price: 100, unlocked: false },
    { id: 'green', name: '森林绿', color: '#2ECC71', pattern: 'solid', price: 100, unlocked: false },
    { id: 'yellow', name: '阳光黄', color: '#F1C40F', pattern: 'solid', price: 150, unlocked: false },
    { id: 'purple', name: '神秘紫', color: '#9B59B6', pattern: 'solid', price: 200, unlocked: false },
    { id: 'orange', name: '活力橙', color: '#E67E22', pattern: 'solid', price: 150, unlocked: false },
    { id: 'pink', name: '甜蜜粉', color: '#FF6B9D', pattern: 'solid', price: 200, unlocked: false },
    { id: 'cyan', name: '清凉青', color: '#00CED1', pattern: 'solid', price: 250, unlocked: false },
    { id: 'rainbow', name: '彩虹', color: '#FF69B4', pattern: 'rainbow', price: 500, unlocked: false }
];

function loadSkinData() {
    const saved = localStorage.getItem('blockRunner_skins');
    if (saved) {
        const data = JSON.parse(saved);
        SKINS.forEach(skin => {
            const savedSkin = data.find(s => s.id === skin.id);
            if (savedSkin) {
                skin.unlocked = savedSkin.unlocked;
            }
        });
    }
}

function saveSkinData() {
    localStorage.setItem('blockRunner_skins', JSON.stringify(SKINS));
}

function unlockSkin(skinId) {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin && !skin.unlocked) {
        const coins = getCoins();
        if (coins >= skin.price) {
            setCoins(coins - skin.price);
            skin.unlocked = true;
            saveSkinData();
            return true;
        }
    }
    return false;
}

function getCoins() {
    return parseInt(localStorage.getItem('blockRunner_coins') || '0');
}

function setCoins(amount) {
    localStorage.setItem('blockRunner_coins', amount.toString());
}

function addCoins(amount) {
    setCoins(getCoins() + amount);
}