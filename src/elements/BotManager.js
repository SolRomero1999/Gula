class BotManager {
    constructor(scene, moneyManager, audienceManager, chatSystem) {
        this.scene = scene;
        this.moneyManager = moneyManager;
        this.audienceManager = audienceManager;
        this.chatSystem = chatSystem;
        this.botPrice = 100;
        this.botCount = 0;
        
        this.createBuyButton();
    }

    createBuyButton() {
        const x = this.scene.cameras.main.width - 440;
        const y = this.scene.cameras.main.height - 60;
        const buttonWidth = 180;
        const buttonHeight = 50;

        this.buyButton = this.scene.add.graphics().setDepth(60);
        this.drawGlossyButton(this.buyButton, x, 0x9C27B0, buttonWidth, buttonHeight);  
    
        this.buttonText = this.scene.add.text(
            x,
            y,
            `Buy Bots ($${this.botPrice})`,
            {
                font: '18px Arial',
                fill: '#ffffff',
                fontWeight: 'bold',
                align: 'center'
            }
        ).setOrigin(0.5).setDepth(61);

        this.hitArea = this.scene.add.rectangle(
            x, 
            y, 
            buttonWidth, 
            buttonHeight
        ).setInteractive({ useHandCursor: true }).setDepth(62);
    
        // Efectos hover
        this.hitArea.on('pointerover', () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(this.buyButton, x, 0x7B1FA2, buttonWidth, buttonHeight); 
            }
        });
    
        this.hitArea.on('pointerout', () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(this.buyButton, x, 0x9C27B0, buttonWidth, buttonHeight); 
            }
        });
    
        this.hitArea.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.buyBots();
            }
        });
    }
    
    drawGlossyButton(button, x, color, width = 180, height = 50) {
        const y = this.scene.cameras.main.height - 60;
        const radius = 25;
    
        button.clear();
        button.fillStyle(color, 1);
        button.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
        button.fillStyle(0xFFFFFF, 0.4);
        button.fillRoundedRect(x - width / 2 + 10, y - height / 2 + 3, width - 20, 15, 15);
    }
    

    buyBots() {
        if (this.moneyManager.money >= this.botPrice) {
            this.moneyManager.addMoney(-this.botPrice);

            if (Math.random() < 0.3) {
                this.botsDiscovered();
            } else {
                this.botsAddedSuccessfully();
            }
        } else {
            this.showNotEnoughMoney()
        }
    }

    botsAddedSuccessfully() {
        const addedBots = 100;
        this.botCount += addedBots;
        this.audienceManager.changeRating(addedBots);
        
        this.scene.tweens.add({
            targets: [this.hitArea, this.buttonText],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true
        });
        
        this.scene.addDialogueBox("Bots added!", "System", {
            textColor: '#ffffff',
            boxColor: 0x000000,
            borderColor: 0x9C27B0,
            borderThickness: 2
        });
        
        const botMessages = MessageGenerator.getBotMessages();
        this.chatSystem.addSpecialMessage(
            `Bot_${Math.floor(Math.random() * 1000)}`,
            botMessages[Math.floor(Math.random() * botMessages.length)],
            '#888888' 
        );
    }

    botsDiscovered() {
        const penalty = -200;
        this.audienceManager.changeRating(penalty);
        this.botCount = Math.max(0, this.botCount - 100);

        const x = this.scene.cameras.main.width - 400;
        this.drawGlossyButton(x, 0xff0000);
        
        this.scene.tweens.add({
            targets: [this.buttonText],
            tint: 0xff0000,
            duration: 300,
            yoyo: true
        });
        
        this.scene.cameras.main.shake(300, 0.02);
        
        this.scene.time.delayedCall(500, () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(x, 0x9C27B0);
            }
        });
        
        this.scene.addDialogueBox("Bots discovered!", "System", {
            textColor: '#ff0000',
            boxColor: 0x000000,
            borderColor: 0xff0000
        });
        
        const angryMessages = MessageGenerator.getBotDiscoveredMessages();
        for (let i = 0; i < 3; i++) {
            this.chatSystem.addSpecialMessage(
                UserGenerator.generateUsername(),
                angryMessages[Math.floor(Math.random() * angryMessages.length)],
                UserGenerator.generateUserColor()
            );
        }
    }

    showNotEnoughMoney() {
        const x = this.hitArea.x;
        
        this.drawGlossyButton(this.buyButton, x, 0xff0000);
        
        this.scene.tweens.add({
            targets: [this.buttonText],
            tint: 0xff0000,
            duration: 300,
            yoyo: true
        });

        this.scene.addDialogueBox("Not enough money!", "System", {
            textColor: '#ff0000',
            boxColor: 0x000000,
            borderColor: 0xff0000
        });

        this.scene.time.delayedCall(500, () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(this.buyButton, x, 0x9C27B0);
            }
        });
    }

    cleanup() {
        if (this.buyButton) this.buyButton.destroy();
        if (this.buttonText) this.buttonText.destroy();
        if (this.hitArea) this.hitArea.destroy();
    }
}