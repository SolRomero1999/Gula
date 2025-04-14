class ChatSystem {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.x = options.x || 600;
        this.y = options.y || 50;
        this.width = options.width || 180;
        this.height = options.height || 500;
        this.maxMessages = options.maxMessages || 20;
        this.messageSpeed = options.messageSpeed || 1.5;
        this.messages = [];
        this.activeMessages = [];
        this.isVisible = true;
        this.messageQueue = [];
        this.lastMessageTime = 0;

        // Configuración visual
        this.style = {
            background: 0x000000,
            backgroundAlpha: 0.7,
            textColor: '#ffffff',
            textFont: '16px Arial',
            usernameColors: ['#FF4500', '#00B5FF', '#1EFF00', '#FFD700', '#FF69B4'],
            messagePadding: 5,
            lineHeight: 20
        };

        // Elementos del chat
        this.chatBackground = null;
        this.messageTexts = [];

        this.initializeChat();
        this.loadTwitchLikeMessages();
    }

    initializeChat() {
        // Crear fondo del chat
        this.chatBackground = this.scene.add.graphics()
            .fillStyle(this.style.background, this.style.backgroundAlpha)
            .fillRect(this.x, this.y, this.width, this.height)
            .setDepth(10);

        // Crear pool de mensajes
        for (let i = 0; i < this.maxMessages; i++) {
            const text = this.scene.add.text(
                this.x + this.style.messagePadding,
                this.y + this.height - ((i + 1) * this.style.lineHeight),
                '',
                {
                    font: this.style.textFont,
                    fill: this.style.textColor,
                    wordWrap: { width: this.width - (2 * this.style.messagePadding) }
                }
            )
            .setDepth(11)
            .setVisible(false);
            
            this.messageTexts.push(text);
        }

        // Temporizador para mensajes
        this.scene.time.addEvent({
            delay: 1000 / this.messageSpeed,
            callback: this.processMessageQueue,
            callbackScope: this,
            loop: true
        });
    }

    loadTwitchLikeMessages() {
        this.possibleMessages = [
            "PogChamp! That bite was huge!",
            "LUL he's gonna explode!",
            "OMG MonkaS",
            "Kappa Keep eating!",
            "BibleThump so delicious",
            "PepeLaugh he can't stop",
            "DansGame unhealthy!",
            "EleGiggle food coma incoming",
            "Wow! That's a big bite!",
            "HYPERS NOM NOM NOM",
            "NotLikeThis don't choke!",
            "FeelsGoodMan tasty stream",
            "4Head eating champion",
            "Jebaited thought he was full",
            "SourPls more food!",
            "VoHiYo mukbang time!",
            "HeyGuys welcome to eating stream",
            "CoolStoryBob tell us about the food",
            "SeemsGood perfect bite",
            "MingLee disgusting but fun"
        ];

        this.randomUsers = [
            "xXProGamerXx", "TwitchViewer123", "GameFan22", "StreamLover", 
            "ChatEnjoyer", "PogChampFan", "KappaKing", "LULMaster"
        ];
    }

    addMessage(message) {
        this.messageQueue.push(message);
    }

    processMessageQueue() {
        if (this.messageQueue.length === 0 || !this.isVisible) return;

        const message = this.messageQueue.shift();
        this.displayMessage(message);
    }

    displayMessage(message) {
        // Mover todos los mensajes hacia arriba
        this.messageTexts.forEach(text => {
            if (text.visible) {
                text.y -= this.style.lineHeight;
                
                // Ocultar mensajes que salgan del chat
                if (text.y < this.y) {
                    text.setVisible(false);
                }
            }
        });

        // Encontrar primer mensaje disponible
        const availableText = this.messageTexts.find(text => !text.visible);
        if (!availableText) return;

        // Configurar nuevo mensaje
        const username = Phaser.Utils.Array.GetRandom(this.randomUsers);
        const usernameColor = Phaser.Utils.Array.GetRandom(this.style.usernameColors);
        
        availableText.setText([
            { text: username + ": ", color: usernameColor },
            { text: message, color: this.style.textColor }
        ]);
        
        availableText.setPosition(
            this.x + this.style.messagePadding,
            this.y + this.height - this.style.lineHeight
        );
        availableText.setVisible(true);
    }

    generateChatReaction() {
        const messageCount = Phaser.Math.Between(1, 3);
        for (let i = 0; i < messageCount; i++) {
            const randomMessage = Phaser.Utils.Array.GetRandom(this.possibleMessages);
            this.addMessage(randomMessage);
        }
    }

    destroy() {
        this.chatBackground.destroy();
        this.messageTexts.forEach(text => text.destroy());
        this.messageTexts = [];
    }
}