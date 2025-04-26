class TutorialScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TutorialScene' });

        this.buttonConfig = {
            width: 180,
            height: 50,
            yPos: 0,
            colors: {
                sushi: 0x2196F3, 
                ramen: 0x4CAF50,  
                cute: 0xff69b4,  
                bots: 0x9C27B0    
            },
            positions: {
                sushi: 240,
                ramen: 440,
                cute: 0, 
                bots: 0  
            }
        };
    }

    preload() {
        this.load.image('planta', 'assets/planta.png');
        this.load.image('luces', 'assets/luces.png');
        this.load.image('desk', 'assets/desk.png');
        this.load.image('ramen_bowl1', 'assets/ramen_bowl1.png');
        this.load.image('sushi1', 'assets/sushi1.png');
        this.load.image('palillos', 'assets/palillos.png');
        this.load.image('portapalillos', 'assets/PortaPalillos.png');
        this.load.image('streamer', 'assets/streamer.png');
        this.load.image('ojosc_cc', 'assets/OjosC1_02.png');
        this.load.image('pupilasc', 'assets/pupilasc1.png');
        this.load.image('background', 'assets/background.png');
    }
    

    create() {
        this.music = this.sound.add('game', { loop: true });
        this.music.play();
        this.buttonConfig.yPos = this.cameras.main.height - 60;
        this.buttonConfig.positions.cute = this.cameras.main.centerX;
        this.buttonConfig.positions.bots = this.cameras.main.width - 440;
        this.setupVisualElements();
        this.setupAnimations();
        this.createUIElements();
        this.setupTutorial();
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
            { key: 'ojosc_cc', depth: 6, scale: 0.7 },
            { key: 'pupilasc', depth: 7, scale: 0.7 },
            { key: 'desk', depth: 10, scale: 0.8 },
            { key: 'portapalillos', depth: 11, yOffset: -100, scale: 0.8 },
            { key: 'palillos', depth: 12, yOffset: -100, scale: 0.8 }
        ];

        images.forEach(config => {
            const image = this.add.image(
                centerX,
                centerY + (config.yOffset || 0),
                config.key
            ).setOrigin(0.5, 0.5).setDepth(config.depth);

            if (config.size) image.setDisplaySize(config.size.width, config.size.height);
            if (config.scale) image.setScale(config.scale);

            this[config.key] = image;
        });
    }

    setupAnimations() {
        this.tweens.add({
            targets: this.streamer,
            y: this.streamer.y + 3,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.pupilBaseX = this.pupilasc.x;
        this.pupilBaseY = this.pupilasc.y;
        this.maxPupilOffset = 5;
    }

    createUIElements() {
        this.createFoodElements();
        this.createBuyButtons();
        this.createPanels();
        this.createSkipButton();
    }

    createFoodElements() {
        this.sushiItem = this.add.sprite(
            this.cameras.main.centerX - 350,
            this.cameras.main.centerY + 160,
            'sushi1'
        ).setScale(0.6).setDepth(16);

        this.foodItem = this.add.sprite(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 150,
            'ramen_bowl1'
        ).setScale(0.4).setDepth(15);

        this.createStomachBar();
    }

    createStomachBar() {
        const barWidth = 30;
        const barHeight = this.cameras.main.height * 0.88;
        const margin = 20;
        const startY = this.cameras.main.height - margin - barHeight;

        this.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(margin, startY, barWidth, barHeight)
            .setDepth(20);

        this.stomachFill = this.add.graphics().setDepth(21);
        this.updateStomachBar(0); 
    }    

    createBuyButtons() {
        const { yPos, width, height, colors, positions } = this.buttonConfig;
        const buttonTexts = {
            sushi: "Buy Sushi ($200)",
            ramen: "Buy Ramen ($50)",
            cute: "Acting Cute",
            bots: "Buy Bots ($100)"
        };

        Object.keys(positions).forEach(type => {
            const x = positions[type];
            const color = colors[type];
 
            const button = this.add.graphics()
                .setDepth(60)
                .setData('type', type);
       
            this.drawButton(button, x, color, width, height);
          
            this.add.text(
                x,
                yPos,
                buttonTexts[type],
                { 
                    font: '18px Arial', 
                    fill: '#ffffff', 
                    fontWeight: 'bold',
                    align: 'center'
                }
            ).setOrigin(0.5).setDepth(61);
        });
    }

    drawButton(button, x, color, width, height) {
        const y = this.buttonConfig.yPos;
        const radius = 25;

        button.clear();
        button.fillStyle(color, 1);
        button.fillRoundedRect(x - width/2, y - height/2, width, height, radius);
        button.fillStyle(0xFFFFFF, 0.4);
        button.fillRoundedRect(x - width/2 + 10, y - height/2 + 3, width - 20, 15, 15);
    }

    createPanels() {
        this.createAudiencePanel();
        this.createChatPanel();
        this.createMoneyPanel();
        this.createLiveDisplay();
    }

    createAudiencePanel() {
        const panel = this.add.graphics().setDepth(9);
        const icon = this.add.text(0, 0, '👥', { font: '26px Arial' }).setDepth(10);

        this.audienceText = this.add.text(0, 0, '100 / 1000', {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'left'
        }).setDepth(10);
    
        const paddingX = 20;
        const paddingY = 10;
        const textBounds = this.audienceText.getBounds();
        const width = textBounds.width + 60;
        const height = textBounds.height + paddingY * 2;
        const x = this.cameras.main.centerX - width / 2;
        const y = 20;
   
        panel.clear();
        panel.fillStyle(0x9147ff, 0.8);
        panel.fillRoundedRect(x, y, width, height, 12);
        panel.lineStyle(2, 0xffffff, 0.3);
        panel.strokeRoundedRect(x, y, width, height, 12);

        icon.setPosition(x + 15, y + paddingY);
        this.audienceText.setPosition(icon.x + 35, y + paddingY);
        
        this.audiencePanel = panel;
        this.audiencePanelX = x;
        this.audiencePanelY = y;
        this.audiencePanelWidth = width;
        this.audiencePanelHeight = height;
    }

    createChatPanel() {
        if (!this.cameras?.main) return;

        const camera = this.cameras.main;
        const chatX = camera.width - 270;
        const chatY = 70;
        const panelHeight = camera.height - chatY - 20;

        this.chatContainer = this.add.container(chatX, chatY).setDepth(50);

        const chatBackground = this.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRect(0, 0, 300, panelHeight)
            .lineStyle(1, 0x9147ff, 0.5)
            .strokeRect(0, 0, 300, panelHeight)
            .setDepth(50);

        this.chatContainer.add(chatBackground);
    }

    createMoneyPanel() {
        const paddingX = 20;
        const paddingY = 10;
        const fontSize = 26;

        this.moneyText = this.add.text(0, 0, `$0`, {
            font: `bold ${fontSize}px Arial`,
            fill: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        }).setDepth(11);

        this.moneyText.setOrigin(0, 0);
        this.moneyText.setPosition(60, 20);

        this.panel = this.add.graphics().setDepth(10);
        this.updatePanelBackground();

        this.coinIcon = this.add.text(16, 20, '💰', {
            font: `28px Arial`
        }).setDepth(12);
    }

    updatePanelBackground() {
        const bounds = this.moneyText.getBounds();
        const paddingX = 20;
        const paddingY = 10;

        const width = bounds.width + paddingX;
        const height = bounds.height + paddingY;
        const x = this.moneyText.x - paddingX/2;
        const y = this.moneyText.y - paddingY/2;

        this.panel.clear();
        this.panel.fillStyle(0x1e1e1e, 0.8);
        this.panel.fillRoundedRect(x, y, width, height, 12);
        this.panel.lineStyle(2, 0xffffff, 0.3);
        this.panel.strokeRoundedRect(x, y, width, height, 12);
    }

    createLiveDisplay() {
        this.liveText = this.add.text(
            this.cameras.main.width - 30, 20,
            '🔴 LIVE 00:00', {
                font: 'bold 26px Arial',
                fill: '#ffffff',
                backgroundColor: '#1e1e1e',
                padding: { x: 15, y: 8 },
                shadow: { 
                    offsetX: 2, 
                    offsetY: 2, 
                    color: '#000', 
                    blur: 4, 
                    fill: true 
                }
            }
        ).setOrigin(1, 0).setDepth(50);
    }

    createSkipButton() {
        const buttonWidth = 160;
        const buttonHeight = 50;
        const buttonX = this.cameras.main.width - buttonWidth - 50;
        const buttonY = this.cameras.main.height - buttonHeight - 40;

        this.skipButton = this.add.graphics();
        this.skipButton.fillStyle(0xFF5555, 0.8);
        this.skipButton.fillRoundedRect(buttonX, buttonY, buttonWidth, buttonHeight, 10)
            .setDepth(110)
            .setInteractive(new Phaser.Geom.Rectangle(buttonX, buttonY, buttonWidth, buttonHeight), Phaser.Geom.Rectangle.Contains);

        this.skipText = this.add.text(
            buttonX + buttonWidth/2, 
            buttonY + buttonHeight/2, 
            "Skip", 
            { font: "16px Arial", fill: "#FFFFFF" }
        ).setOrigin(0.5, 0.5).setDepth(111);

        this.skipButton.on('pointerdown', () => {
            this.sound.play('click'); 
            this.scene.start('GameScene');
        });
    }

    setupTutorial() {
        this.addTutorialDialogues();
    }

    addDialogueBox(text, character) {
        if (this.dialogueBox) {
            this.dialogueBox.destroy();
            this.dialogueText?.destroy();
            this.characterText?.destroy();
        }

        const boxWidth = this.cameras.main.width * 0.5;
        const boxHeight = 70;
        const boxX = this.cameras.main.centerX;
        const boxY = this.cameras.main.height * 0.2;

        this.dialogueBox = this.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRoundedRect(boxX - boxWidth/2, boxY - boxHeight/2, boxWidth, boxHeight, 15)
            .setDepth(100);

        this.characterText = this.add.text(
            boxX, 
            boxY - boxHeight/2 - 10, 
            character, 
            { 
                font: '20px Arial', 
                fill: '#FFFFFF',
                fontStyle: 'bold'
            }
        ).setOrigin(0.5, 0.5).setDepth(101);

        this.dialogueText = this.add.text(
            boxX, 
            boxY, 
            text, 
            { 
                font: '18px Arial', 
                fill: '#ffffff',
                wordWrap: { width: boxWidth - 40 },
                align: 'center'
            }
        ).setOrigin(0.5, 0.5).setDepth(101);
    }

    addTutorialDialogues() {
        const dialogues = [
            { text: "Welcome to Gula.", character: "Miao Mao" },
            { text: "Today we're going to do a mukbang stream, and I'll explain everything you need to know.", character: "Miao Mao" },
            { text: "First, these are our dishes of the day: sushi and ramen.", character: "Miao Mao", 
                Sushi: true, Ramen: true },
            { text: "Each food has two important things: its satiety level and its cost.", character: "Miao Mao" },
            { text: "Look at this bar here on the left — it's your satiety level. The fuller it is, the less space you have to keep eating.", character: "Miao Mao",
                Stomach: true, 
             },
            { text: "But be careful: If you let the bar stay full for too long, your viewers will get upset.", character: "Miao Mao",
                Audience: true,
             },
            { text: "And if you spend too much time without eating, they'll get bored and start leaving.", character: "Miao Mao" },
            { text: "The secret is simple: maintain balance.", character: "Miao Mao" },
            { text: "Eat enough to keep your audience happy, but without overeating.", character: "Miao Mao" },
            { text: "Each dish affects the bar in a different way:", character: "Miao Mao" },
            { text: "Sushi fills you up only a little, so you can eat more without much risk... though it's more expensive.", character: "Miao Mao",
                Sushi: true, SushiButton: true },
            { text: "Ramen fills you up a lot, so you have to be more careful when choosing it, but it's cheaper.", character: "Miao Mao",
                Ramen: true, RamenButton: true },
            { text: "If the bar gets completely full, you'll feel sick and the stream will end early. Avoid that!", character: "Miao Mao" },
            { text: "Now let's talk about the financial part: To buy more food, you'll need money.", character: "Miao Mao" },
            { text: "You'll earn money through subscriptions and donations.", character: "Miao Mao" },
            { text: "Subscriptions come naturally as more people watch your stream.", character: "Miao Mao" },
            { text: "The more subscribers you have, the more donations you'll get.", character: "Miao Mao" },
            { text: "And if you have extra money... you can spend it on bots to inflate your viewer count.", character: "Miao Mao",
                BotsButton: true },
            { text: "But watch out! If real viewers suspect you used bots, they'll get mad and your viewer count will drop.", character: "Miao Mao" },
            { text: "Use that trick carefully.", character: "Miao Mao" },
            { text: "If you run out of food and viewers start leaving, you can always try acting cute to win them back.", character: "Miao Mao",
                CuteButton: true },
            { text: "But if you overdo it, they might cringe and the plan will backfire.", character: "Miao Mao" },
            { text: "Also, keep this in mind: The stream will end automatically when the scheduled streaming time is up —in this case, 5 hours.", character: "Miao Mao" },
            { text: "But you can also end it early if: You eat too much and feel sick, you lose your entire audience, or if you decide to end the stream manually by tapping the counter in the upper right corner.", character: "Miao Mao" },
            { text: "All set? Remember: Eat wisely, manage your money, keep your viewers happy.", character: "Miao Mao" },
            { text: "And above all, don't forget to have fun!", character: "Miao Mao" },
            { text: "Now let's get streaming!", character: "Miao Mao" }
        ];

        this.currentDialogueIndex = 0;
        this.showNextDialogue(dialogues);
    }

    showNextDialogue(dialogues) {
        this.stopAllAnimations();
    
        if (this.currentDialogueIndex >= dialogues.length) {
            return;  
        }
    
        const dialogue = dialogues[this.currentDialogueIndex];
        this.addDialogueBox(dialogue.text, dialogue.character);
    
        if (dialogue.Stomach) {
            this.tweens.add({
                targets: { progress: 0 },
                progress: 100,
                duration: 1500,
                onUpdate: tween => {
                    this.updateStomachBar(tween.getValue());
                }
            });
        }
    
        if (dialogue.Sushi) this.animateSushi();
        if (dialogue.Ramen) this.animateRamen();
        if (dialogue.SushiButton) this.animateButton('sushi');
        if (dialogue.RamenButton) this.animateButton('ramen');
        if (dialogue.CuteButton) this.animateButton('cute');
        if (dialogue.BotsButton) this.animateButton('bots');
        if (dialogue.Audience) this.animateAudiencePanel();
  
        this.input.once('pointerdown', () => {
            this.showNextDialogue(dialogues);
        });
    
        this.currentDialogueIndex++;
    }
    
    

    animateSushi() {
        this.sushiTween = this.tweens.add({
            targets: this.sushiItem,
            scale: 0.65,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    animateRamen() {
        this.foodTween = this.tweens.add({
            targets: this.foodItem,
            scale: 0.45,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    animateButton(buttonType) {
        const { positions, yPos, width, height, colors } = this.buttonConfig;
        const x = positions[buttonType];
        const originalColor = colors[buttonType];
        
        let button;
        this.children.each(child => {
            if (child.type === 'Graphics' && child.getData('type') === buttonType) {
                button = child;
            }
        });
        
        if (!button) return;
        
        this[`${buttonType}ButtonTween`] = this.tweens.add({
            targets: button,
            alpha: { from: 0.6, to: 1 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            onUpdate: () => {
                button.clear();
                const currentAlpha = button.alpha;
                
                const highlightColor = Phaser.Display.Color.Interpolate.ColorWithColor(
                    Phaser.Display.Color.IntegerToColor(originalColor),
                    Phaser.Display.Color.IntegerToColor(0xffffff),
                    100,
                    (1 - currentAlpha) * 70 
                );
                
                const color = Phaser.Display.Color.ObjectToColor(highlightColor).color;
                
                button.fillStyle(color, 1);
                button.fillRoundedRect(x - width/2, yPos - height/2, width, height, 25);
                
                button.fillStyle(0xFFFFFF, 0.5 + (0.3 * (1 - currentAlpha)));
                button.fillRoundedRect(x - width/2 + 10, yPos - height/2 + 3, width - 20, 15, 15);
                
                button.lineStyle(2, 0xffffff, 0.8 * (1 - currentAlpha));
                button.strokeRoundedRect(x - width/2, yPos - height/2, width, height, 25);
            }
        });
    }

    resetButton(buttonType) {
        const { positions, yPos, width, height, colors } = this.buttonConfig;
        const x = positions[buttonType];
        const color = colors[buttonType];
        
        this.children.each(child => {
            if (child.type === 'Graphics' && child.getData('type') === buttonType) {
                child.destroy();
            }
        });
        
        const button = this.add.graphics()
            .setDepth(60)
            .setData('type', buttonType);
        
        this.drawButton(button, x, color, width, height);
    }
    animateAudiencePanel() {
        const originalText = this.audienceText.text;
    
        this.tweens.addCounter({
            from: 100,
            to: 0,
            duration: 1500,
            ease: 'Power1',
            onUpdate: tween => {
                const value = Math.floor(tween.getValue());
                this.audienceText.setText(`${value} / 1000`);
    
                if (value < 30) {
                    this.audienceText.setColor('#ff5555'); 
                } else {
                    this.audienceText.setColor('#ffffff'); 
                }
            },
            onComplete: () => {
                this.time.delayedCall(1000, () => {
                    this.tweens.addCounter({
                        from: 0,
                        to: 100,
                        duration: 1000,
                        ease: 'Power1',
                        onUpdate: tween => {
                            const value = Math.floor(tween.getValue());
                            this.audienceText.setText(`${value} / 1000`);
    
                            if (value > 70) {
                                this.audienceText.setColor('#ffffff'); 
                            }
                        },
                        onComplete: () => {
                            this.audienceText.setText(originalText);
                        }
                    });
                });
            }
        });
    }
    
    stopAllAnimations() {
        if (this.sushiTween) {
            this.sushiTween.stop();
            this.sushiItem?.setScale(0.6);
        }
        if (this.foodTween) {
            this.foodTween.stop();
            this.foodItem?.setScale(0.4);
        }
    
        ['sushi', 'ramen', 'cute', 'bots'].forEach(type => {
            const tween = this[`${type}ButtonTween`];
            if (tween) {
                tween.stop();
                this.resetButton(type);
            }
        });

        this.updateStomachBar(70);
    }
    
    updateStomachBar(percent) {
        const barWidth = 30;
        const barHeight = this.cameras.main.height * 0.88;
        const margin = 20;
        const startY = this.cameras.main.height - margin - barHeight;
    
        this.stomachFill.clear();
        this.stomachFill.fillStyle(0x00ff00, 1);
        const fillHeight = barHeight * (percent / 100);
        this.stomachFill.fillRect(margin, startY + barHeight - fillHeight, barWidth, fillHeight);
    }    

    update() {
        const pointer = this.input.activePointer;
        const dx = pointer.x - this.pupilBaseX;
        const dy = pointer.y - this.pupilBaseY;
        const angle = Math.atan2(dy, dx);

        this.pupilasc.x = this.pupilBaseX + Math.cos(angle) * this.maxPupilOffset;
        this.pupilasc.y = this.pupilBaseY + Math.sin(angle) * this.maxPupilOffset;
    }
}