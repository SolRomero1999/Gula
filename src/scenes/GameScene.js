class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.gameDurationMinutes = 5;
    }

    preload() {

    }
    
    init() {
        this.isGameOver = false;
        this.currentDialogueBox = null;
    }

    create() {
        this.sound.stopAll();
        this.music = this.sound.add('game', { loop: true });
        this.music.play();
        this.cleanup();
        this.gameTimer = new GameTimer(this, this.gameDurationMinutes);
        this.gameTimer.start();

        this.moneyManager = new MoneyManager(this);
        this.audienceManager = new AudienceManager(this);
        this.subscriptionManager = new SubscriptionManager(this, this.audienceManager, this.moneyManager);
        this.donationManager = new DonationManager(this, this.subscriptionManager, this.moneyManager);
        this.mokbanManager = new MokbanManager(this);
        this.chatSystem = new SimpleChatSystem(this);
        this.cuteActionManager = new CuteActionManager(this, this.audienceManager, this.chatSystem);
        this.foodPurchaseManager = new FoodPurchaseManager(this, this.moneyManager, this.mokbanManager);
        this.botManager = new BotManager(this, this.moneyManager, this.audienceManager, this.chatSystem); 

        this.setupVisualElements();
        this.setupStreamerAnimation();
        this.setupPupilTracking();
    }

    setupVisualElements() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const fullSize = { width: this.cameras.main.width, height: this.cameras.main.height };
    
        const images = [
            { key: 'background', depth: 0, size: fullSize },
            { key: 'luces', depth: 1, size: fullSize },
            { key: 'planta', depth: 1, size: fullSize },
            { key: 'streamer', depth: 5, scale: 0.7 },
            { key: 'ojosc_cc', depth: 6, scale: 0.7 }, 
            { key: 'pupilasc', depth: 7, scale: 0.7 },
            { key: 'desk', depth: 10, scale: 0.8 },
            { key: 'portapalillos', depth: 11, yOffset: -100, scale: 0.8 },
            { key: 'palillos', depth: 12, yOffset: -100, scale: 0.8 }
        ];
    
        images.forEach(config => {
            const image = this.add.image(
                centerX,
                centerY + (config.yOffset || 0),
                config.key
            ).setOrigin(0.5, 0.5)
             .setDepth(config.depth);
    
            if (config.size) {
                image.setDisplaySize(config.size.width, config.size.height);
            }
            if (config.scale) {
                image.setScale(config.scale);
            }
    
            this[config.key] = image;  
        });

        this.pupilOriginalPosition = {
            x: this.pupilasc.x,
            y: this.pupilasc.y
        };
        this.pupilMaxMovement = 8;
    }

    setupStreamerAnimation() {
        this.tweens.add({
            targets: this.streamer,  
            y: this.streamer.y + 3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    setupPupilTracking() {
        this.input.on('pointermove', (pointer) => {
            if (!this.pupilasc || !this.ojosc_cc) return;
            
            const eyeCenterX = this.ojosc_cc.x;
            const eyeCenterY = this.ojosc_cc.y;
            
            const dx = pointer.x - eyeCenterX;
            const dy = pointer.y - eyeCenterY;
            
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy), this.pupilMaxMovement);
            const angle = Math.atan2(dy, dx);
            
            const newX = this.pupilOriginalPosition.x + Math.cos(angle) * distance;
            const newY = this.pupilOriginalPosition.y + Math.sin(angle) * distance;
            
            this.tweens.add({
                targets: this.pupilasc,
                x: newX,
                y: newY,
                duration: 100,
                ease: 'Sine.easeOut'
            });
        });
    }

    cleanup() {
        this.audienceManager?.cleanup();
        this.mokbanManager?.cleanup();
        this.subscriptionManager?.cleanup();
        this.donationManager?.cleanup();
        this.cuteActionManager?.cleanup();
        this.moneyManager?.cleanup();
        this.foodPurchaseManager?.cleanup();
        this.chatSystem?.cleanup();
        this.botManager?.cleanup(); 
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.children.removeAll();
        
        if (this.input) {
            this.input.off('pointermove');
        }

        if (this.streamer) this.streamer.setTexture('streamer');
        if (this.ojosc_cc) {
            this.ojosc_cc.setTexture('ojosc_cc');  
            this.ojosc_cc.setVisible(true);
        }
        if (this.pupilasc) {
            this.pupilasc.setTexture('pupilasc');
            this.pupilasc.setVisible(true);
        }
    }

    triggerGameEnd(endType) {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        this.input.enabled = false;
        
        const gameStats = {
            streamTime: this.gameTimer.getFormattedTime(),
            peakViewers: this.audienceManager?.rating || 0, 
            subscribers: this.subscriptionManager?.subscribers || 0,
            totalDonations: this.donationManager?.totalDonations || 0,
            totalEarnings: this.moneyManager?.money || 0,  
            foodConsumed: (this.mokbanManager?.currentBowlLevel - 1) + (this.mokbanManager?.currentSushiLevel - 1),
            endType: endType
        };
        
        this.cleanup();
        
        this.scene.start('GameOverScene', { 
            stats: gameStats  
        });
    }
    
    addDialogueBox(text, character, styleOptions = {}) {
        if (!text || typeof text !== 'string' || !text.trim()) {
            console.warn("Texto de diálogo inválido:", text);
            return null; 
        }
    
        if (this.currentDialogueBox && this.currentDialogueBox.scene) {
            this.tweens.killTweensOf(this.currentDialogueBox);
            this.currentDialogueBox.destroy(true);
            this.currentDialogueBox = null;
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
                fill: style.textColor
            }
        ).setOrigin(0.5, 0);
        
        dialogueText.setWordWrapWidth(style.maxWidth - 2 * style.padding);
    
        const textBounds = dialogueText.getBounds();
        const boxWidth = Math.max(100, textBounds.width + 2 * style.padding); 
        const boxHeight = textBounds.height + 2 * style.padding;
    
        const dialogueBox = this.add.graphics()
            .fillStyle(style.boxColor, 0.8)
            .fillRoundedRect(
                this.cameras.main.centerX - boxWidth / 2,
                style.boxYPosition - style.padding,
                boxWidth,
                boxHeight,
                10
            )
            .lineStyle(style.borderThickness, style.borderColor)
            .strokeRoundedRect(
                this.cameras.main.centerX - boxWidth / 2,
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
    
        const destroyDialog = () => {
            if (this.currentDialogueBox && this.currentDialogueBox.scene) {
                this.tweens.killTweensOf(this.currentDialogueBox);
                this.currentDialogueBox.destroy(true);
                this.currentDialogueBox = null;
            }
        };
    
        this.tweens.add({
            targets: this.currentDialogueBox,
            alpha: 0,
            duration: 500,
            delay: 2500,
            onComplete: destroyDialog
        });
    
        return this.currentDialogueBox; 
    }

    shutdown() {
        this.cleanup();
    }
}