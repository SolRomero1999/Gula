class DonationManager {
    constructor(scene, subscriptionManager, moneyManager) {
        this.totalDonations = 0; 
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
            delay: 1000, 
            loop: true,
            callback: this.checkForDonation.bind(this)
        });
    }

    checkForDonation() {
        if (this.subscriptionManager.subscribers === 0) return;

        const chancePerSub = Phaser.Math.FloatBetween(0.01, 0.05);
        const totalChance = Math.min(0.5, this.subscriptionManager.subscribers * chancePerSub); 
        
        if (Math.random() < totalChance) {
            this.generateDonation();
        }
    }

    generateDonation() {
        this.scene.sound.play('alerta');
        const donorName = Phaser.Utils.Array.GetRandom([...this.subscriptionManager.usedNames]);

        const donationRoll = Phaser.Math.Between(1, 100);
        let amount;
        
        if (donationRoll <= 5) { 
            amount = Phaser.Math.Between(20, 25); 
        } else if (donationRoll <= 20) { 
            amount = Phaser.Math.Between(15, 19); 
        } else { 
            amount = Phaser.Math.Between(5, 14);
        }

        this.moneyManager.addMoney(amount);

        this.queueDonationNotification(donorName, amount);
        this.totalDonations += amount;
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
        const startX = this.scene.cameras.main.width / 2;  
        const startY = -height; 
    
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
    
        const background = this.scene.add.graphics()
            .fillGradientStyle(0x9147ff, 0x5e2d9c, 0x5e2d9c, 0x9147ff, 1)
            .fillRoundedRect(-width / 2, -height / 2, width, height, 10)
            .lineStyle(2, 0xffffff)
            .strokeRoundedRect(-width / 2, -height / 2, width, height, 10);

        const text = this.scene.add.text(0, -10, message, {
            font: '18px Arial',
            fill: '#ffffff',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
    
        const heart = this.scene.add.text(-width / 2 + 20, -10, '❤', {
            font: '24px Arial',
            fill: '#ff5555'
        }).setOrigin(0.5);
    
        const notification = this.scene.add.container(startX, startY, [background, text, heart])
            .setDepth(100);
    
        this.notificationOffset += 70;
    
        this.scene.tweens.add({
            targets: notification,
            y: this.notificationOffset + 25,
            x: width / 2 + 55,  
            duration: 500,
            ease: 'Back.out',
            onComplete: () => {
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