
class SimpleChatSystem {
    constructor(scene) {
        this.scene = scene;
        this.chatMessages = [];
        this.maxMessages = 15;
        this.chatContainer = null;
        this.lineHeight = 32;
        this.panelHeight = 500; // Altura fija del panel de chat
        
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
            .fillStyle(0x000000, 0.7)
            .fillRect(0, 0, 260, this.panelHeight)
            .lineStyle(1, 0x9147ff, 0.5)
            .strokeRect(0, 0, 260, this.panelHeight);
        
        this.chatContainer.add(chatBackground);
    }

    setupEventListeners() {
        this.scene.events.on('eat', () => {
            this.addMessage();
        });
    }

    addMessage() {
        if (!this.chatContainer) return;
        this.addSpecialMessage(
            this.generateUsername(),
            this.generateMessage(),
            this.generateUserColor()
        );
    }
    
    addSpecialMessage(username, message, color) {
        if (!this.chatContainer) return;
        
        // Crear un contenedor para agrupar el nombre y el mensaje
        const messageContainer = this.scene.add.container(10, this.panelHeight);
        this.chatContainer.add(messageContainer);
        
        // Texto del nombre de usuario (con color)
        const usernameText = this.scene.add.text(
            0,
            0,
            `${username}: `,
            {
                font: '16px Arial',
                fill: color,
                padding: { x: 5, y: 2 }
            }
        ).setOrigin(0, 0);
        
        // Texto del mensaje (en blanco)
        const messageText = this.scene.add.text(
            usernameText.width,
            0,
            message,
            {
                font: '16px Arial',
                fill: '#FFFFFF',
                wordWrap: { width: 240 - usernameText.width },
                padding: { x: 5, y: 2 },
                lineSpacing: 4
            }
        ).setOrigin(0, 0);
        
        messageContainer.add([usernameText, messageText]);
        
        // Calcular altura total del mensaje
        const totalHeight = Math.max(usernameText.height, messageText.height) + 8;
        
        // Añadir el nuevo mensaje
        this.chatMessages.push({
            container: messageContainer,
            height: totalHeight
        });
        
        // Animación de aparición
        messageContainer.setAlpha(0);
        this.scene.tweens.add({
            targets: messageContainer,
            alpha: 1,
            duration: 300
        });
        
        // Reposicionar y recortar mensajes si es necesario
        this.organizeMessages();
    }

    organizeMessages() {
        let totalHeight = 0;
        let firstVisibleIndex = 0;
        
        // Calcular cuántos mensajes caben (empezando por los más nuevos)
        for (let i = this.chatMessages.length - 1; i >= 0; i--) {
            totalHeight += this.chatMessages[i].height;
            
            if (totalHeight > this.panelHeight) {
                firstVisibleIndex = i + 1;
                break;
            }
        }
        
        // Eliminar mensajes que ya no caben
        if (firstVisibleIndex > 0) {
            for (let i = 0; i < firstVisibleIndex; i++) {
                this.chatMessages[i].container.destroy();
            }
            this.chatMessages = this.chatMessages.slice(firstVisibleIndex);
        }
        
        // Reposicionar todos los mensajes visibles
        this.repositionMessages();
    }

    repositionMessages() {
        let currentY = this.panelHeight; // Comenzar desde abajo
        
        // Posicionar todos los mensajes de abajo hacia arriba
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

    generateUsername() {
        return [
            "xXGamer99", "TTV_Eater", "MrFoodie", "DrChomp", "Sawkhe", "RonLimonMon", "Milk_ai",
            "KingNom", "QueenHungry", "ProSnack", "LilMunch",
            "HungryAF", "FoodDestroyer", "SnackKing", "MukbangLover"
        ][Math.floor(Math.random() * 12)];
    }
    
    generateUserColor() {
        const usernameColors = [
            '#FF0000', '#0000FF', '#008000', '#B22222', 
            '#FF7F50', '#9ACD32', '#FF4500', '#2E8B57',
            '#DAA520', '#D2691E', '#5F9EA0', '#1E90FF'
        ];
        return usernameColors[Math.floor(Math.random() * usernameColors.length)];
    }
    
    generateMessage() {
        const emotes = ['PogChamp', 'KEKW', 'LUL', 'MonkaS', 'Kappa', 'PepeLaugh', 'FeelsBadMan'];
        const emote = emotes[Math.floor(Math.random() * emotes.length)];
        
        const messages = [
            `OMG that looks delicious! ${emote}`,
            `How can you eat so much?? ${emote}`,
            `${emote} ${emote} ${emote}`,
            `That's a big bite!`,
            `Don't choke! MonkaS`,
            `Yummy yummy! ${emote}`,
            `I could never eat that much`,
            `Bruh that's insane LUL`,
            `That's some next level eating`,
            `How many calories is that?`,
            `I'm getting full just watching ${emote}`,
            `That crunch tho!`,
            `No way he finishes that`,
            `Absolute madlad ${emote}`,
            `This is my dinner show`,
            `I can't look away`,
            `That sauce looks spicy!`,
            `My stomach hurts watching this`
        ];
        
        return messages[Math.floor(Math.random() * messages.length)];
    }
}