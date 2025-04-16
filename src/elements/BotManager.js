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
        // Botón espejado al de comida (400 -> width-400)
        this.buyButton = this.scene.add.rectangle(
            this.scene.cameras.main.width - 400, 
            this.scene.cameras.main.height - 60, 
            200,
            50,
            0x9C27B0 // Color morado para diferenciar
        )
        .setInteractive()
        .setDepth(60);
        
        this.buttonText = this.scene.add.text(
            this.scene.cameras.main.width - 400,
            this.scene.cameras.main.height - 60,
            `Buy Bots ($${this.botPrice})`,
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
                this.buyButton.setFillStyle(0x7B1FA2); // Morado más oscuro
            }
        });
        
        this.buyButton.on('pointerout', () => {
            if (!this.scene.isGameOver) {
                this.buyButton.setFillStyle(0x9C27B0); // Morado original
            }
        });
        
        this.buyButton.on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.buyBots();
            }
        });
    }

    buyBots() {
        if (this.moneyManager.money >= this.botPrice) {
            this.moneyManager.addMoney(-this.botPrice);
            
            // 30% de chance de que los suscriptores se den cuenta
            if (Math.random() < 0.3) {
                this.botsDiscovered();
            } else {
                this.botsAddedSuccessfully();
            }
        } else {
            this.showNotEnoughMoney();
        }
    }

    botsAddedSuccessfully() {
        // Añadir bots normalmente
        const addedBots = 100;
        this.botCount += addedBots;
        this.audienceManager.changeRating(addedBots);
        
        // Efectos visuales
        this.scene.tweens.add({
            targets: [this.buyButton, this.buttonText],
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
        
        // Mensaje de chat aleatorio de bot (usando MessageGenerator)
        const botMessages = MessageGenerator.getBotMessages();
        this.chatSystem.addSpecialMessage(
            `Bot_${Math.floor(Math.random() * 1000)}`,
            botMessages[Math.floor(Math.random() * botMessages.length)],
            '#888888' // Color gris para bots
        );
    }

    botsDiscovered() {
        // Penalización por bots descubiertos
        const penalty = -200;
        this.audienceManager.changeRating(penalty);
        this.botCount = Math.max(0, this.botCount - 100);
        
        // Efectos visuales
        this.scene.tweens.add({
            targets: [this.buyButton, this.buttonText],
            tint: 0xff0000,
            duration: 300,
            yoyo: true
        });
        
        this.scene.cameras.main.shake(300, 0.02);
        
        this.scene.addDialogueBox("Bots discovered!", "System", {
            textColor: '#ff0000',
            boxColor: 0x000000,
            borderColor: 0xff0000
        });
        
        // Añadir varios mensajes de chat enfadados (usando MessageGenerator)
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

    cleanup() {
        if (this.buyButton) this.buyButton.destroy();
        if (this.buttonText) this.buttonText.destroy();
    }
}