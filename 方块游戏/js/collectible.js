class Collectible {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.width = 25;
        this.height = 25;
        
        this.animationFrame = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    
    update(gameSpeed) {
        this.x -= gameSpeed;
        this.animationFrame++;
    }
    
    render(ctx, cameraX) {
        const screenX = this.x - cameraX;
        const bobY = this.y + Math.sin(this.animationFrame * 0.1 + this.bobOffset) * 5;
        
        ctx.save();
        
        switch (this.type) {
            case 'coin':
                this.renderCoin(ctx, screenX, bobY);
                break;
            case 'speed':
                this.renderSpeed(ctx, screenX, bobY);
                break;
            case 'shield':
                this.renderShield(ctx, screenX, bobY);
                break;
            case 'magnet':
                this.renderMagnet(ctx, screenX, bobY);
                break;
        }
        
        ctx.restore();
    }
    
    renderCoin(ctx, x, y) {
        const rotation = this.animationFrame * 0.1;
        
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.rotate(rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FF8C00';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
    }
    
    renderSpeed(ctx, x, y) {
        const pulseScale = 1 + Math.sin(this.animationFrame * 0.2) * 0.1;
        
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.scale(pulseScale, pulseScale);
        
        const gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        gradient.addColorStop(0, '#00FF00');
        gradient.addColorStop(1, '#00CC00');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(-this.width / 2, 0);
        ctx.lineTo(0, -this.height / 2);
        ctx.lineTo(this.width / 2, 0);
        ctx.lineTo(0, this.height / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', 0, 0);
        
        ctx.restore();
    }
    
    renderShield(ctx, x, y) {
        const rotation = this.animationFrame * 0.05;
        
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.rotate(rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#00BFFF');
        gradient.addColorStop(1, '#1E90FF');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00BFFF';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛡', 0, 0);
        
        ctx.restore();
    }
    
    renderMagnet(ctx, x, y) {
        const pulseScale = 1 + Math.sin(this.animationFrame * 0.15) * 0.15;
        
        ctx.save();
        ctx.translate(x + this.width / 2, y + this.height / 2);
        ctx.scale(pulseScale, pulseScale);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width / 2);
        gradient.addColorStop(0, '#FF1493');
        gradient.addColorStop(1, '#FF69B4');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#FF1493';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🧲', 0, 0);
        
        ctx.restore();
    }
}