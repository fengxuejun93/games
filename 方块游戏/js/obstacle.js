class Obstacle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        
        this.animationFrame = 0;
        
        switch (type) {
            case 'spike':
                this.width = 30;
                this.height = 30;
                break;
            case 'block':
                this.width = 40;
                this.height = 50;
                break;
            case 'pit':
                this.width = 100;
                this.height = 60;
                break;
        }
    }
    
    update(gameSpeed) {
        this.x -= gameSpeed;
        this.animationFrame++;
    }
    
    render(ctx, cameraX) {
        const screenX = this.x - cameraX;
        
        switch (this.type) {
            case 'spike':
                this.renderSpike(ctx, screenX);
                break;
            case 'block':
                this.renderBlock(ctx, screenX);
                break;
            case 'pit':
                this.renderPit(ctx, screenX);
                break;
        }
    }
    
    renderSpike(ctx, x) {
        ctx.fillStyle = '#7F8C8D';
        ctx.beginPath();
        ctx.moveTo(x + this.width / 2, this.y);
        ctx.lineTo(x + this.width, this.y + this.height);
        ctx.lineTo(x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#95A5A6';
        ctx.beginPath();
        ctx.moveTo(x + this.width / 2, this.y + 5);
        ctx.lineTo(x + this.width - 5, this.y + this.height);
        ctx.lineTo(x + 5, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }
    
    renderBlock(ctx, x) {
        const gradient = ctx.createLinearGradient(x, this.y, x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#9B59B6');
        gradient.addColorStop(1, '#8E44AD');
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#9B59B6';
        ctx.shadowBlur = 5;
        
        ctx.beginPath();
        ctx.roundRect(x, this.y, this.width, this.height, 5);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.roundRect(x + 5, this.y + 5, this.width - 10, this.height / 3, 3);
        ctx.fill();
    }
    
    renderPit(ctx, x) {
        ctx.fillStyle = '#2C3E50';
        ctx.beginPath();
        ctx.roundRect(x, this.y, this.width, this.height, 10);
        ctx.fill();
        
        const gradient = ctx.createLinearGradient(x, this.y, x, this.y + this.height);
        gradient.addColorStop(0, 'rgba(44, 62, 80, 0.8)');
        gradient.addColorStop(1, 'rgba(26, 35, 46, 0.9)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 5, this.y + 5, this.width - 10, this.height - 10, 8);
        ctx.fill();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠', x + this.width / 2, this.y + this.height / 2 + 4);
    }
}