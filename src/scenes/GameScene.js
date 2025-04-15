class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        this.stomachBar = null;
        this.foodItem = null;
        this.cuteButton = null;
        this.stomachCapacity = 100;
        this.displayStomach = 100;
        this.isGameOver = false;
        this.audienceTimer = null;
        this.stomachRecoveryTimer = null;
        this.cuteCooldown = false;
        this.cuteCooldownTimer = null;
        this.cuteOveruseCounter = 0;
        this.currentDialogueBox = null;
    }

    create() {
        this.cleanup();
        this.createStomachBar();
        this.createFood();
        this.createCuteButton();
        this.setupTimers();
        this.chatSystem = new SimpleChatSystem(this);
        
        // Inicializar AudienceManager
        this.audienceManager = new AudienceManager(this);
    }

    cleanup() {
        if (this.audienceTimer) this.audienceTimer.destroy();
        if (this.stomachRecoveryTimer) this.stomachRecoveryTimer.destroy();
        if (this.foodItem) this.foodItem.destroy();
        if (this.stomachBar) this.stomachBar.destroy();
        if (this.cuteButton) this.cuteButton.destroy();
        if (this.cuteCooldownTimer) this.cuteCooldownTimer.destroy();
        if (this.audienceManager) this.audienceManager.cleanup();
        if (this.currentDialogueBox) this.currentDialogueBox.destroy();
        
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
        
        const gameOver = this.audienceManager.changeRating(audienceGain);
        if (gameOver) {
            this.triggerGameOver('audience');
        }

        this.tweens.add({
            targets: this.foodItem,
            scale: 0.8,
            duration: 100,
            yoyo: true
        });

        this.animateStomachBar();
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
        
        const gameOver = this.audienceManager.changeRating(
            result.isOverusing ? -result.audienceChange : result.audienceChange
        );
        
        if (gameOver) {
            this.triggerGameOver('audience');
        }
        
        if (result.isOverusing) {
            this.cameras.main.shake(200, 0.01);
            this.tweens.add({
                targets: this.cuteButton,
                tint: 0xff0000,
                duration: 300,
                yoyo: true
            });
        } else {
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
        // Timer para pérdida gradual de audiencia
        this.audienceTimer = this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (!this.isGameOver) {
                    const lostAudience = Math.max(1, Math.floor(this.audienceManager.rating * 0.05));
                    const gameOver = this.audienceManager.changeRating(-lostAudience);
                    
                    if (gameOver) {
                        this.triggerGameOver('audience');
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Timer para recuperación gradual del estómago
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

    triggerGameOver(loseType) {
        this.isGameOver = true;
        this.cleanup();
        
        this.scene.start('GameOverScene', { 
            loseType: loseType,
            audienceRating: this.audienceManager.rating,
            audienceGoal: this.audienceManager.goal
        });
    }
    
    addDialogueBox(text, character, styleOptions = {}) {
        // Configuración por defecto
        const defaultStyle = {
            boxColor: 0x000000,
            borderColor: 0xFFFFFF,
            textColor: '#FFFFFF',
            borderThickness: 2,
            padding: 15,
            maxWidth: 300,
            boxYPosition: 150
        };
        
        // Combinar con opciones personalizadas
        const style = { ...defaultStyle, ...styleOptions };
        
        // Destruir el diálogo anterior si existe
        if (this.currentDialogueBox) {
            this.currentDialogueBox.destroy();
        }
        
        // Crear el fondo del diálogo
        const dialogueBox = this.add.graphics();
        
        // Estilo del texto
        const textStyle = {
            font: '20px Arial',
            fill: style.textColor,
            wordWrap: { width: style.maxWidth - 2 * style.padding }
        };
        
        // Crear el texto del diálogo
        const dialogueText = this.add.text(
            this.cameras.main.centerX,
            style.boxYPosition,
            text,
            textStyle
        ).setOrigin(0.5, 0);
        
        // Calcular dimensiones del cuadro
        const textBounds = dialogueText.getBounds();
        const boxWidth = textBounds.width + 2 * style.padding;
        const boxHeight = textBounds.height + 2 * style.padding;
        
        // Dibujar el cuadro de diálogo
        dialogueBox.fillStyle(style.boxColor, 0.8);
        dialogueBox.fillRoundedRect(
            this.cameras.main.centerX - boxWidth/2,
            style.boxYPosition - style.padding,
            boxWidth,
            boxHeight,
            10
        );
        
        dialogueBox.lineStyle(style.borderThickness, style.borderColor);
        dialogueBox.strokeRoundedRect(
            this.cameras.main.centerX - boxWidth/2,
            style.boxYPosition - style.padding,
            boxWidth,
            boxHeight,
            10
        );
        
        // Nombre del personaje (centrado sobre el cuadro)
        const nameText = this.add.text(
            this.cameras.main.centerX,
            style.boxYPosition - style.padding - 20,
            character,
            {
                font: '16px Arial',
                fill: style.textColor,
                backgroundColor: style.boxColor,
                padding: { x: 10, y: 5 },
                align: 'center'
            }
        ).setOrigin(0.5, 0.5);
        
        // Grupo para manejar todos los elementos
        this.currentDialogueBox = this.add.container();
        this.currentDialogueBox.add([dialogueBox, dialogueText, nameText]);
        this.currentDialogueBox.setDepth(15);
        
        // Desvanecer después de un tiempo
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: this.currentDialogueBox,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    if (this.currentDialogueBox) {
                        this.currentDialogueBox.destroy();
                        this.currentDialogueBox = null;
                    }
                }
            });
        });
    }

    shutdown() {
        this.cleanup();
    }
}