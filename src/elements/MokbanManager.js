class MokbanManager {
    constructor(scene) {
        this.scene = scene;
        this.stomachBar = null;
        this.foodItem = null;
        this.stomachCapacity = 100;
        this.displayStomach = 100;
        this.currentBowlLevel = 1;
        this.maxBowlLevel = 5;
        
        this.foodConsumptionRate = 10;
        this.stomachRecoveryRate = 3;
        this.audienceGainRange = { min: 50, max: 100 };
        
        this.penalties = {
            inactivity: {
                threshold: 3,
                baseLoss: 5,
                maxLoss: 25,
                incrementRate: 0.5,
                currentLoss: 0,
                timer: 0,
                active: false,
                color: 0xffff00
            },
            fullStomach: {
                threshold: 3,
                baseLoss: 5,
                maxLoss: 40,
                incrementRate: 1,
                currentLoss: 0,
                timer: 0,
                active: false,
                color: 0xff0000
            }
        };
        
        this.lastEatTime = 0;
        this.init();
    }

    init() {
        this.createStomachBar();
        this.createFood();
        this.setupRecoveryTimer();
        this.setupPenaltyChecks();
    }
    
    createStomachBar() {
        const barWidth = 30;
        const barHeight = this.scene.cameras.main.height * 0.88; 
        const margin = 20;
        const startY = this.scene.cameras.main.height - margin - barHeight;
    
        // Fondo de la barra
        this.scene.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(margin, startY, barWidth, barHeight)
            .setDepth(20);
    
        // Barra de estómago (verde por defecto)
        this.stomachBar = this.scene.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin,
                startY + barHeight * (1 - this.displayStomach / 100),
                barWidth,
                barHeight * (this.displayStomach / 100)
            ).setDepth(21);
    
        // Guardar dimensiones para actualizaciones
        this.barHeight = barHeight;
        this.startY = startY;
        this.barWidth = barWidth;
        this.barMargin = margin;
    }
    
    createFood() {
        this.foodItem = this.scene.add.sprite(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 60,
            `ramen_bowl${this.currentBowlLevel}`
        ).setInteractive()
         .setScale(0.4)
         .setDepth(15);
        
        // Área interactiva circular
        this.foodItem.setInteractive(
            new Phaser.Geom.Circle(
                this.foodItem.width/2, 
                this.foodItem.height/2, 
                this.foodItem.width * 0.6
            ), 
            Phaser.Geom.Circle.Contains
        );
        
        // Evento al hacer click
        this.foodItem.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.handleFoodClick();
            }
        });
        
        // Animación flotante suave
        this.scene.tweens.add({
            targets: this.foodItem,
            y: this.foodItem.y - 3,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    handleFoodClick() {
        // Bloquear si ya alcanzamos el nivel máximo
        if (this.currentBowlLevel >= this.maxBowlLevel) {
            this.showEmptyBowlMessage();
            return;
        }
        
        this.lastEatTime = this.scene.time.now;
        this.resetPenalty('inactivity');
        
        // Reducir capacidad del estómago
        this.stomachCapacity = Phaser.Math.Clamp(
            this.stomachCapacity - this.foodConsumptionRate, 
            0, 
            100
        );
        
        // Avanzar al siguiente nivel del tazón
        this.currentBowlLevel++;
        this.foodItem.setTexture(`ramen_bowl${this.currentBowlLevel}`);
        
        // Ganancia de audiencia aleatoria
        const audienceGain = Phaser.Math.RND.integerInRange(
            this.audienceGainRange.min, 
            this.audienceGainRange.max
        );
        
        const gameOver = this.scene.audienceManager.changeRating(audienceGain);
        if (gameOver) {
            this.scene.triggerGameOver('audience');
            return;
        }
        
        // Efecto visual de comer (sin cambio de escala)
        this.scene.tweens.add({
            targets: this.foodItem,
            alpha: 0.8,
            duration: 100,
            yoyo: true
        });
        
        this.animateStomachBar();
        this.scene.events.emit('eat', audienceGain);
        
        if (this.stomachCapacity <= 0 && !this.scene.isGameOver) {
            this.scene.triggerGameOver('stomach');
        }
    }
    
    showEmptyBowlMessage() {
        this.scene.addDialogueBox("Oh, it's empty.", "Miao Mao", { 
            textColor: '#ffffff',
            boxColor: 0x000000,
            borderColor: 0xffffff,
            borderThickness: 2
        });
    }
    
    setupRecoveryTimer() {
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
            loop: true
        });
    }
    
    setupPenaltyChecks() {
        this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
                if (this.scene.isGameOver) return;
                
                // Penalización por inactividad
                const timeSinceLastEat = (this.scene.time.now - this.lastEatTime) / 1000;
                this.penalties.inactivity.timer = timeSinceLastEat;
                
                if (timeSinceLastEat > this.penalties.inactivity.threshold) {
                    this.handlePenalty('inactivity');
                } else if (this.penalties.inactivity.active) {
                    this.resetPenalty('inactivity');
                }
                
                // Penalización por estómago lleno
                if (this.stomachCapacity >= 100) {
                    this.penalties.fullStomach.timer++;
                    if (this.penalties.fullStomach.timer > this.penalties.fullStomach.threshold) {
                        this.handlePenalty('fullStomach');
                    }
                } else if (this.penalties.fullStomach.active) {
                    this.resetPenalty('fullStomach');
                }
            },
            loop: true
        });
    }
    
    handlePenalty(type) {
        const penalty = this.penalties[type];
        
        if (!penalty.active) {
            penalty.active = true;
            penalty.currentLoss = penalty.baseLoss;
            this.scene.events.emit(`${type}Warning`);
        } else {
            penalty.currentLoss = Phaser.Math.Clamp(
                penalty.currentLoss + penalty.incrementRate,
                penalty.baseLoss,
                penalty.maxLoss
            );
        }
        
        const audienceLoss = -Math.round(penalty.currentLoss);
        const gameOver = this.scene.audienceManager.changeRating(audienceLoss);
        
        this.scene.events.emit(`${type}Penalty`, {
            loss: audienceLoss,
            time: penalty.timer,
            currentPenalty: penalty.currentLoss
        });
        
        this.updateStomachBarColor();
        
        if (gameOver) {
            this.scene.triggerGameOver('audience');
        }
    }
    
    resetPenalty(type) {
        const penalty = this.penalties[type];
        penalty.active = false;
        penalty.currentLoss = 0;
        penalty.timer = 0;
        
        if (!this.penalties.inactivity.active && !this.penalties.fullStomach.active) {
            this.updateStomachBarColor(0x00ff00);
        }
    }
    
    resetBowlLevel() {
        this.currentBowlLevel = 1;
        if (this.foodItem) {
            this.foodItem.setTexture('ramen_bowl1');
        }
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
        this.stomachBar.clear();
        
        let color = 0x00ff00; // Verde por defecto
        
        // Cambiar color según penalización activa
        if (this.penalties.fullStomach.active) {
            color = this.penalties.fullStomach.color; // Rojo
        } else if (this.penalties.inactivity.active) {
            color = this.penalties.inactivity.color; // Amarillo
        }
        
        this.stomachBar.fillStyle(color, 1)
            .fillRect(
                this.barMargin,
                this.startY + this.barHeight * (1 - this.displayStomach / 100),
                this.barWidth,
                this.barHeight * (this.displayStomach / 100)
            );
    }
    
    updateStomachBarColor(color) {
        this.stomachBar.clear();
        const currentColor = color || 
                           (this.penalties.fullStomach.active ? this.penalties.fullStomach.color : 
                            (this.penalties.inactivity.active ? this.penalties.inactivity.color : 0x00ff00));
        
        this.stomachBar.fillStyle(currentColor, 1)
            .fillRect(
                this.barMargin,
                this.startY + this.barHeight * (1 - this.displayStomach / 100),
                this.barWidth,
                this.barHeight * (this.displayStomach / 100)
            );
    }
    
    cleanup() {
        if (this.stomachBar) this.stomachBar.destroy();
        if (this.foodItem) this.foodItem.destroy();
    }
}