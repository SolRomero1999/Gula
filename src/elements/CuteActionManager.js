class CuteActionManager {
    constructor(scene, audienceManager, chatSystem) {
        this.scene = scene;
        this.audienceManager = audienceManager;
        this.chatSystem = chatSystem;
        this.cooldown = false;
        this.cooldownTimer = null;
        
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
        const isOverusing = Math.random() < 0.4;
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
        // Cambiar los assets temporalmente
        this.scene.streamer.setTexture('streamerT');
        this.scene.OjosC1_02.setTexture('ojosc2');
        this.scene.pupilasc1.setTexture('pupilasc2');
    
        // Mostrar el diálogo
        const dialogue = this.scene.addDialogueBox(result.message, "Miao Mao", {
            boxColor: 0x000000,
            borderColor: 0xFFFFFF,
            textColor: "#FFFFFF",
            borderThickness: 2
        });
    
        // Configurar el chat y efectos visuales
        const username = UserGenerator.generateUsername();
        const userColor = UserGenerator.generateUserColor();
        const chatMessage = result.isOverusing ? 
            MessageGenerator.getRandomCringeReaction() : 
            MessageGenerator.getRandomPositiveReaction();
        
        this.chatSystem.addSpecialMessage(username, chatMessage, userColor);
    
        if (result.isOverusing) {
            this.scene.cameras.main.shake(300, 0.02);
            this.scene.tweens.add({
                targets: this.button,
                tint: 0xff0000,
                duration: 300,
                yoyo: true
            });
        } else {
            this.scene.cameras.main.flash(200, 255, 192, 203);
            this.scene.tweens.add({
                targets: this.button,
                tint: 0xffffff,
                duration: 300,
                yoyo: true
            });
        }
    
        this.scene.tweens.add({
            targets: this.button,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true
        });
    
        // Restaurar los assets originales cuando el diálogo desaparezca
        this.scene.time.delayedCall(3000, () => {
            if (this.scene.streamer && this.scene.streamer.scene) {
                this.scene.streamer.setTexture('streamer');
            }
            if (this.scene.OjosC1_02 && this.scene.OjosC1_02.scene) {
                this.scene.OjosC1_02.setTexture('OjosC1_02');
            }
            if (this.scene.pupilasc1 && this.scene.pupilasc1.scene) {
                this.scene.pupilasc1.setTexture('pupilasc1');
            }
        });
    }

    cleanup() {
        if (this.button) this.button.destroy();
        if (this.buttonText) this.buttonText.destroy();
        if (this.cooldownTimer) this.cooldownTimer.destroy();
    }
}