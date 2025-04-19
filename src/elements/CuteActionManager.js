class CuteActionManager {
    constructor(scene, audienceManager, chatSystem) {
        this.scene = scene;
        this.audienceManager = audienceManager;
        this.chatSystem = chatSystem;
        this.cooldown = false;
        this.cooldownTimer = null;
        this.isActionActive = false;
        
        this.createButton();
    }

    createButton() {
        this.button = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.height - 60,
            200,
            50,
            0xff69b4
        ).setInteractive()
         .setDepth(60);

        this.buttonText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.height - 60,
            'Acting Cute',
            {
                font: '20px Arial',
                fill: '#ffffff',
                fontWeight: 'bold'
            }
        ).setOrigin(0.5)
         .setDepth(61);

        this.button.on('pointerover', () => this.onButtonHover(0xff1493));
        this.button.on('pointerout', () => this.onButtonHover(0xff69b4));
        this.button.on('pointerdown', () => this.executeAction());
    }

    onButtonHover(color) {
        if (!this.cooldown && !this.scene.isGameOver) {
            this.button.setFillStyle(color);
        }
    }

    executeAction() {
        if (this.scene.mokbanManager?.displayStomach <= 10) {
            this.scene.addDialogueBox("Too full to act cute!", "Miao Mao", {
                boxColor: 0x000000,
                borderColor: 0xff0000,
                textColor: "#ffffff"
            });
            return;
        }

        if (this.cooldown || this.scene.isGameOver) return;

        this.startCooldown();
        const result = this.generateResult();

        const gameOver = this.audienceManager.changeRating(
            result.isOverusing ? -result.audienceChange : result.audienceChange
        );
        
        if (gameOver) {
            this.scene.triggerGameOver('audience');
            return;
        }

        this.showEffects(result);
    }

    generateResult() {
        const stomachLevel = this.scene.mokbanManager?.displayStomach || 100;
        const overuseProbability = Phaser.Math.Clamp(0.4 + (100 - stomachLevel) * 0.005, 0.4, 0.7);
        
        const isOverusing = Math.random() < overuseProbability;
        const message = this.getRandomCatMessage();
        
        return {
            isOverusing: isOverusing,
            audienceChange: isOverusing ? 
                Phaser.Math.Between(30, 100) : 
                Phaser.Math.Between(80, 200),
            message: message
        };
    }

    getRandomCatMessage() {
        const messages = [
            "Miao~ So cute!", "Purrfect moment!", "Nyaa~ Kawaii!", "Miao Mao is happy!", "So fluffy!",
            "Pawsitively adorable!", "Meow meow~", "Such a cute streamer!", "Miao~ Heart melting!", "Nyaa~ So charming!"
        ];
        return Phaser.Utils.Array.GetRandom(messages);
    }

    startCooldown() {
        this.cooldown = true;
        this.button.setFillStyle(0x888888);
        
        this.cooldownTimer = this.scene.time.delayedCall(5000, () => {
            this.cooldown = false;
            this.button.setFillStyle(0xff69b4);
            this.cooldownTimer = null;
        });
    }

    showEffects(result) {
        const stomachLevel = this.scene.mokbanManager?.displayStomach || 100;
        this.isActionActive = true;
        
        if (stomachLevel <= 10) {
            // Versión "lleno lleno" con pupilas especiales
            this.scene.streamer.setTexture('streamerTG');
            this.scene.OjosC1_02.setVisible(false);
            this.scene.pupilasc1.setTexture('full'); // Pupilas especiales
            this.scene.pupilasc1.setVisible(true);
        } else if (stomachLevel <= 50) {
            // Versión "medio lleno"
            this.scene.streamer.setTexture('streamerTG');
            this.scene.OjosC1_02.setVisible(false);
            this.scene.pupilasc1.setVisible(false);
        } else {
            // Versión normal
            this.scene.streamer.setTexture('streamerT');
            this.scene.OjosC1_02.setTexture('ojosc2');
            this.scene.pupilasc1.setTexture('pupilasc2');
        }

        // Mostrar diálogo
        this.scene.addDialogueBox(result.message, "Miao Mao", {
            boxColor: 0x000000,
            borderColor: 0xFFFFFF,
            textColor: "#FFFFFF",
            borderThickness: 2
        });

        // Efectos especiales
        if (result.isOverusing) {
            this.scene.cameras.main.shake(300, 0.02);
        } else {
            this.scene.cameras.main.flash(200, 255, 192, 203);
        }

        // Animación del botón
        this.scene.tweens.add({
            targets: this.button,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true
        });

        // Mensaje de chat
        const username = UserGenerator.generateUsername();
        const userColor = UserGenerator.generateUserColor();
        const chatMessage = result.isOverusing ? 
            MessageGenerator.getRandomCringeReaction() : 
            MessageGenerator.getRandomPositiveReaction();
        this.chatSystem.addSpecialMessage(username, chatMessage, userColor);

        // Temporizador para restaurar apariencia después de 1 segundo
        this.scene.time.delayedCall(1000, () => {
            this.isActionActive = false;
            this.scene.mokbanManager.updateStreamerAppearance();
        });
    }

    cleanup() {
        if (this.button) this.button.destroy();
        if (this.buttonText) this.buttonText.destroy();
        if (this.cooldownTimer) this.cooldownTimer.destroy();
        this.isActionActive = false;
    }
}