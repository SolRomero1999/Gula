class SimpleChatSystem {
    constructor(scene) {
        this.scene = scene;
        this.chatMessages = [];
        this.maxMessages = 15;
        this.chatContainer = null;
        this.lineHeight = 32; // Aumenté el espaciado entre líneas
        
        this.scene.events.once('create', () => {
            this.setupChat();
            this.setupEventListeners();
        });
    }

    setupChat() {
        if (!this.scene.cameras || !this.scene.cameras.main) {
            console.error('Cameras system not available');
            return;
        }
        
        const chatX = this.scene.cameras.main.width - 270;
        const chatY = 70;
        
        this.chatContainer = this.scene.add.container(chatX, chatY);
        
        const chatBackground = this.scene.add.graphics()
            .fillStyle(0x000000, 0.6)
            .fillRoundedRect(0, 0, 260, 500, 8)
            .lineStyle(1, 0x9147ff, 1)
            .strokeRoundedRect(0, 0, 260, 500, 8);
        
        this.chatContainer.add(chatBackground);
    }

    setupEventListeners() {
        this.scene.events.on('eat', () => {
            this.addMessage();
        });
    }

    addMessage() {
        if (!this.chatContainer) return;
        
        // Limpiar mensaje más viejo si llegamos al límite
        if (this.chatMessages.length >= this.maxMessages) {
            const oldMessage = this.chatMessages.shift();
            oldMessage.destroy();
            
            // Reorganizar todos los mensajes restantes
            this.repositionMessages();
        }
        
        // Crear nuevo mensaje
        const messageText = this.scene.add.text(
            10, // margen izquierdo
            490, // posición Y inicial (parte inferior)
            this.getRandomMessage(),
            {
                font: '16px Arial',
                fill: '#ffffff',
                wordWrap: { width: 240 }, // Reduje un poco para margen derecho
                padding: { x: 5, y: 2 }, // Pequeño padding interno
                lineSpacing: 4 // Espacio entre líneas si el mensaje se divide
            }
        ).setOrigin(0, 1); // Anclaje inferior izquierdo
        
        this.chatContainer.add(messageText);
        this.chatMessages.push(messageText);
        
        // Animación de aparición
        messageText.setAlpha(0);
        this.scene.tweens.add({
            targets: messageText,
            alpha: 1,
            duration: 300
        });
        
        // Reorganizar todos los mensajes
        this.repositionMessages();
    }

    repositionMessages() {
        // Calcular posición Y para cada mensaje
        let currentY = 490; // Comenzar desde abajo
        
        // Recorrer en orden inverso (los más nuevos primero)
        for (let i = this.chatMessages.length - 1; i >= 0; i--) {
            const msg = this.chatMessages[i];
            
            // Calcular altura real del mensaje (considerando múltiples líneas)
            const msgHeight = Math.max(
                this.lineHeight, 
                msg.height + 8 // Margen adicional para mensajes multilínea
            );
            
            // Posicionar el mensaje
            this.scene.tweens.add({
                targets: msg,
                y: currentY,
                duration: 200,
                ease: 'Power1'
            });
            
            // Actualizar posición Y para el siguiente mensaje
            currentY -= msgHeight;
        }
    }

    getRandomMessage() {
        const messages = [
            "OMG that looks delicious!",
            "How can you eat so much??",
            "PogChamp",
            "KEKW",
            "That's a big bite!",
            "MonkaS don't choke!",
            "Yummy yummy!",
            "I could never eat that much",
            "Bruh that's insane",
            "LUL",
            "That's some next level eating",
            "How many calories is that?",
            "I'm getting full just watching",
            "That crunch tho!",
            "No way he finishes that",
            "Absolute madlad",
            "This is my dinner show",
            "I can't look away",
            "That sauce looks spicy!",
            "My stomach hurts watching this"
        ];
        
        const username = [
            "xXGamer99", "TTV_Eater", "MrFoodie", "DrChomp", 
            "KingNom", "QueenHungry", "ProSnack", "LilMunch",
            "HungryAF", "FoodDestroyer", "SnackKing", "MukbangLover"
        ][Math.floor(Math.random() * 12)];
        
        return `${username}: ${messages[Math.floor(Math.random() * messages.length)]}`;
    }
}