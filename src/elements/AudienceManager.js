class AudienceManager {
    constructor(scene, initialRating = 100, initialGoal = 1000) {
        this.scene = scene;
        this.rating = initialRating;
        this.goal = initialGoal;
        this.goals = [1000, 2500, 5000, 10000];
        this.peakViewers = initialRating;
        this.init();
    }

    init() {
        this.panel = this.scene.add.graphics().setDepth(9);
        this.goalText = this.scene.add.text(0, 0, this.getGoalText(), {
            font: 'bold 24px Arial',
            fill: '#ffffff',
            align: 'left'
        }).setDepth(10);

        this.icon = this.scene.add.text(0, 0, '👥', {
            font: '26px Arial'
        }).setDepth(10);

        this.updatePanelLayout();
        this.startAudienceDecay();
    }

    updatePanelLayout() {
        const paddingX = 20;
        const paddingY = 10;

        const textBounds = this.goalText.getBounds();
        const width = textBounds.width + 60;
        const height = textBounds.height + paddingY * 2;
        const x = this.scene.cameras.main.centerX - width / 2;
        const y = 20;

        this.panel.clear();
        this.panel.fillStyle(0x9147ff, 0.8);
        this.panel.fillRoundedRect(x, y, width, height, 12);
        this.panel.lineStyle(2, 0xffffff, 0.3);
        this.panel.strokeRoundedRect(x, y, width, height, 12);

        this.icon.setPosition(x + 15, y + paddingY);
        this.goalText.setPosition(this.icon.x + 35, y + paddingY);
    }

    startAudienceDecay() {
        this.audienceTimer = this.scene.time.addEvent({
            delay: 5000,
            loop: true,
            callback: () => {
                if (!this.scene.isGameOver) {
                    const loss = Math.max(1, Math.floor(this.rating * 0.05));
                    if (this.changeRating(-loss)) this.scene.triggerGameEnd('audience');
                }
            }
        });
    }

    changeRating(amount) {
        this.rating = Math.max(0, this.rating + amount);
        this.goalText.setText(this.getGoalText());
        this.updatePanelLayout();

        if (this.rating > this.peakViewers) this.peakViewers = this.rating;
        if (amount > 0 && this.scene.subscriptionManager) {
            this.scene.subscriptionManager.checkForNewSubscriber(this.rating - amount, this.rating);
        }

        if (this.rating >= this.goal) this.updateGoal();

        if (amount > 0) {
            this.scene.tweens.add({
                targets: [this.goalText, this.icon],
                scale: 1.1,
                duration: 150,
                yoyo: true
            });
        }

        return this.rating <= 0;
    }

    updateGoal() {
        for (let newGoal of this.goals) {
            if (this.rating < newGoal) {
                this.showGoalReachedEffect(this.goal, newGoal);
                this.goal = newGoal;
                break;
            }
        }
    }

    showGoalReachedEffect(oldGoal, newGoal) {
        const y = this.goalText.getBounds().bottom + 10;
        const msg = `🎯 Goal of ${oldGoal} reached!\nNew goal: ${newGoal}`;
        const congratsText = this.scene.add.text(
            this.scene.cameras.main.centerX, y, msg, {
                font: 'bold 24px Arial',
                fill: '#ffffff',
                align: 'center',
                backgroundColor: '#9147ff',
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
        this.goalText.setText(this.getGoalText());
        this.updatePanelLayout();
    }

    getGoalText() {
        return `${this.rating} / ${this.goal}`;
    }

    cleanup() {
        this.goalText?.destroy();
        this.icon?.destroy();
        this.panel?.destroy();
        this.audienceTimer?.destroy();
    }
}