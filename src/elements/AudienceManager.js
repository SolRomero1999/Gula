class AudienceManager {
    constructor(scene, initialRating = 100, initialGoal = 1000) {
        this.scene = scene;
        this.rating = initialRating;
        this.displayRating = initialRating;
        this.goal = initialGoal;
        this.goals = [1000, 2500, 5000, 10000];
        this.animating = false;
        
        // Crear elementos visuales
        this.createViewersCounter();
        this.createGoalDisplay();
    }

    createViewersCounter() {
        this.viewersText = this.scene.add.text(
            this.scene.cameras.main.width - 20,
            20,
            `${this.rating} viewers`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 5 }
            }
        )
        .setOrigin(1, 0)
        .setDepth(10);
    }

    createGoalDisplay() {
        this.goalText = this.scene.add.text(
            this.scene.cameras.main.centerX,
            20,
            `Meta: ${this.rating}/${this.goal}`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#9147ff',
                padding: { x: 15, y: 5 }
            }
        )
        .setOrigin(0.5, 0)
        .setDepth(10);
    }

    changeRating(amount) {
        this.rating = Math.max(0, this.rating + amount);
        
        if (!this.animating) {
            this.animateRatingChange();
        }
        
        if (this.rating >= this.goal) {
            this.updateGoal();
        }
        
        return this.rating <= 0;
    }

    animateRatingChange() {
        this.animating = true;
        const startValue = this.displayRating;
        const change = this.rating - startValue;
        const duration = Math.min(800, Math.abs(change) * 15);
        
        this.scene.tweens.add({
            targets: this,
            displayRating: this.rating,
            duration: duration,
            ease: 'Power1',
            onUpdate: () => {
                this.viewersText.setText(`${Math.floor(this.displayRating)} viewers`);
                this.goalText.setText(`Meta: ${Math.floor(this.displayRating)}/${this.goal}`);
                
                if (this.displayRating < startValue) {
                    this.viewersText.setColor('#ff5555');
                } else {
                    this.viewersText.setColor('#55ff55');
                }
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
        // Posición relativa al goalText existente
        const goalTextBounds = this.goalText.getBounds();
        const yPosition = goalTextBounds.bottom - 40;
        
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
        )
        .setOrigin(0.5, 0)
        .setDepth(20);
        
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
        if (this.viewersText) this.viewersText.destroy();
        if (this.goalText) this.goalText.destroy();
    }
}