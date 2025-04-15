class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.stomachBar = null;
        this.viewersText = null;
        this.goalText = null;
        this.foodItem = null;
        this.cuteButton = null;
        this.stomachCapacity = 100;
        this.displayStomach = 100;
        this.audienceRating = 100;
        this.displayAudience = 100;
        this.isGameOver = false;
        this.audienceTimer = null;
        this.stomachRecoveryTimer = null;
        this.timeElapsed = 0;
        this.audienceGoal = 1000;
        this.animatingNumbers = false;
        this.cuteCooldown = false;
        this.cuteCooldownTimer = null;
        this.cuteOveruseCounter = 0;
    }

    create() {
        this.cleanup();
        this.createStomachBar();
        this.createViewersCounter();
        this.createGoalDisplay();
        this.createFood();
        this.createCuteButton();
        this.setupTimers();
        this.chatSystem = new SimpleChatSystem(this);
    }

    cleanup() {
        if (this.audienceTimer) this.audienceTimer.destroy();
        if (this.stomachRecoveryTimer) this.stomachRecoveryTimer.destroy();
        if (this.foodItem) this.foodItem.destroy();
        if (this.stomachBar) this.stomachBar.destroy();
        if (this.viewersText) this.viewersText.destroy();
        if (this.goalText) this.goalText.destroy();
        if (this.cuteButton) this.cuteButton.destroy();
        if (this.cuteCooldownTimer) this.cuteCooldownTimer.destroy();
        
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.children.removeAll();
    }

    createStomachBar() {
        const barWidth = 30;
        const barHeight = 400;
        const margin = 50;
        const startY = this.cameras.main.height - margin - barHeight;
 
        this.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(margin, startY, barWidth, barHeight);
        
        this.stomachBar = this.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin, 
                startY + barHeight * (1 - this.displayStomach / 100), 
                barWidth, 
                barHeight * (this.displayStomach / 100)
            );
    }

    createViewersCounter() {
        this.viewersText = this.add.text(
            this.cameras.main.width - 20,
            20,
            `${this.audienceRating} viewers`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 5 }
            }
        )
        .setOrigin(1, 0)
        .setDepth(10);
    }

    createGoalDisplay() {
        this.goalText = this.add.text(
            this.cameras.main.centerX,
            20,
            `Meta: ${this.audienceRating}/${this.audienceGoal}`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#9147ff',
                padding: { x: 15, y: 5 }
            }
        )
        .setOrigin(0.5, 0)
        .setDepth(10);
    }

    createFood() {
        this.foodItem = this.add.circle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            50, 
            0xff0000
        ).setInteractive();
        
        this.foodItem.on('pointerdown', () => {
            if (!this.isGameOver) {
                this.handleFoodClick();
            }
        });
    }

    createCuteButton() {
        this.cuteButton = this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.height - 60,
            200,
            50,
            0xff69b4 
        )
        .setInteractive()
        .setDepth(5);
        
        const buttonText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 60,
            'Acto Tierno',
            {
                font: '20px Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        )
        .setOrigin(0.5)
        .setDepth(6);
        
        this.cuteButton.on('pointerover', () => {
            if (!this.cuteCooldown && !this.isGameOver) {
                this.cuteButton.setFillStyle(0xff1493); 
            }
        });
        
        this.cuteButton.on('pointerout', () => {
            if (!this.cuteCooldown && !this.isGameOver) {
                this.cuteButton.setFillStyle(0xff69b4); 
            }
        });
        
        this.cuteButton.on('pointerdown', () => {
            if (!this.cuteCooldown && !this.isGameOver) {
                this.handleCuteAction();
            }
        });
    }

    handleFoodClick() {
        this.stomachCapacity = Phaser.Math.Clamp(this.stomachCapacity - 10, 0, 100);
        const audienceGain = Math.floor(50 + Math.random() * 50);
        this.audienceRating += audienceGain;

        this.tweens.add({
            targets: this.foodItem,
            scale: 0.8,
            duration: 100,
            yoyo: true
        });

        this.animateStomachBar();
        this.animateAudienceChange(audienceGain);
        this.events.emit('eat');
    }

    handleCuteAction() {
        this.cuteCooldown = true;
        this.cuteButton.setFillStyle(0x888888); 
        this.cuteCooldownTimer = this.time.delayedCall(5000, () => {
            this.cuteCooldown = false;
            this.cuteButton.setFillStyle(0xff69b4); 
            this.cuteCooldownTimer = null;
        });
        
        const result = CuteActionManager.executeCuteAction(this);
        
        if (result.isOverusing) {
            this.animateAudienceChange(-result.audienceChange);
            this.cameras.main.shake(200, 0.01);
            this.tweens.add({
                targets: this.cuteButton,
                tint: 0xff0000,
                duration: 300,
                yoyo: true
            });
        } else {
            this.animateAudienceChange(result.audienceChange);
            this.cameras.main.flash(200, 255, 192, 203);
            this.tweens.add({
                targets: this.cuteButton,
                tint: 0xffffff,
                duration: 300,
                yoyo: true
            });
        }
        
        this.tweens.add({
            targets: this.cuteButton,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true
        });
    }

    setupTimers() {
        this.audienceTimer = this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (!this.isGameOver) {
                    const lostAudience = Math.max(1, Math.floor(this.audienceRating * 0.05));
                    this.audienceRating = Math.max(0, this.audienceRating - lostAudience);
                    this.animateAudienceChange(-lostAudience);
                }
            },
            callbackScope: this,
            loop: true
        });
        
        this.stomachRecoveryTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.isGameOver && this.stomachCapacity < 100) {
                    this.stomachCapacity = Phaser.Math.Clamp(this.stomachCapacity + 3, 0, 100);
                    this.animateStomachBar();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    animateStomachBar() {
        this.tweens.add({
            targets: this,
            displayStomach: this.stomachCapacity,
            duration: 300,
            ease: 'Power1',
            onUpdate: () => {
                this.updateStomachBar();
            }
        });
    }

    animateAudienceChange(change) {
        if (this.animatingNumbers) return;
        this.animatingNumbers = true;
        
        const startValue = this.displayAudience;
        const endValue = this.audienceRating;
        const duration = Math.min(800, Math.abs(change) * 15); 
        
        this.tweens.add({
            targets: this,
            displayAudience: endValue,
            duration: duration,
            ease: 'Power1',
            onUpdate: () => {
                this.viewersText.setText(`${Math.floor(this.displayAudience)} viewers`);
                
                if (this.displayAudience < startValue) {
                    this.viewersText.setColor('#ff5555'); 
                } else {
                    this.viewersText.setColor('#55ff55'); 
                }
                
                this.updateGoalDisplay();
                
                if (this.displayAudience >= this.audienceGoal) {
                    this.updateAudienceGoal();
                }
            },
            onComplete: () => {
                this.viewersText.setColor('#ffffff'); 
                this.animatingNumbers = false;

                if (this.audienceRating <= 0) {
                    this.triggerGameOver('audience');
                }
            }
        });
    }

    updateStomachBar() {
        const barWidth = 30;
        const barHeight = 400;
        const margin = 50;
        const startY = this.cameras.main.height - margin - barHeight;
        
        this.stomachBar.clear()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin, 
                startY + barHeight * (1 - this.displayStomach / 100), 
                barWidth, 
                barHeight * (this.displayStomach / 100)
            );

        if (this.stomachCapacity <= 0 && !this.isGameOver) {
            this.triggerGameOver('stomach');
        }
    }

    updateGoalDisplay() {
        this.goalText.setText(`Meta: ${Math.floor(this.displayAudience)}/${this.audienceGoal}`);
    }

    updateAudienceGoal() {
        const goals = [1000, 2500, 5000, 10000];
        for (let goal of goals) {
            if (this.audienceRating < goal) {
                this.audienceGoal = goal;
                break;
            }
        }
        
        this.showGoalReachedEffect();
    }

    showGoalReachedEffect() {
        this.cameras.main.flash(300, 145, 71, 255);

        const congratsText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            `¡Meta alcanzada!\nNueva meta: ${this.audienceGoal}`,
            {
                font: '32px Arial',
                fill: '#ffffff',
                backgroundColor: '#9147ff',
                align: 'center',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setDepth(20);
        
        this.tweens.add({
            targets: congratsText,
            alpha: 0,
            duration: 1000,
            delay: 1000,
            onComplete: () => congratsText.destroy()
        });
    }

    triggerGameOver(loseType) {
        this.isGameOver = true;
        this.cleanup();
        
        this.scene.start('GameOverScene', { 
            loseType: loseType,
            audienceRating: this.audienceRating,
            audienceGoal: this.audienceGoal
        });
    }

    shutdown() {
        this.cleanup();
    }
}