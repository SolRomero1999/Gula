class FoodPurchaseManager {
    constructor(scene, moneyManager, mokbanManager) {
        this.scene = scene;
        this.moneyManager = moneyManager;
        this.mokbanManager = mokbanManager;
        this.foodPrice = 25;
        this.currentBowlLevel = 1;
        this.maxBowlLevel = 5;
        
        this.createBuyButton();
    }

    createBuyButton() {
        // Crear botón en la parte inferior izquierda
        this.buyButton = this.scene.add.rectangle(
            120, // Posición X (izquierda)
            this.scene.cameras.main.height - 60, // Posición Y (abajo)
            200,
            50,
            0x4CAF50 // Color verde
        )
        .setInteractive()
        .setDepth(60);
        
        this.buttonText = this.scene.add.text(
            120,
            this.scene.cameras.main.height - 60,
            `Buy Food ($${this.foodPrice})`,
            {
                font: '20px Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5)
         .setDepth(61);
        
        // Efectos hover
        this.buyButton.on('pointerover', () => {
            if (!this.scene.isGameOver) {
                this.buyButton.setFillStyle(0x388E3C); // Verde más oscuro
            }
        });
        
        this.buyButton.on('pointerout', () => {
            if (!this.scene.isGameOver) {
                this.buyButton.setFillStyle(0x4CAF50); // Verde original
            }
        });
        
        this.buyButton.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.buyFood();
            }
        });
    }

    buyFood() {
        // Verificar si tiene suficiente dinero
        if (this.moneyManager.money >= this.foodPrice) {
            // Gastar dinero
            this.moneyManager.addMoney(-this.foodPrice);
            
            // Resetear el nivel del tazón
            this.resetBowl();
            
            // Feedback visual
            this.scene.tweens.add({
                targets: [this.buyButton, this.buttonText],
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 100,
                yoyo: true
            });
            
            this.scene.addDialogueBox("Food restocked!", "System", {
                textColor: '#ffffff',
                boxColor: 0x000000,
                borderColor: 0x4CAF50,
                borderThickness: 2
            });
        } else {
            // No tiene suficiente dinero
            this.scene.tweens.add({
                targets: [this.buyButton, this.buttonText],
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
    }

    resetBowl() {
        this.currentBowlLevel = 1;
        this.mokbanManager.resetBowlLevel();
    }

    cleanup() {
        if (this.buyButton) this.buyButton.destroy();
        if (this.buttonText) this.buttonText.destroy();
    }
}