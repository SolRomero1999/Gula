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
        const x = this.scene.cameras.main.centerX; 
        const y = this.scene.cameras.main.height - 60; 
    
        this.button = this.scene.add.graphics().setDepth(60);
        this.drawGlossyButton(0xff69b4);
    
        this.hitArea = this.scene.add.rectangle(
            x, y, 180, 50
        ).setInteractive({ useHandCursor: true }).setDepth(61);
    
        this.buttonText = this.scene.add.text(
            x, y,
            'Acting Cute',
            { font: '18px Arial', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5).setDepth(62); 
    
        this.hitArea.on('pointerover', () => this.drawGlossyButton(0xff1493));
        this.hitArea.on('pointerout', () => this.drawGlossyButton(0xff69b4));
        this.hitArea.on('pointerdown', () => this.executeAction());
    }
    
    drawGlossyButton(color) {
        const x = this.scene.cameras.main.centerX;
        const y = this.scene.cameras.main.height - 60;
    
        this.button.clear();
        this.button.fillStyle(color, 1);
        this.button.fillRoundedRect(x - 90, y - 25, 180, 50, 25); 
        this.button.fillStyle(0xFFFFFF, 0.4);
        this.button.fillRoundedRect(x - 80, y - 22, 160, 15, 15); 
    }
    

    onButtonHover(color) {
        if (!this.cooldown && !this.scene.isGameOver) {
            this.drawGlossyButton(color);
        }
    }

    executeAction() {
        this.scene.sound.play('miau');
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
        this.drawGlossyButton(0x888888); 

        this.cooldownTimer = this.scene.time.delayedCall(5000, () => {
            this.cooldown = false;
            this.drawGlossyButton(0xff69b4); 
            this.cooldownTimer = null;
        });
    }

    showEffects(result) {
        const stomachLevel = this.scene.mokbanManager?.displayStomach || 100;
        this.isActionActive = true;
        
        if (stomachLevel <= 10) {
            this.scene.streamer.setTexture('streamertg');
            this.scene.ojosc_cc.setVisible(false);
            this.scene.pupilasc.setTexture('full').setVisible(true);
        } 
        else if (stomachLevel <= 50) {
            this.scene.streamer.setTexture('streamertg');
            this.scene.ojosc_cc.setVisible(false);
            this.scene.pupilasc.setVisible(false);
        } 
        else {
            this.scene.streamer.setTexture('streamert');
            // Verificar si existen antes de usarlas
            if (this.scene.textures.exists('ojosc_cc')) {
                this.scene.ojosc_cc.setTexture('ojostiernos');
            }
            if (this.scene.textures.exists('pupilasc')) {
                this.scene.pupilasc.setTexture('pupilastiernas');
            }
            this.scene.ojosc_cc.setVisible(true);
            this.scene.pupilasc.setVisible(true);
        }
        this.scene.addDialogueBox(result.message, "Miao Mao", {
            boxColor: 0x000000,
            borderColor: 0xFFFFFF,
            textColor: "#FFFFFF",
            borderThickness: 2
        });

        if (result.isOverusing) {
            this.scene.cameras.main.shake(300, 0.02);
        } else {
            this.scene.cameras.main.flash(200, 255, 192, 203);
        }

        this.scene.tweens.add({
            targets: this.hitArea,
            scaleX: 0.9,
            scaleY: 0.9,
            duration: 100,
            yoyo: true
        });

        const username = UserGenerator.generateUsername();
        const userColor = UserGenerator.generateUserColor();
        const chatMessage = result.isOverusing ? 
            MessageGenerator.getRandomCringeReaction() : 
            MessageGenerator.getRandomPositiveReaction();
        this.chatSystem.addSpecialMessage(username, chatMessage, userColor);

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
