class FoodPurchaseManager {
    constructor(scene, moneyManager, mokbanManager) {
        this.scene = scene;
        this.moneyManager = moneyManager;
        this.mokbanManager = mokbanManager;
        this.ramenPrice = 50;
        this.sushiPrice = 200;
        this.createBuyButtons();
    }

    createBuyButtons() {
        const y = this.scene.cameras.main.height - 60;
        const width = 180;
        const height = 50;
 
        this.sushiButton = this.scene.add.graphics().setDepth(60);
        this.sushiButtonText = this.scene.add.text(
            240,
            y,
            `Buy Sushi ($${this.sushiPrice})`,
            { font: '18px Arial', fill: '#ffffff', fontWeight: 'bold' }
        ).setOrigin(0.5).setDepth(61);
    
        this.sushiHitArea = this.scene.add.rectangle(
            240,
            y,
            width,
            height
        ).setInteractive({ useHandCursor: true }).setDepth(62);
    
        this.drawGlossyButton(this.sushiButton, 240, 0x2196F3, width, height);
    
        this.setupButtonInteractions(
            this.sushiHitArea,
            this.sushiButton,
            0x2196F3,  
            0x1976D2,  
            () => this.buySushi()
        );

        this.ramenButton = this.scene.add.graphics().setDepth(60);
        this.ramenButtonText = this.scene.add.text(
            440,
            y,
            `Buy Ramen ($${this.ramenPrice})`,
            { font: '18px Arial', fill: '#ffffff', fontWeight: 'bold' }
        ).setOrigin(0.5).setDepth(61);
    
        this.ramenHitArea = this.scene.add.rectangle(
            440,
            y,
            width,
            height
        ).setInteractive({ useHandCursor: true }).setDepth(62);
    
        this.drawGlossyButton(this.ramenButton, 440, 0x4CAF50, width, height);
    
        this.setupButtonInteractions(
            this.ramenHitArea,
            this.ramenButton,
            0x4CAF50,  
            0x388E3C,  
            () => this.buyRamen()
        );
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
    
    setupButtonInteractions(hitArea, button, normalColor, hoverColor, callback) {
        hitArea.on('pointerover', () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(button, hitArea.x, hoverColor);
            }
        });
    
        hitArea.on('pointerout', () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(button, hitArea.x, normalColor);
            }
        });
    
        hitArea.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                callback();
            }
        });
    }
    

    buyRamen() {
        if (this.moneyManager.money >= this.ramenPrice) {
            this.moneyManager.addMoney(-this.ramenPrice);
            this.mokbanManager.resetBowlLevel();

            this.animateButton(this.ramenHitArea, this.ramenButtonText);
            
            this.scene.addDialogueBox("Ramen restocked!", "System", {
                textColor: '#ffffff',
                boxColor: 0x000000,
                borderColor: 0x4CAF50,
                borderThickness: 2
            });
        } else {
            this.showNotEnoughMoney(this.ramenHitArea, this.ramenButtonText);
        }
    }

    buySushi() {
        if (this.moneyManager.money >= this.sushiPrice) {
            this.moneyManager.addMoney(-this.sushiPrice);
            this.mokbanManager.resetSushiLevel();

            this.animateButton(this.sushiHitArea, this.sushiButtonText);
            
            this.scene.addDialogueBox("Sushi restocked!", "System", {
                textColor: '#ffffff',
                boxColor: 0x000000,
                borderColor: 0x2196F3,
                borderThickness: 2
            });
        } else {
            this.showNotEnoughMoney(this.sushiHitArea, this.sushiButtonText);
        }
    }

    animateButton(hitArea, text) {
        this.scene.tweens.add({
            targets: [hitArea, text],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true
        });
    }

    showNotEnoughMoney(hitArea, text) {
        const originalColor = hitArea === this.ramenHitArea ? 0x4CAF50 : 0x2196F3;
        const button = hitArea === this.ramenHitArea ? this.ramenButton : this.sushiButton;
        const x = hitArea.x;
        
        this.drawGlossyButton(button, x, 0xff0000);
        
        this.scene.tweens.add({
            targets: text,
            tint: 0xff0000,
            duration: 300,
            yoyo: true
        });
        
        this.scene.time.delayedCall(500, () => {
            if (!this.scene.isGameOver) {
                this.drawGlossyButton(button, x, originalColor);
            }
        });
        
        this.scene.addDialogueBox("Not enough money!", "System", {
            textColor: '#ff0000',
            boxColor: 0x000000,
            borderColor: 0xff0000
        });
    }

    cleanup() {
        if (this.ramenButton) this.ramenButton.destroy();
        if (this.ramenButtonText) this.ramenButtonText.destroy();
        if (this.ramenHitArea) this.ramenHitArea.destroy();
        if (this.sushiButton) this.sushiButton.destroy();
        if (this.sushiButtonText) this.sushiButtonText.destroy();
        if (this.sushiHitArea) this.sushiHitArea.destroy();
    }
}