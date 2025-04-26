class GameTimer {
    constructor(scene, durationInMinutes) {
        this.scene = scene;
        this.duration = durationInMinutes * 60000;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.isRunning = false;
        this.timeUpTriggered = false;

        this.createLiveDisplay();
    }

    createLiveDisplay() {
        this.liveText = this.scene.add.text(
            this.scene.cameras.main.width - 30, 20,
            '🔴 LIVE 00:00', {
                font: 'bold 26px Arial',
                fill: '#ffffff',
                backgroundColor: '#1e1e1e',
                padding: { x: 15, y: 8 },
                shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
            }
        )
        .setOrigin(1, 0)
        .setDepth(50);

        const textBounds = this.liveText.getBounds();

        this.liveButton = this.scene.add.zone(
            textBounds.centerX,
            textBounds.centerY,
            textBounds.width,
            textBounds.height
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.scene.triggerGameEnd('manual');
            }
        });

        this.liveButton.on('pointerover', () => {
            if (!this.scene.isGameOver) {
                this.liveText.setStyle({ fill: '#ff5555' });
            }
        });

        this.liveButton.on('pointerout', () => {
            if (!this.scene.isGameOver) {
                this.liveText.setStyle({ fill: '#ffffff' });
            }
        });
    }

    start() {
        this.startTime = this.scene.time.now;
        this.elapsedTime = 0;
        this.isRunning = true;
        this.timeUpTriggered = false;
        this.updateTimer();
    }

    updateTimer() {
        if (!this.isRunning) return;

        this.elapsedTime = this.scene.time.now - this.startTime;
        const remaining = Math.max(0, this.duration - this.elapsedTime);

        this.liveText.setText(`🔴 LIVE ${this.formatTime(remaining)}`);

        const bounds = this.liveText.getBounds();
        this.liveButton.setPosition(bounds.centerX, bounds.centerY);
        this.liveButton.setSize(bounds.width, bounds.height);

        if (remaining <= 30000 && remaining > 0) {
            this.liveText.setStyle({ fill: '#ff9c4a' });
        }

        if (remaining <= 0 && !this.timeUpTriggered) {
            this.timeUp();
        } else {
            const nextUpdate = 1000 - (this.elapsedTime % 1000);
            this.scene.time.delayedCall(nextUpdate, () => this.updateTimer(), [], this);
        }
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    timeUp() {
        this.timeUpTriggered = true;
        this.isRunning = false;
        this.liveText.setStyle({ fill: '#ff4a4a' });
        this.scene.triggerGameEnd?.('time');
    }

    getFormattedTime() {
        return this.formatTime(this.elapsedTime);
    }

    cleanup() {
        this.liveText?.destroy();
        this.liveButton?.destroy();
    }
}