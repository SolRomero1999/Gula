class MokbanManager {
    constructor(scene) {
        this.scene = scene;
        this.stomachBar = null;
        this.foodItem = null;       
        this.sushiItem = null;      
        this.stomachCapacity = 100;
        this.displayStomach = 100;
        
        this.currentBowlLevel = 1;
        this.maxBowlLevel = 5;
        
        this.currentSushiLevel = 1;
        this.maxSushiLevel = 12;
        
        this.foodConsumptionRate = 10;  
        this.sushiConsumptionRate = 3;  
        this.stomachRecoveryRate = 3;
        this.audienceGainRange = { min: 50, max: 100 };
        this.hands = null;
        
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
        this.createSushi();
        this.createHands();
        this.setupRecoveryTimer();
        this.setupPenaltyChecks();
        this.updateStreamerAppearance();
    }
    
    createHands() {
        this.hands = this.scene.add.sprite(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 5,
            'ManosFull'
        ).setVisible(false)
         .setDepth(30);

        this.hands.setScale(0.6);
    }
    
    createStomachBar() {
        const barWidth = 30;
        const barHeight = this.scene.cameras.main.height * 0.88;
        const margin = 20;
        const startY = this.scene.cameras.main.height - margin - barHeight;
    
        this.scene.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(margin, startY, barWidth, barHeight)
            .setDepth(20);
    
        this.stomachBar = this.scene.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin,
                startY + barHeight * (1 - this.displayStomach / 100),
                barWidth,
                barHeight * (this.displayStomach / 100)
            ).setDepth(21);
    
        this.barHeight = barHeight;
        this.startY = startY;
        this.barWidth = barWidth;
        this.barMargin = margin;
    }
    
    createFood() {
        this.foodItem = this.scene.add.sprite(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY + 150,
            `ramen_bowl${this.currentBowlLevel}`
        ).setInteractive()
         .setScale(0.4)
         .setDepth(15);
        
        this.foodItem.setInteractive(
            new Phaser.Geom.Circle(
                this.foodItem.width/2, 
                this.foodItem.height/2, 
                this.foodItem.width * 0.6
            ), 
            Phaser.Geom.Circle.Contains
        );
        
        this.foodItem.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.handleFoodClick();
            }
        });
        
        // Se eliminó la animación flotante
    }
    
    createSushi() {
        this.sushiItem = this.scene.add.sprite(
            this.scene.cameras.main.centerX - 350,
            this.scene.cameras.main.centerY + 160,
            `sushi${this.currentSushiLevel}`
        ).setInteractive()
         .setScale(0.6)
         .setDepth(16);
        
        this.sushiItem.setInteractive(
            new Phaser.Geom.Circle(
                this.sushiItem.width/2, 
                this.sushiItem.height/2, 
                this.sushiItem.width * 0.6
            ), 
            Phaser.Geom.Circle.Contains
        );
        
        this.sushiItem.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.handleSushiClick();
            }
        });
        
        // Se eliminó la animación flotante
    }
    
    handleFoodClick() {
        if (this.currentBowlLevel >= this.maxBowlLevel) {
            this.showEmptyBowlMessage("¡El tazón de ramen está vacío!");
            return;
        }
        
        this.lastEatTime = this.scene.time.now;
        this.resetPenalty('inactivity');
        
        this.stomachCapacity = Phaser.Math.Clamp(
            this.stomachCapacity - this.foodConsumptionRate, 
            0, 
            100
        );
        
        this.currentBowlLevel++;
        this.foodItem.setTexture(`ramen_bowl${this.currentBowlLevel}`);
        
        this.gainAudience();
    }
    
    handleSushiClick() {
        if (this.currentSushiLevel >= this.maxSushiLevel) {
            this.showEmptyBowlMessage("¡No quedan más piezas de sushi!");
            return;
        }
        
        this.lastEatTime = this.scene.time.now;
        this.resetPenalty('inactivity');
        
        this.stomachCapacity = Phaser.Math.Clamp(
            this.stomachCapacity - this.sushiConsumptionRate,
            0,
            100
        );
        
        this.currentSushiLevel++;
        this.sushiItem.setTexture(`sushi${this.currentSushiLevel}`);
        
        this.gainAudience();
    }

    resetBowlLevel() {
        this.currentBowlLevel = 1;
        if (this.foodItem) {
            this.foodItem.setTexture('ramen_bowl1');
        }
    }
    
    resetSushiLevel() {
        this.currentSushiLevel = 1;
        if (this.sushiItem) {
            this.sushiItem.setTexture('sushi1');
        }
    }
    
    resetFoodLevels() {
        this.resetBowlLevel();
        this.resetSushiLevel();
    }
    
    gainAudience() {
        const audienceGain = Phaser.Math.RND.integerInRange(
            this.audienceGainRange.min, 
            this.audienceGainRange.max
        );
        
        const gameOver = this.scene.audienceManager.changeRating(audienceGain);
        if (gameOver) {
            this.scene.triggerGameOver('audience');
            return;
        }
        
        this.animateStomachBar();
        this.scene.events.emit('eat', audienceGain);
        
        if (this.stomachCapacity <= 0 && !this.scene.isGameOver) {
            this.scene.triggerGameOver('stomach');
        }
    }
    
    showEmptyBowlMessage(message) {
        this.scene.addDialogueBox(message, "Miao Mao", { 
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
                
                const timeSinceLastEat = (this.scene.time.now - this.lastEatTime) / 1000;
                this.penalties.inactivity.timer = timeSinceLastEat;
                
                if (timeSinceLastEat > this.penalties.inactivity.threshold) {
                    this.handlePenalty('inactivity');
                } else if (this.penalties.inactivity.active) {
                    this.resetPenalty('inactivity');
                }
                
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
    
    resetFoodLevels() {
        this.currentBowlLevel = 1;
        this.currentSushiLevel = 1;
        
        if (this.foodItem) {
            this.foodItem.setTexture('ramen_bowl1');
        }
        if (this.sushiItem) {
            this.sushiItem.setTexture('sushi1');
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
        
        let color = 0x00ff00;
        
        if (this.penalties.fullStomach.active) {
            color = this.penalties.fullStomach.color;
        } else if (this.penalties.inactivity.active) {
            color = this.penalties.inactivity.color;
        }
        
        this.stomachBar.fillStyle(color, 1)
            .fillRect(
                this.barMargin,
                this.startY + this.barHeight * (1 - this.displayStomach / 100),
                this.barWidth,
                this.barHeight * (this.displayStomach / 100)
            );
        
        this.updateStreamerAppearance();
    }
    
    updateStreamerAppearance() {
        if (!this.scene.streamer || !this.scene.OjosC1_02 || !this.scene.pupilasc1) return;
        
        if (this.scene.cuteActionManager?.isActionActive) return;

        if (this.displayStomach <= 10) {
            this.hands.setVisible(true);
            this.setStreamerAppearance('streamerG2', 'caragordo', 'full'); 
        } else {
            this.hands.setVisible(false);
            if (this.displayStomach <= 50) {
                this.setStreamerAppearance('streamerG', 'OjosC1_03', 'pupilasc1');
            } else {
                this.setStreamerAppearance('streamer', 'OjosC1_02', 'pupilasc1');
            }
        }
    }

    setStreamerAppearance(bodyTexture, eyesTexture, pupilsTexture) {
        this.scene.streamer.setTexture(bodyTexture);
        this.scene.OjosC1_02.setTexture(eyesTexture);
        this.scene.OjosC1_02.setVisible(true);
        this.scene.pupilasc1.setTexture(pupilsTexture);
        this.scene.pupilasc1.setVisible(true);
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
        if (this.sushiItem) this.sushiItem.destroy();
        if (this.hands) this.hands.destroy();
    }
}