class AudienceManager {
    constructor(scene, initialRating = 100, initialGoal = 1000) {
        this.scene = scene;
        this.rating = initialRating;
        this.goal = initialGoal;
        this.goals = [1000, 2500, 5000, 10000];
        this.init();
        this.peakViewers = initialRating; 
    }

    init() {
        // Solo mostramos el texto de la meta en el centro
        this.goalText = this.createText(
            this.scene.cameras.main.centerX, 
            20, 
            `Meta: ${this.rating}/${this.goal}`, 
            '#9147ff', 
            0.5
        );
        
        this.setupAudienceTimer();
    }

    createText(x, y, text, bgColor, originX = 0.5) {
        return this.scene.add.text(x, y, text, {
            font: '24px Arial',
            fill: '#ffffff',
            backgroundColor: bgColor,
            padding: { x: 15, y: 5 }
        })
        .setOrigin(originX, 0)
        .setDepth(10);
    }

    setupAudienceTimer() {
        this.audienceTimer = this.scene.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                if (!this.scene.isGameOver) {
                    const lostAudience = Math.max(1, Math.floor(this.rating * 0.05));
                    if (this.changeRating(-lostAudience)) this.scene.triggerGameEnd('audience');
                }
            }
        });
    }

    changeRating(amount) {
        this.rating = Math.max(0, this.rating + amount);

        // Actualizamos el texto de la meta
        this.goalText.setText(`Meta: ${this.rating}/${this.goal}`);
        if (this.rating > this.peakViewers) {
            this.peakViewers = this.rating;
        }

        if (amount > 0 && this.scene.subscriptionManager) {
            this.scene.subscriptionManager.checkForNewSubscriber(this.rating - amount, this.rating);
        }

        if (this.rating >= this.goal) {
            this.updateGoal();
        }

        return this.rating <= 0;
    }

    updateGoal() {
        for (let goal of this.goals) {
            if (this.rating < goal) {
                this.showGoalReachedEffect(this.goal, goal);
                this.goal = goal;
                break;
            }
        }
    }

    showGoalReachedEffect(oldGoal, newGoal) {
        const yPosition = this.goalText.getBounds().bottom + 10;
        
        const congratsText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            yPosition,
            `¡Meta de ${oldGoal} alcanzada!\nNueva meta: ${newGoal}`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#9147ff',
                align: 'center',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5, 0).setDepth(20);

        // Animación de la notificación
        this.scene.tweens.add({
            targets: congratsText,
            alpha: 0,
            duration: 1000,
            delay: 1500,
            onComplete: () => congratsText.destroy()
        });

        // Efecto visual
        this.scene.cameras.main.flash(300, 145, 71, 255);
        
        // Actualizamos el texto de la meta inmediatamente
        this.goalText.setText(`Meta: ${this.rating}/${this.goal}`);
    }

    cleanup() {
        if (this.goalText) this.goalText.destroy();
        if (this.audienceTimer) this.audienceTimer.destroy();
    }
}