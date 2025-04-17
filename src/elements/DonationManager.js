class DonationManager {
    constructor(scene, subscriptionManager, moneyManager) {
        this.scene = scene;
        this.subscriptionManager = subscriptionManager;
        this.moneyManager = moneyManager;
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.notificationOffset = 0;
        
        this.setupDonationTimer();
    }

    setupDonationTimer() {
        this.donationTimer = this.scene.time.addEvent({
            delay: 1000, // Cada segundo
            loop: true,
            callback: this.checkForDonation.bind(this)
        });
    }

    checkForDonation() {
        // Solo si hay suscriptores
        if (this.subscriptionManager.subscribers === 0) return;

        // Base chance: 1-5% por suscriptor (ajustable)
        const chancePerSub = Phaser.Math.FloatBetween(0.01, 0.05);
        const totalChance = Math.min(0.5, this.subscriptionManager.subscribers * chancePerSub); // Máximo 50% de chance
        
        if (Math.random() < totalChance) {
            this.generateDonation();
        }
    }

    generateDonation() {
        // Obtener un suscriptor aleatorio (de los usados)
        const donorName = Phaser.Utils.Array.GetRandom([...this.subscriptionManager.usedNames]);
        
        // Determinar cantidad (menor chance para cantidades mayores)
        const donationRoll = Phaser.Math.Between(1, 100);
        let amount;
        
        if (donationRoll <= 5) { // 5% chance
            amount = Phaser.Math.Between(20, 25); // Donación grande
        } else if (donationRoll <= 20) { // 15% chance
            amount = Phaser.Math.Between(15, 19); // Donación mediana
        } else { // 80% chance
            amount = Phaser.Math.Between(5, 14); // Donación pequeña
        }

        // Añadir dinero
        this.moneyManager.addMoney(amount);
        
        // Mostrar notificación
        this.queueDonationNotification(donorName, amount);
    }

    queueDonationNotification(name, amount) {
        this.notificationQueue.push({name, amount});
        this.processNotificationQueue();
    }

    processNotificationQueue() {
        if (!this.isShowingNotification && this.notificationQueue.length > 0) {
            this.isShowingNotification = true;
            const {name, amount} = this.notificationQueue.shift();
            this.showDonationNotification(name, amount);
        }
    }

    showDonationNotification(name, amount) {
        const width = 300;
        const height = 60;
        const startX = this.scene.cameras.main.width / 2;  // Centrado horizontalmente
        const startY = -height; // Desde arriba
    
        // Mensajes personalizados según la cantidad
        let message;
        if (amount >= 20) {
            message = `${name} is insanely generous!\nDonated $${amount}!`;
        } else if (amount >= 15) {
            message = `${name} is making it rain!\nSent $${amount}!`;
        } else if (amount >= 10) {
            message = `${name} shows some love!\n$${amount} donated!`;
        } else if (amount >= 7) {
            message = `${name} tipped $${amount}!\nThanks for the support!`;
        } else {
            message = `${name} dropped $${amount}!\nEvery bit helps!`;
        }
    
        // Fondo con gradiente
        const background = this.scene.add.graphics()
            .fillGradientStyle(0x9147ff, 0x5e2d9c, 0x5e2d9c, 0x9147ff, 1)
            .fillRoundedRect(-width / 2, -height / 2, width, height, 10)
            .lineStyle(2, 0xffffff)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    
        // Texto con el mensaje personalizado
        const text = this.scene.add.text(0, -10, message, {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    
        // Icono de corazón
        const heart = this.scene.add.text(-width / 2 + 20, -10, '❤', {
            font: '24px Arial',
            fill: '#ff5555'
        }).setOrigin(0.5);
    
        // Crear contenedor
        const notification = this.scene.add.container(startX, startY, [background, text, heart])
            .setDepth(100);
    
        this.notificationOffset += 70;
    
        // Animación de caída desde arriba hacia posición izquierda
        this.scene.tweens.add({
            targets: notification,
            y: this.notificationOffset + 25,
            x: width / 2 + 55,  // Lado izquierdo
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
                // Temporizador para desaparecer
                this.scene.time.delayedCall(4000, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        alpha: 0,
                        y: notification.y - 50,
                        duration: 800,
                        onComplete: () => {
                            notification.destroy();
                            this.notificationOffset -= 70;
                            this.isShowingNotification = false;
                            this.processNotificationQueue();
                        }
                    });
                });
            }
        });
    }
    

    cleanup() {
        if (this.donationTimer) this.donationTimer.destroy();
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.notificationOffset = 0;
    }
}