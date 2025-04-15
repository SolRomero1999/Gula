class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('background', '../assets/background.jpg');
        this.load.image('ramen_bowl1', '../assets/ramen_bowl1.png');
        this.load.image('desk', '../assets/desk.png'); 
        this.load.image('streamer', '../assets/streamer.png');
    }

    init() {
        this.isGameOver = false;
        this.audienceTimer = null;
        this.cuteCooldown = false;
        this.cuteCooldownTimer = null;
        this.cuteOveruseCounter = 0;
        this.currentDialogueBox = null;
    }

    create() {
        this.cleanup();
        
        // 0: Fondo
        this.background = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'background'
        ).setOrigin(0.5, 0.5)
         .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
         .setDepth(0);
        
        // 5: Gato
        this.cat = this.add.image(
            this.cameras.main.centerX + 90,
            this.cameras.main.centerY + 40,
            'streamer'
        ).setOrigin(0.5, 0.5)
         .setScale(0.7)
         .setDepth(5);
        
        // 8: Sombra mesa
        this.deskShadow = this.add.graphics()
            .fillStyle(0x000000, 0.3)
            .fillEllipse(
                this.cameras.main.centerX,
                this.cameras.main.centerY + 140,
                450,
                20
            ).setDepth(8);
        
        // 10: Mesa
        this.desk = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            'desk'
        ).setOrigin(0.5, 0.5)
         .setScale(0.8)
         .setDepth(10);
        
        // 15: Tazón (manejado por MokbanManager)
        this.mokbanManager = new MokbanManager(this);
        
        // 20: Barra hambre (manejado por MokbanManager)
        
        // 50: Chat
        this.chatSystem = new SimpleChatSystem(this);
        
        // 60: Botón acto tierno
        this.createCuteButton();
        
        // Sistemas adicionales
        this.setupAudienceTimer();
        this.audienceManager = new AudienceManager(this);
        
        // Animación gato
        this.tweens.add({
            targets: this.cat,
            y: this.cat.y + 3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    cleanup() {
        if (this.audienceTimer) this.audienceTimer.destroy();
        if (this.cuteButton) this.cuteButton.destroy();
        if (this.cuteCooldownTimer) this.cuteCooldownTimer.destroy();
        if (this.audienceManager) this.audienceManager.cleanup();
        if (this.mokbanManager) this.mokbanManager.cleanup();
        if (this.currentDialogueBox) this.currentDialogueBox.destroy();
        if (this.desk) this.desk.destroy();
        if (this.cat) this.cat.destroy();
        if (this.deskShadow) this.deskShadow.destroy();
        
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.children.removeAll();
    }

    createCuteButton() {
        this.cuteButton = this.add.rectangle(
            this.cameras.main.centerX,  // Centrado en X
            this.cameras.main.height - 60,  // Misma posición en Y
            200,
            50,
            0xff69b4 
        )
        .setInteractive()
        .setDepth(60);
        const buttonText = this.add.text(
            this.cameras.main.centerX,  // Centrado en X
            this.cameras.main.height - 60,
            'Acto Tierno',
            {
                font: '20px Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5)
         .setDepth(61);
        
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
            return;
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

    setupAudienceTimer() {
        this.audienceTimer = this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (!this.isGameOver) {
                    const lostAudience = Math.max(1, Math.floor(this.audienceManager.rating * 0.05));
                    const gameOver = this.audienceManager.changeRating(-lostAudience);
                    if (gameOver) this.triggerGameOver('audience');
                }
            },
            loop: true
        });
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
        if (this.currentDialogueBox) {
            this.currentDialogueBox.destroy();
        }
        
        const style = {
            boxColor: 0x000000,
            borderColor: 0xFFFFFF,
            textColor: '#FFFFFF',
            borderThickness: 2,
            padding: 15,
            maxWidth: 300,
            boxYPosition: 150,
            ...styleOptions
        };
        
        const dialogueText = this.add.text(
            this.cameras.main.centerX,
            style.boxYPosition,
            text,
            {
                font: '20px Arial',
                fill: style.textColor,
                wordWrap: { width: style.maxWidth - 2 * style.padding }
            }
        ).setOrigin(0.5, 0);
        
        const textBounds = dialogueText.getBounds();
        const boxWidth = textBounds.width + 2 * style.padding;
        const boxHeight = textBounds.height + 2 * style.padding;
        
        const dialogueBox = this.add.graphics()
            .fillStyle(style.boxColor, 0.8)
            .fillRoundedRect(
                this.cameras.main.centerX - boxWidth/2,
                style.boxYPosition - style.padding,
                boxWidth,
                boxHeight,
                10
            )
            .lineStyle(style.borderThickness, style.borderColor)
            .strokeRoundedRect(
                this.cameras.main.centerX - boxWidth/2,
                style.boxYPosition - style.padding,
                boxWidth,
                boxHeight,
                10
            );
        
        const nameText = this.add.text(
            this.cameras.main.centerX,
            style.boxYPosition - style.padding - 20,
            character,
            {
                font: '16px Arial',
                fill: style.textColor,
                backgroundColor: style.boxColor,
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5, 0.5);
        
        this.currentDialogueBox = this.add.container()
            .add([dialogueBox, dialogueText, nameText])
            .setDepth(100);
        
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: this.currentDialogueBox,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                    this.currentDialogueBox.destroy();
                    this.currentDialogueBox = null;
                }
            });
        });
    }

    shutdown() {
        this.cleanup();
    }
}