class FoodPurchaseManager {
    constructor(scene, moneyManager, mokbanManager) {
        this.scene = scene;
        this.moneyManager = moneyManager;
        this.mokbanManager = mokbanManager;
        
        // Precios de los alimentos
        this.ramenPrice = 50;
        this.sushiPrice = 200;
        
        this.createBuyButtons();
    }

    createBuyButtons() {
        // Botón para comprar Ramen (a la derecha)
        this.ramenButton = this.scene.add.rectangle(
            410, 
            this.scene.cameras.main.height - 60, 
            180,
            50,
            0x4CAF50 
        )
        .setInteractive()
        .setDepth(60);
        
        this.ramenButtonText = this.scene.add.text(
            410,
            this.scene.cameras.main.height - 60,
            `Buy Ramen ($${this.ramenPrice})`,
            {
                font: '18px Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5)
         .setDepth(61);

        // Botón para comprar Sushi (a la izquierda)
        this.sushiButton = this.scene.add.rectangle(
            190, 
            this.scene.cameras.main.height - 60, 
            180,
            50,
            0x2196F3 
        )
        .setInteractive()
        .setDepth(60);
        
        this.sushiButtonText = this.scene.add.text(
            190,
            this.scene.cameras.main.height - 60,
            `Buy Sushi ($${this.sushiPrice})`,
            {
                font: '18px Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5)
         .setDepth(61);

        // Configurar interacciones para el botón de Ramen
        this.setupButtonInteractions(
            this.ramenButton, 
            this.ramenButtonText, 
            0x4CAF50, 
            0x388E3C, 
            () => this.buyRamen()
        );

        // Configurar interacciones para el botón de Sushi
        this.setupButtonInteractions(
            this.sushiButton, 
            this.sushiButtonText, 
            0x2196F3, 
            0x1976D2, 
            () => this.buySushi()
        );
    }

    setupButtonInteractions(button, text, normalColor, hoverColor, callback) {
        button.on('pointerover', () => {
            if (!this.scene.isGameOver) {
                button.setFillStyle(hoverColor); 
            }
        });
        
        button.on('pointerout', () => {
            if (!this.scene.isGameOver) {
                button.setFillStyle(normalColor); 
            }
        });
        
        button.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                callback();
            }
        });
    }

    buyRamen() {
        if (this.moneyManager.money >= this.ramenPrice) {
            this.moneyManager.addMoney(-this.ramenPrice);
            this.mokbanManager.resetBowlLevel();

            this.animateButton(this.ramenButton, this.ramenButtonText);
            
            this.scene.addDialogueBox("Ramen restocked!", "System", {
                textColor: '#ffffff',
                boxColor: 0x000000,
                borderColor: 0x4CAF50,
                borderThickness: 2
            });
        } else {
            this.showNotEnoughMoney(this.ramenButton, this.ramenButtonText);
        }
    }

    buySushi() {
        if (this.moneyManager.money >= this.sushiPrice) {
            this.moneyManager.addMoney(-this.sushiPrice);
            this.mokbanManager.resetSushiLevel();

            this.animateButton(this.sushiButton, this.sushiButtonText);
            
            this.scene.addDialogueBox("Sushi restocked!", "System", {
                textColor: '#ffffff',
                boxColor: 0x000000,
                borderColor: 0x2196F3,
                borderThickness: 2
            });
        } else {
            this.showNotEnoughMoney(this.sushiButton, this.sushiButtonText);
        }
    }

    animateButton(button, text) {
        this.scene.tweens.add({
            targets: [button, text],
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 100,
            yoyo: true
        });
    }

    showNotEnoughMoney(button, text) {
        this.scene.tweens.add({
            targets: [button, text],
            tint: 0xff0000,
            duration: 300,
            yoyo: true
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
        if (this.sushiButton) this.sushiButton.destroy();
        if (this.sushiButtonText) this.sushiButtonText.destroy();
    }
}