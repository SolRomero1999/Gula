class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.storageKey = 'streamerStats';
        this.bestStats = {
            streamTime: 0, // En segundos
            peakViewers: 0,
            subscribers: 0,
            totalDonations: 0,
            totalEarnings: 0,
            foodConsumed: 0
        };
    }

    preload() {
        this.load.image('background', '../assets/background.png');
        this.load.image('star', '../assets/star.png');
    }

    init(data) {
        this.endType = data.stats?.endType || 'time';
        this.currentStats = data.stats || this.getDefaultStats();
        this.currentStats.streamTimeSec = this.timeToSeconds(this.currentStats.streamTime);
        this.loadBestStats();
        this.updateRecords();
    }

    create() {
        // Fondo más vibrante
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(0);
        
        // Overlay menos oscuro
        this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.4)
            .setOrigin(0)
            .setDepth(1);

        // Panel principal (no ocupa toda la pantalla)
        const panelWidth = this.cameras.main.width * 0.8;
        const panelHeight = this.cameras.main.height * 0.8;
        this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            panelWidth, 
            panelHeight, 
            0x1A1A1A, 
            0.9
        ).setDepth(2);

        // Borde del panel
        this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            panelWidth + 4, 
            panelHeight + 4, 
            0x9147FF, 
            0.7
        ).setStrokeStyle(2, 0xFFFFFF).setDepth(2);

        this.createTitleSection();
        this.createStatsColumns();
        this.createCapsuleButtons();
    }

    createTitleSection() {
        const titleConfig = {
            'stomach': { text: 'STREAM INTERRUPTED!', color: '#FF4A4A' },
            'audience': { text: 'STREAM FAILED!', color: '#FF4A4A' },
            'time': { text: 'STREAM COMPLETED!', color: '#4AFF6A' },
            'manual': { text: 'STREAM ENDED', color: '#FFA84A' }
        }[this.endType] || { text: 'STREAM COMPLETED!', color: '#4AFF6A' };

        // Título principal
        this.add.text(this.cameras.main.centerX, 100, titleConfig.text, {
            fontFamily: 'Arial Black',
            fontSize: '32px',
            color: titleConfig.color,
            stroke: '#000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5).setDepth(3);

        // Subtítulo
        this.add.text(this.cameras.main.centerX, 140, this.getSubtitleText(), {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#EEE',
            align: 'center',
            wordWrap: { width: 450 }
        }).setOrigin(0.5).setDepth(3);
    }

    createStatsColumns() {
        const centerX = this.cameras.main.centerX;
        const leftColX = centerX - 150;
        const rightColX = centerX + 150;
        const startY = 200;

        // Columna izquierda - Estadísticas actuales
        this.add.text(leftColX, startY - 40, 'SESSION STATS', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#9147FF'
        }).setOrigin(0.5, 0).setDepth(3);

        const currentStats = this.getFormattedStats();
        currentStats.forEach((stat, i) => {
            const y = startY + (i * 35);
            
            // Etiqueta alineada a la izquierda
            this.add.text(leftColX - 100, y, stat.label, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#CCC'
            }).setOrigin(0, 0.5).setDepth(3);
            
            // Valor alineado a la derecha
            const valueText = this.add.text(leftColX + 100, y, stat.value, {
                fontFamily: stat.isRecord ? 'Arial Black' : 'Arial',
                fontSize: '16px',
                color: stat.isRecord ? '#FFD700' : '#FFF'
            }).setOrigin(1, 0.5).setDepth(3);
            
            // Estrella para récords
            if (stat.isRecord) {
                this.add.image(leftColX + 115, y, 'star')
                    .setScale(0.5)
                    .setTint(0xFFD700)
                    .setDepth(3);
            }
        });

        // Columna derecha - Mejores récords
        this.add.text(rightColX, startY - 40, 'BEST RECORDS', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#FFD700'
        }).setOrigin(0.5, 0).setDepth(3);

        const bestStats = this.getFormattedBestStats();
        bestStats.forEach((stat, i) => {
            const y = startY + (i * 35);
            
            // Etiqueta alineada a la izquierda
            this.add.text(rightColX - 100, y, stat.label, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#CCC'
            }).setOrigin(0, 0.5).setDepth(3);
            
            // Valor alineado a la derecha
            this.add.text(rightColX + 100, y, stat.value, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: '#FFD700'
            }).setOrigin(1, 0.5).setDepth(3);
        });
    }

    createCapsuleButtons() {
        const centerX = this.cameras.main.centerX;
        const buttonY = this.cameras.main.height - 100;
        
        // Botón de Nueva Partida
        const newGameBtn = this.add.graphics()
            .fillStyle(0x9147FF, 1)
            .fillRoundedRect(centerX - 160, buttonY - 25, 140, 50, 25)
            .setInteractive(
                new Phaser.Geom.Rectangle(centerX - 160, buttonY - 25, 140, 50),
                Phaser.Geom.Rectangle.Contains
            )
            .on('pointerover', () => {
                newGameBtn.clear()
                    .fillStyle(0xB267FF, 1)
                    .fillRoundedRect(centerX - 160, buttonY - 25, 140, 50, 25);
            })
            .on('pointerout', () => {
                newGameBtn.clear()
                    .fillStyle(0x9147FF, 1)
                    .fillRoundedRect(centerX - 160, buttonY - 25, 140, 50, 25);
            })
            .on('pointerdown', () => this.scene.start('GameScene'))
            .setDepth(3);
        
        this.add.text(centerX - 90, buttonY, 'NEW STREAM', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(4);
        
        // Botón de Menú
        const menuBtn = this.add.graphics()
            .fillStyle(0x9147FF, 1)
            .fillRoundedRect(centerX + 20, buttonY - 25, 140, 50, 25)
            .setInteractive(
                new Phaser.Geom.Rectangle(centerX + 20, buttonY - 25, 140, 50),
                Phaser.Geom.Rectangle.Contains
            )
            .on('pointerover', () => {
                menuBtn.clear()
                    .fillStyle(0xB267FF, 1)
                    .fillRoundedRect(centerX + 20, buttonY - 25, 140, 50, 25);
            })
            .on('pointerout', () => {
                menuBtn.clear()
                    .fillStyle(0x9147FF, 1)
                    .fillRoundedRect(centerX + 20, buttonY - 25, 140, 50, 25);
            })
            .on('pointerdown', () => this.scene.start('MenuScene'))
            .setDepth(3);
        
        this.add.text(centerX + 90, buttonY, 'MAIN MENU', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(4);
    }

    /* Métodos de ayuda */
    getDefaultStats() {
        return {
            streamTime: '00:00',
            streamTimeSec: 0,
            peakViewers: 0,
            subscribers: 0,
            totalDonations: 0,
            totalEarnings: 0,
            foodConsumed: 0
        };
    }

    timeToSeconds(timeStr) {
        if (!timeStr || timeStr === 'NaN:NaN') return 0;
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return (minutes * 60) + (isNaN(seconds) ? 0 : seconds);
    }

    secondsToTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    }

    loadBestStats() {
        const savedStats = localStorage.getItem(this.storageKey);
        if (savedStats) {
            this.bestStats = JSON.parse(savedStats);
            // Asegurarse de que streamTime es un número (segundos)
            if (typeof this.bestStats.streamTime === 'string') {
                this.bestStats.streamTime = this.timeToSeconds(this.bestStats.streamTime);
            }
        }
    }

    updateRecords() {
        let updated = false;
        
        // Actualizar todos los stats, incluyendo streamTime
        if (this.currentStats.streamTimeSec > (this.bestStats.streamTime || 0)) {
            this.bestStats.streamTime = this.currentStats.streamTimeSec;
            updated = true;
        }
        
        if (this.currentStats.peakViewers > (this.bestStats.peakViewers || 0)) {
            this.bestStats.peakViewers = this.currentStats.peakViewers;
            updated = true;
        }
        
        if (this.currentStats.subscribers > (this.bestStats.subscribers || 0)) {
            this.bestStats.subscribers = this.currentStats.subscribers;
            updated = true;
        }
        
        if (this.currentStats.totalDonations > (this.bestStats.totalDonations || 0)) {
            this.bestStats.totalDonations = this.currentStats.totalDonations;
            updated = true;
        }
        
        if (this.currentStats.totalEarnings > (this.bestStats.totalEarnings || 0)) {
            this.bestStats.totalEarnings = this.currentStats.totalEarnings;
            updated = true;
        }
        
        if (this.currentStats.foodConsumed > (this.bestStats.foodConsumed || 0)) {
            this.bestStats.foodConsumed = this.currentStats.foodConsumed;
            updated = true;
        }
        
        if (updated) {
            localStorage.setItem(this.storageKey, JSON.stringify(this.bestStats));
        }
    }

    getSubtitleText() {
        return {
            'stomach': 'You ate too much and had to stop!',
            'audience': 'Your audience left the stream!',
            'time': 'You finished your stream successfully!',
            'manual': 'You decided to end the stream early.'
        }[this.endType] || 'Stream completed';
    }

    getFormattedStats() {
        return [
            { 
                label: 'Stream Duration', 
                value: this.currentStats.streamTime, 
                isRecord: this.currentStats.streamTimeSec >= (this.bestStats.streamTime || 0) 
            },
            { 
                label: 'Peak Viewers', 
                value: this.formatNumber(this.currentStats.peakViewers), 
                isRecord: this.currentStats.peakViewers >= (this.bestStats.peakViewers || 0) 
            },
            { 
                label: 'Subscribers', 
                value: this.formatNumber(this.currentStats.subscribers), 
                isRecord: this.currentStats.subscribers >= (this.bestStats.subscribers || 0) 
            },
            { 
                label: 'Total Donations', 
                value: `$${this.formatNumber(this.currentStats.totalDonations)}`, 
                isRecord: this.currentStats.totalDonations >= (this.bestStats.totalDonations || 0) 
            },
            { 
                label: 'Total Earnings', 
                value: `$${this.formatNumber(this.currentStats.totalEarnings)}`, 
                isRecord: this.currentStats.totalEarnings >= (this.bestStats.totalEarnings || 0) 
            },
            { 
                label: 'Food Consumed', 
                value: this.formatNumber(this.currentStats.foodConsumed), 
                isRecord: this.currentStats.foodConsumed >= (this.bestStats.foodConsumed || 0) 
            }
        ];
    }

    getFormattedBestStats() {
        return [
            { label: 'Longest Stream', value: this.secondsToTime(this.bestStats.streamTime) },
            { label: 'Best Viewers', value: this.formatNumber(this.bestStats.peakViewers) },
            { label: 'Best Subscribers', value: this.formatNumber(this.bestStats.subscribers) },
            { label: 'Best Donations', value: `$${this.formatNumber(this.bestStats.totalDonations)}` },
            { label: 'Best Earnings', value: `$${this.formatNumber(this.bestStats.totalEarnings)}` },
            { label: 'Most Food', value: this.formatNumber(this.bestStats.foodConsumed) }
        ];
    }

    formatNumber(num) {
        if (isNaN(num)) return '0';
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}