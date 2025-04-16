class AudienceManager {
    constructor(scene, initialRating = 100, initialGoal = 1000) {
        this.scene = scene;
        this.rating = this.displayRating = initialRating;
        this.goal = initialGoal;
        this.goals = [1000, 2500, 5000, 10000];
        this.animating = false;
        this.init();
    }

    init() {
        this.viewersText = this.createText(this.scene.cameras.main.width - 20, 20, `${this.rating} viewers`, '#000000');
        this.goalText = this.createText(this.scene.cameras.main.centerX, 20, `Meta: ${this.rating}/${this.goal}`, '#9147ff', 0.5);
        this.setupAudienceTimer();
    }

    createText(x, y, text, bgColor, originX = 1) {
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
                    if (this.changeRating(-lostAudience)) this.scene.triggerGameOver('audience');
                }
            }
        });
    }

    changeRating(amount) {
        const oldRating = this.rating;
        this.rating = Math.max(0, this.rating + amount);

        if (amount > 0 && this.scene.subscriptionManager)
            this.scene.subscriptionManager.checkForNewSubscriber(oldRating, this.rating);

        if (!this.animating) this.animateRatingChange();
        if (this.rating >= this.goal) this.updateGoal();

        return this.rating <= 0;
    }

    animateRatingChange() {
        this.animating = true;
        const start = this.displayRating;
        const end = this.rating;
        const duration = Math.min(800, Math.abs(end - start) * 15);

        this.scene.tweens.add({
            targets: this,
            displayRating: end,
            duration,
            ease: 'Power1',
            onUpdate: () => {
                const current = Math.floor(this.displayRating);
                this.viewersText.setText(`${current} viewers`);
                this.goalText.setText(`Meta: ${current}/${this.goal}`);
                this.viewersText.setColor(this.displayRating < start ? '#ff5555' : '#55ff55');
            },
            onComplete: () => {
                this.viewersText.setColor('#ffffff');
                this.animating = false;
            }
        });
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
        const yPosition = this.goalText.getBounds().bottom - 40;
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

        this.scene.tweens.add({
            targets: congratsText,
            alpha: 0,
            duration: 1000,
            delay: 1500,
            onComplete: () => congratsText.destroy()
        });

        this.scene.cameras.main.flash(300, 145, 71, 255);
    }

    cleanup() {
        [this.viewersText, this.goalText, this.audienceTimer].forEach(obj => obj && obj.destroy());
    }
}