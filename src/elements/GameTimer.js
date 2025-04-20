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
        // Crear el texto del timer
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

        // Crear área interactiva solo para el emoji rojo
        const textBounds = this.liveText.getBounds();
        const emojiWidth = 24; // Ancho aproximado del emoji
        
        this.liveButton = this.scene.add.zone(
            textBounds.right - emojiWidth - 15, // Posición X (ajustada para el emoji)
            textBounds.top + textBounds.height/2, // Posición Y (centro vertical)
            emojiWidth,
            textBounds.height
        )
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            if (!this.scene.isGameOver) {
                this.scene.triggerGameEnd('manual');
            }
        });
        
        // Efecto hover
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
        this.isRunning = true;
        this.timeUpTriggered = false;
        this.updateTimer();
    }

    updateTimer() {
        if (!this.isRunning) return;

        this.elapsedTime = this.scene.time.now - this.startTime;
        const remaining = Math.max(0, this.duration - this.elapsedTime);

        // Actualizar texto manteniendo el formato LIVE
        this.liveText.setText(`🔴 LIVE ${this.formatTime(remaining)}`);

        // Cambiar color cuando quedan 30 segundos
        if (remaining <= 30000 && remaining > 0) {
            this.liveText.setStyle({ fill: '#ff9c4a' });
        }

        if (remaining <= 0 && !this.timeUpTriggered) {
            this.timeUp();
        } else {
            this.scene.time.delayedCall(1000, () => this.updateTimer(), [], this);
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
