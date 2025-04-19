class GameTimer {
    constructor(scene, durationInMinutes) {
        this.scene = scene;
        this.duration = durationInMinutes * 60 * 1000; // Convertir a milisegundos
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.timerText = null;
        
        this.createTimerDisplay();
    }

    createTimerDisplay() {
        this.timerText = this.scene.add.text(
            this.scene.cameras.main.width - 120,
            20,
            '00:00',
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }
        ).setOrigin(0.5, 0)
         .setDepth(50);
    }

    start() {
        this.startTime = this.scene.time.now;
        this.isRunning = true;
        this.updateTimer();
    }

    updateTimer() {
        if (!this.isRunning) return;
        
        this.elapsedTime = this.scene.time.now - this.startTime;
        const remainingTime = Math.max(0, this.duration - this.elapsedTime);
        
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        
        this.timerText.setText(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        
        if (remainingTime <= 0) {
            this.timeUp();
        } else {
            this.scene.time.delayedCall(1000, () => this.updateTimer(), [], this);
        }
    }

    timeUp() {
        this.isRunning = false;
        this.scene.triggerGameEnd('time');
    }

    getFormattedTime() {
        const totalSeconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    cleanup() {
        if (this.timerText) {
            this.timerText.destroy();
        }
    }
}