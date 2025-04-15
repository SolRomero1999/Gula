class MokbanManager {
    constructor(scene) {
        this.scene = scene;
        this.stomachBar = null;
        this.foodItem = null;
        this.stomachCapacity = 100;
        this.displayStomach = 100;
        
        // Configuración
        this.foodConsumptionRate = 10; // Cuánto reduce el estómago al comer
        this.stomachRecoveryRate = 3; // Cuánto se recupera por segundo
        this.audienceGainRange = { min: 50, max: 100 }; // Rango de ganancia de audiencia
        
        this.init();
    }
    
    init() {
        this.createStomachBar();
        this.createFood();
        this.setupRecoveryTimer();
    }
    
    createStomachBar() {
        const barWidth = 30;
        const barHeight = 400;
        const margin = 50;
        const startY = this.scene.cameras.main.height - margin - barHeight;
 
        // Fondo de la barra
        this.scene.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(margin, startY, barWidth, barHeight);
        
        // Barra de hambre (verde)
        this.stomachBar = this.scene.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin, 
                startY + barHeight * (1 - this.displayStomach / 100), 
                barWidth, 
                barHeight * (this.displayStomach / 100)
            );
    }
    
    createFood() {
        this.foodItem = this.scene.add.circle(
            this.scene.cameras.main.centerX, 
            this.scene.cameras.main.centerY, 
            50, 
            0xff0000
        ).setInteractive();
        
        this.foodItem.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.handleFoodClick();
            }
        });
    }
    
    handleFoodClick() {
        // Reducir capacidad del estómago
        this.stomachCapacity = Phaser.Math.Clamp(
            this.stomachCapacity - this.foodConsumptionRate, 
            0, 
            100
        );
        
        // Ganar audiencia
        const audienceGain = Phaser.Math.RND.integerInRange(
            this.audienceGainRange.min, 
            this.audienceGainRange.max
        );
        
        // Notificar al juego sobre el cambio de audiencia
        const gameOver = this.scene.audienceManager.changeRating(audienceGain);
        if (gameOver) {
            this.scene.triggerGameOver('audience');
            return;
        }
        
        // Animación de la comida
        this.scene.tweens.add({
            targets: this.foodItem,
            scale: 0.8,
            duration: 100,
            yoyo: true
        });
        
        // Actualizar barra de hambre
        this.animateStomachBar();
        
        // Emitir evento de comer
        this.scene.events.emit('eat');
        
        // Verificar si el estómago está vacío
        if (this.stomachCapacity <= 0 && !this.scene.isGameOver) {
            this.scene.triggerGameOver('stomach');
        }
    }
    
    setupRecoveryTimer() {
        // Timer para recuperación gradual del estómago
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.scene.isGameOver && this.stomachCapacity < 100) {
                    this.stomachCapacity = Phaser.Math.Clamp(
                        this.stomachCapacity + this.stomachRecoveryRate, 
                        0, 
                        100
                    );
                    this.animateStomachBar();
                }
            },
            callbackScope: this,
            loop: true
        });
    }
    
    animateStomachBar() {
        this.scene.tweens.add({
            targets: this,
            displayStomach: this.stomachCapacity,
            duration: 300,
            ease: 'Power1',
            onUpdate: () => {
                this.updateStomachBar();
            }
        });
    }
    
    updateStomachBar() {
        const barWidth = 30;
        const barHeight = 400;
        const margin = 50;
        const startY = this.scene.cameras.main.height - margin - barHeight;
        
        this.stomachBar.clear()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin, 
                startY + barHeight * (1 - this.displayStomach / 100), 
                barWidth, 
                barHeight * (this.displayStomach / 100)
            );
    }
    
    cleanup() {
        if (this.stomachBar) this.stomachBar.destroy();
        if (this.foodItem) this.foodItem.destroy();
    }
}