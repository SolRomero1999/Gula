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
        const x = this.scene.cameras.main.centerX; // Centro de la cámara horizontal
        const y = this.scene.cameras.main.height - 60; // Altura menos 60 píxeles
    
        // Botón base redondeado
        this.button = this.scene.add.graphics().setDepth(60);
        this.drawGlossyButton(0xff69b4);
    
        // Asegurarse de que el área de interacción esté centrada correctamente
        this.hitArea = this.scene.add.rectangle(
            x, y, 180, 50
        ).setInteractive({ useHandCursor: true }).setDepth(61);
    
        // Asegurarse de que el texto esté centrado dentro del botón
        this.buttonText = this.scene.add.text(
            x, y,
            'Acting Cute',
            { font: '18px Arial', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(62); // setOrigin(0.5) centra el texto
    
        // Eventos de interacción
        this.hitArea.on('pointerover', () => this.drawGlossyButton(0xff1493));
        this.hitArea.on('pointerout', () => this.drawGlossyButton(0xff69b4));
        this.hitArea.on('pointerdown', () => this.executeAction());
    }
    
    drawGlossyButton(color) {
        const x = this.scene.cameras.main.centerX;
        const y = this.scene.cameras.main.height - 60;
    
        this.button.clear();
    
        // Fondo principal redondeado
        this.button.fillStyle(color, 1);
        this.button.fillRoundedRect(x - 90, y - 25, 180, 50, 25); // Asegúrate de que la posición x se ajuste para centrarlo
    
        // Brillo tipo glaseado superior
        this.button.fillStyle(0xFFFFFF, 0.4);
        this.button.fillRoundedRect(x - 80, y - 22, 160, 15, 15); // Ajusta también el brillo
    }
    

    onButtonHover(color) {
        if (!this.cooldown && !this.scene.isGameOver) {
            this.drawGlossyButton(color);
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
            this.scene.triggerGameEnd('audience');
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
        this.drawGlossyButton(0x888888); // Cambiar el color del botón al gris

        this.cooldownTimer = this.scene.time.delayedCall(5000, () => {
            this.cooldown = false;
            this.drawGlossyButton(0xff69b4); // Restaurar el color original
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
            targets: this.hitArea,
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
