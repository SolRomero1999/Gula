class SubscriptionManager {
    constructor(scene, audienceManager, moneyManager) {
        this.scene = scene;
        this.audienceManager = audienceManager;
        this.moneyManager = moneyManager;
        this.subscribers = 0;
        this.subscriberNames = this.generateSubscriberNames();
        this.usedNames = new Set();
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.notificationOffset = 0;
        this.totalSubscriptions = 0; 
    }
    

    generateSubscriberNames() {
        const names = [];
        for (let i = 0; i < 100; i++) {  
            names.push(UserGenerator.generateUsername());
        }
        return names;
    }

    checkForNewSubscriber(oldRating, newRating) {
        const increments = Math.floor(newRating / 100) - Math.floor(oldRating / 100);
        
        if (increments > 0) {
            for (let i = 0; i < increments; i++) {
                if (Phaser.Math.Between(1, 100) <= 25) {
                    this.addSubscriber();
                }
            }
        }
    }

    addSubscriber() {
        if (this.subscriberNames.length === 0) {
            console.log("No hay más nombres de usuarios disponibles para suscripción.");
            return; 
        }

        let availableNames = this.subscriberNames.filter(name => !this.usedNames.has(name));
        
        if (availableNames.length === 0) {
            console.log("Todos los nombres de usuarios ya han sido usados.");
            return;
        }

        let randomName = Phaser.Utils.Array.GetRandom(availableNames);
        
        this.usedNames.add(randomName);
        this.subscribers++;
        
        this.queueSubscriberNotification(randomName);
        this.moneyManager.addMoney(50); 
        this.totalSubscriptions++; 
    }

    queueSubscriberNotification(name) {
        this.notificationQueue.push(name);
        this.processNotificationQueue();
    }

    processNotificationQueue() {
        if (!this.isShowingNotification && this.notificationQueue.length > 0) {
            this.isShowingNotification = true;
            const name = this.notificationQueue.shift();
            this.showSubscriberNotification(name);
        }
    }

    showSubscriberNotification(name) {
        const width = 250;
        const height = 40;

        const startX = this.scene.cameras.main.width + 20;
        const startY = this.notificationOffset + 80;

        const background = this.scene.add.rectangle(0, 0, width, height, 0x9147ff)
            .setStrokeStyle(2, 0x000000);

        const text = this.scene.add.text(0, 0, `★ ${name} subscribed! ★`, {
            font: '20px Arial',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: width - 20 }
        }).setOrigin(0.5);

        const notification = this.scene.add.container(startX, startY, [background, text])
            .setDepth(100);

        this.notificationOffset += 50;

        this.scene.tweens.add({
            targets: notification,
            x: this.scene.cameras.main.width - width + 115, 
            duration: 300,
            ease: 'Back.out',
            onComplete: () => {
                this.scene.time.delayedCall(3000, () => {
                    this.scene.tweens.add({
                        targets: notification,
                        alpha: 0,
                        x: notification.x + 20,
                        duration: 500,
                        onComplete: () => {
                            notification.destroy();
                            this.notificationOffset -= 50;
                            this.isShowingNotification = false;
                            this.processNotificationQueue();
                        }
                    });
                });
            }
        });
    }

    cleanup() {
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.notificationOffset = 0;
    }
}