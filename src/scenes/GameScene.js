class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        const assets = [
            'background', 'planta', 'luces', 'desk',
            'ramen_bowl1', 'ramen_bowl2', 'ramen_bowl3','ramen_bowl4', 'ramen_bowl5', 
            'palillos','PortaPalillos', 
            'streamer', 'ojosc1', 'pupilasc1'
        ];
    
        assets.forEach(asset => {
            this.load.image(asset, `../assets/${asset}.png`);
        });
    }
    
    init() {
        this.isGameOver = false;
        this.currentDialogueBox = null;
    }

    create() {
        this.cleanup();

        this.moneyManager = new MoneyManager(this);
        this.audienceManager = new AudienceManager(this);
        this.subscriptionManager = new SubscriptionManager(this, this.audienceManager, this.moneyManager);
        this.mokbanManager = new MokbanManager(this);
        this.chatSystem = new SimpleChatSystem(this);
        this.cuteActionManager = new CuteActionManager(this, this.audienceManager, this.chatSystem);
        this.foodPurchaseManager = new FoodPurchaseManager(this, this.moneyManager, this.mokbanManager);
        this.botManager = new BotManager(this, this.moneyManager, this.audienceManager, this.chatSystem); 

        this.setupVisualElements();
  
        this.setupStreamerAnimation();
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
            { key: 'ojosc1', depth: 6, scale: 0.7 },
            { key: 'pupilasc1', depth: 7, scale: 0.7 },
            { key: 'desk', depth: 10, scale: 0.8 },
            { key: 'PortaPalillos', depth: 11, yOffset: -100, scale: 0.8 },
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

    cleanup() {
        this.audienceManager?.cleanup();
        this.mokbanManager?.cleanup();
        this.subscriptionManager?.cleanup();
        this.cuteActionManager?.cleanup();
        this.moneyManager?.cleanup();
        this.foodPurchaseManager?.cleanup();
        this.chatSystem?.cleanup();
        this.botManager?.cleanup(); 
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.children.removeAll();
    }

    triggerGameOver(loseType) {
        if (this.isGameOver) return; 
        
        this.isGameOver = true;
        
        this.input.enabled = false;
    
        this.cleanup();
        
        this.scene.start('GameOverScene', {
            loseType: loseType,
            audienceRating: this.audienceManager?.rating || 0,
            audienceGoal: this.audienceManager?.goal || 0
        });
    }
    
    addDialogueBox(text, character, styleOptions = {}) {
        if (!text || typeof text !== 'string' || !text.trim()) {
            console.warn("Texto de diálogo inválido:", text);
            return null; 
        }
    
        // Limpiar diálogo anterior de forma segura
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
    
        // Crear elementos del diálogo
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
    
        // Configurar auto-destrucción con manejo seguro
        const destroyDialog = () => {
            if (this.currentDialogueBox && this.currentDialogueBox.scene) {
                this.tweens.killTweensOf(this.currentDialogueBox);
                this.currentDialogueBox.destroy(true);
                this.currentDialogueBox = null;
            }
        };
    
        // Animación de desvanecimiento
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