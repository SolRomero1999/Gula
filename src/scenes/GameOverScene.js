class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
        this.storageKey = 'streamerStats';
        this.bestStats = {
            streamTime: 0, 
            peakViewers: 0,
            subscribers: 0,
            totalDonations: 0,
            totalEarnings: 0,
            foodConsumed: 0
        };
    }

    preload() {
        this.load.image('backgroundc', 'assets/backgroundC.png');
        this.load.image('bueno', 'assets/bueno.jpg');
        this.load.image('enfermo', 'assets/enfermo.jpg');
        this.load.image('triste', 'assets/triste.jpg');
        this.load.image('star', 'assets/star.png');
        this.load.audio('end', 'assets/End.mp3');
    }

    init(data) {
        this.endType = data.stats?.endType || 'time';
        this.currentStats = data.stats || this.getDefaultStats();
        this.currentStats.streamTimeSec = this.timeToSeconds(this.currentStats.streamTime);
        this.loadBestStats();
        this.updateRecords();
    }

    create() {
        this.sound.stopAll();
        this.music = this.sound.add('end', { loop: true });
        this.music.play();

        let backgroundKey;
        switch(this.endType) {
            case 'stomach':
                backgroundKey = 'enfermo';
                break;
            case 'audience':
                backgroundKey = 'triste';
                break;
            case 'time':
                backgroundKey = 'bueno';
                break;
            case 'manual':
                backgroundKey = 'backgroundc';
                break;
            default:
                backgroundKey = 'backgroundc';
        }
    
        this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, backgroundKey)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height)
            .setDepth(0);

        const panelContainer = this.add.container(this.cameras.main.width - 200, this.cameras.main.centerY);
        panelContainer.setDepth(2);
    
        const panelWidth = this.cameras.main.width * 0.25;
        const panelHeight = this.cameras.main.height * 0.9;  

        const panelBorder = this.add.rectangle(
            0, 
            0, 
            panelWidth + 4, 
            panelHeight + 4, 
            0x000000, 
            0.7
        ).setStrokeStyle(2, 0xFFFFFF);

        const panel = this.add.rectangle(
            0, 
            0, 
            panelWidth, 
            panelHeight, 
            0x000000, 
            0.5
        );

        panelContainer.add([panelBorder, panel]);

        this.createTitleSection(panelContainer, panelWidth, panelHeight);
        this.createCurrentStatsSection(panelContainer, panelWidth, panelHeight);
        this.createBestRecordsSection(panelContainer, panelWidth, panelHeight);
        this.createCapsuleButtons(panelContainer, panelHeight);
    }
    
    createTitleSection(container, panelWidth, panelHeight) {
        const titleConfig = {
            'stomach': { text: 'STREAM INTERRUPTED!', color: '#FF4A4A' },
            'audience': { text: 'STREAM FAILED!', color: '#FF4A4A' },
            'time': { text: 'STREAM COMPLETED!', color: '#4AFF6A' },
            'manual': { text: 'STREAM ENDED', color: '#FFA84A' }
        }[this.endType] || { text: 'STREAM COMPLETED!', color: '#4AFF6A' };
    
        // Título principal
        const title = this.add.text(0, -panelHeight/2, titleConfig.text, {
            fontFamily: 'Arial Black',
            fontSize: '24px',
            color: titleConfig.color,
            stroke: '#000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5, 0).setDepth(3);
    
        // Subtítulo
        const subtitle = this.add.text(0, -panelHeight/2 + 40, this.getSubtitleText(), {
            fontFamily: 'Arial',
            fontSize: '18px',
            color: '#EEE',
            align: 'center',
            wordWrap: { width: panelWidth * 0.9 }
        }).setOrigin(0.5, 0).setDepth(3);
        
        container.add([title, subtitle]);
    }
    
    createCurrentStatsSection(container, panelWidth, panelHeight) {
        const sectionTitle = this.add.text(0, -panelHeight/2 + 90, 'SESSION STATS', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#9147FF'
        }).setOrigin(0.5, 0).setDepth(3);
    
        const currentStats = this.getFormattedStats();
        const statsElements = [sectionTitle];
        
        currentStats.forEach((stat, i) => {
            const y = -panelHeight/2 + 140+ (i * 35);

            const label = this.add.text(-panelWidth/2 + 20, y, stat.label, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#CCC'
            }).setOrigin(0, 0.5).setDepth(3);

            const valueText = this.add.text(panelWidth/2 - 20, y, stat.value, {
                fontFamily: stat.isRecord ? 'Arial Black' : 'Arial',
                fontSize: '16px',
                color: stat.isRecord ? '#FFD700' : '#FFF'
            }).setOrigin(1, 0.5).setDepth(3);
            
            statsElements.push(label, valueText);

            if (stat.isRecord) {
                const star = this.add.image(panelWidth/2 - 5, y, 'star')
                    .setScale(0.5)
                    .setTint(0xFFD700)
                    .setDepth(3);
                statsElements.push(star);
            }
        });
    
        container.add(statsElements);
    }
    
    createBestRecordsSection(container, panelWidth, panelHeight) {
        const sectionTitle = this.add.text(0, -panelHeight/2 + 350, 'BEST RECORDS', {
            fontFamily: 'Arial Black',
            fontSize: '20px',
            color: '#FFD700'
        }).setOrigin(0.5, 0).setDepth(3);
    
        const bestStats = this.getFormattedBestStats();
        const statsElements = [sectionTitle];
        
        bestStats.forEach((stat, i) => {
            const y = -panelHeight/2 + 400 + (i * 35);

            const label = this.add.text(-panelWidth/2 + 20, y, stat.label, {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#CCC'
            }).setOrigin(0, 0.5).setDepth(3);

            const value = this.add.text(panelWidth/2 - 20, y, stat.value, {
                fontFamily: 'Arial Black',
                fontSize: '16px',
                color: '#FFD700'
            }).setOrigin(1, 0.5).setDepth(3);
            
            statsElements.push(label, value);
        });
    
        container.add(statsElements);
    }
    
    createCapsuleButtons(container, panelHeight) {
        const buttonY = panelHeight/2 - 60;

        const newGameBtn = this.add.graphics()
            .fillStyle(0x9147FF, 1)
            .fillRoundedRect(-150, buttonY+25, 140, 50, 25)
            .setInteractive(
                new Phaser.Geom.Rectangle(-150, buttonY+25, 140, 50),
                Phaser.Geom.Rectangle.Contains
            )
            .on('pointerover', () => {
                newGameBtn.clear()
                    .fillStyle(0xB267FF, 1)
                    .fillRoundedRect(-150, buttonY+25, 140, 50, 25);
            })
            .on('pointerout', () => {
                newGameBtn.clear()
                    .fillStyle(0x9147FF, 1)
                    .fillRoundedRect(-150, buttonY+25, 140, 50, 25);
            })
            .on('pointerdown', () => {
                if (this.music) this.music.stop();
                this.sound.play('click'); 
                this.scene.start('GameScene');
            })            
            .setDepth(3);
        
        const newGameText = this.add.text(-80, buttonY +50, 'NEW STREAM', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(4);

        const menuBtn = this.add.graphics()
            .fillStyle(0x9147FF, 1)
            .fillRoundedRect(10, buttonY+25, 140, 50, 25)
            .setInteractive(
                new Phaser.Geom.Rectangle(10, buttonY+25, 140, 50),
                Phaser.Geom.Rectangle.Contains
            )
            .on('pointerover', () => {
                menuBtn.clear()
                    .fillStyle(0xB267FF, 1)
                    .fillRoundedRect(10, buttonY+25, 140, 50, 25);
            })
            .on('pointerout', () => {
                menuBtn.clear()
                    .fillStyle(0x9147FF, 1)
                    .fillRoundedRect(10, buttonY+25, 140, 50, 25);
            })
            .on('pointerdown', () => {
                if (this.music) this.music.stop();
                this.sound.play('click'); 
                this.scene.start('MenuScene');
            })
            
            .setDepth(3);
        
        const menuText = this.add.text(80, buttonY +50, 'MAIN MENU', {
            fontFamily: 'Arial Black',
            fontSize: '18px',
            color: '#FFF'
        }).setOrigin(0.5).setDepth(4);
        
        container.add([newGameBtn, newGameText, menuBtn, menuText]);
    }

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
            if (typeof this.bestStats.streamTime === 'string') {
                this.bestStats.streamTime = this.timeToSeconds(this.bestStats.streamTime);
            }
        }
    }

    updateRecords() {
        let updated = false;
 
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