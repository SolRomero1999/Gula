class SimpleChatSystem {
    constructor(scene) {
        this.scene = scene;
        this.chatMessages = [];
        this.maxMessages = 15;
        this.chatContainer = null;
        this.lineHeight = 32;
        this.panelHeight = 500;
        this.lastMessageTime = 0;
        this.messageCooldown = 1000;

        this.scene.events.once('create', () => {
            this.setupChat();
            this.setupEventListeners();
        });
    }

    setupChat() {
        if (!this.scene.cameras?.main) return;

        const camera = this.scene.cameras.main;
        const chatX = camera.width - 270;
        const chatY = 70;
        this.panelHeight = camera.height - chatY - 20;

        this.chatContainer = this.scene.add.container(chatX, chatY).setDepth(50);

        const chatBackground = this.scene.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRect(0, 0, 300, this.panelHeight)
            .lineStyle(1, 0x9147ff, 0.5)
            .strokeRect(0, 0, 300, this.panelHeight)
            .setDepth(50);

        this.chatContainer.add(chatBackground);
    }

    setupEventListeners() {
        const { events } = this.scene;

        events.on('eat', () => this.addMessage());
        events.on('inactivityWarning', () => this.addInactivityMessage());
        events.on('inactivityPenalty', () => this.canSendMessage() && this.addInactivityMessage());
        events.on('fullStomachWarning', () => this.addAngryMessage());
        events.on('fullStomachPenalty', () => this.canSendMessage() && this.addAngryMessage());
    }

    canSendMessage() {
        const now = this.scene.time.now;
        if (now - this.lastMessageTime > this.messageCooldown) {
            this.lastMessageTime = now;
            return true;
        }
        return false;
    }

    addMessage() {
        if (!this.chatContainer) return;
        this.addSpecialMessage(
            UserGenerator.generateUsername(),
            MessageGenerator.generateMessage(),
            UserGenerator.generateUserColor()
        );
    }

    addInactivityMessage() {
        if (!this.chatContainer) return;
        const messages = MessageGenerator.getBoredMessages();
        this.addSpecialMessage(
            UserGenerator.generateUsername(),
            messages[Math.floor(Math.random() * messages.length)],
            UserGenerator.generateUserColor()
        );
    }

    addAngryMessage() {
        if (!this.chatContainer) return;
        const messages = MessageGenerator.getAngryMukbangMessages();
        this.addSpecialMessage(
            UserGenerator.generateUsername(),
            messages[Math.floor(Math.random() * messages.length)],
            UserGenerator.generateUserColor()
        );
    }

    addSpecialMessage(username, message, color) {
        if (!this.chatContainer) return;

        const messageContainer = this.scene.add.container(10, this.panelHeight);
        const usernameText = this.scene.add.text(0, 0, `${username}: `, {
            font: '16px Arial',
            fill: color,
            padding: { x: 5, y: 2 }
        }).setOrigin(0, 0);

        const messageText = this.scene.add.text(usernameText.width, 0, message, {
            font: '16px Arial',
            fill: '#FFFFFF',
            wordWrap: { width: 240 - usernameText.width },
            padding: { x: 5, y: 2 },
            lineSpacing: 4
        }).setOrigin(0, 0);

        messageContainer.add([usernameText, messageText]);
        this.chatContainer.add(messageContainer);

        const totalHeight = Math.max(usernameText.height, messageText.height) + 8;
        this.chatMessages.push({ container: messageContainer, height: totalHeight });

        messageContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: messageContainer,
            alpha: 1,
            duration: 300
        });

        this.organizeMessages();
    }

    organizeMessages() {
        let totalHeight = 0;
        let firstVisibleIndex = 0;

        for (let i = this.chatMessages.length - 1; i >= 0; i--) {
            totalHeight += this.chatMessages[i].height;
            if (totalHeight > this.panelHeight) {
                firstVisibleIndex = i + 1;
                break;
            }
        }

        if (firstVisibleIndex > 0) {
            this.chatMessages.splice(0, firstVisibleIndex).forEach(msg => msg.container.destroy());
        }

        this.repositionMessages();
    }

    repositionMessages() {
        let currentY = this.panelHeight;
        for (let i = this.chatMessages.length - 1; i >= 0; i--) {
            const msg = this.chatMessages[i];
            this.scene.tweens.add({
                targets: msg.container,
                y: currentY - msg.height,
                duration: 200,
                ease: 'Power1'
            });
            currentY -= msg.height;
        }
    }
   
    cleanup() {
        // 1. Limpiar eventos
        if (this.scene) {
            this.scene.events.off('eat');
            this.scene.events.off('inactivityWarning');
            this.scene.events.off('inactivityPenalty');
            this.scene.events.off('fullStomachWarning');
            this.scene.events.off('fullStomachPenalty');
        }

        // 2. Solo resetear las variables, Phaser se encargará de los objetos
        this.chatMessages = [];
        this.chatContainer = null;
    }
}