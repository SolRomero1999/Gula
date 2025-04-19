class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    preload() {
        this.load.image('background', '../assets/background.png');
    }

    init(data) {
        // Corregir aquí - acceder a stats.endType en lugar de data.endType directamente
        this.endType = data.stats?.endType || 'time'; 
        this.stats = data.stats || {
            streamTime: '00:00',
            peakViewers: 0,
            subscribers: 0,
            totalDonations: 0,
            totalEarnings: 0,
            foodConsumed: 0
        };
        
        console.log("Game Over Data:", data); // Para depuración
        console.log("End Type:", this.endType); // Para depuración
    }

    create() {
        console.log('GameOverScene loaded');

        // Background
        this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'background'
        ).setOrigin(0.5).setDepth(-1).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Dark overlay
        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setDepth(0);

        // Results panel - moved up by reducing panelY from 200 to 150
        const panelX = this.cameras.main.centerX;
        const panelY = 150;  // Changed from 200
        const panelWidth = 400;
        const panelHeight = this.cameras.main.height - 300;  // Adjusted height
        const padding = 20;

        const resultsPanel = this.add.container(panelX, panelY).setDepth(10);

        // Panel background
        const panelBg = this.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRoundedRect(-panelWidth/2, 0, panelWidth, panelHeight, 10)  // Centered
            .lineStyle(2, 0x9147ff)
            .strokeRoundedRect(-panelWidth/2, 0, panelWidth, panelHeight, 10);

        resultsPanel.add(panelBg);

        let currentY = padding + 20;

        // Title based on how the stream ended
        const endMessages = {
            stomach: {
                title: 'STREAM INTERRUPTED!',
                subtitle: 'You ate too much and had to stop',
                color: '#FF5555'
            },
            audience: {
                title: 'STREAM FAILED!',
                subtitle: 'You lost all your audience',
                color: '#FF5555'
            },
            time: {
                title: 'STREAM COMPLETED!',
                subtitle: 'You finished your stream successfully',
                color: '#55FF55'
            }
        };

        const message = endMessages[this.endType] || endMessages.time;

        const titleText = this.add.text(0, currentY, message.title, {
            font: '24px Arial',
            fill: message.color,
            fontWeight: 'bold'
        }).setOrigin(0.5, 0);
        resultsPanel.add(titleText);
        currentY += titleText.height + 15;

        const subtitleText = this.add.text(0, currentY, message.subtitle, {
            font: '16px Arial',
            fill: '#FFFFFF',
            align: 'center',
            wordWrap: { width: panelWidth - 40 }
        }).setOrigin(0.5, 0);
        resultsPanel.add(subtitleText);
        currentY += subtitleText.height + 30;

        // Statistics
        const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        const stats = [
            { label: 'Stream Duration', value: this.stats.streamTime },
            { label: 'Peak Viewers', value: formatNumber(this.stats.peakViewers) },
            { label: 'Subscribers Gained', value: formatNumber(this.stats.subscribers) },
            { label: 'Total Donations', value: `$${formatNumber(this.stats.totalDonations)}` },
            { label: 'Total Earnings', value: `$${formatNumber(this.stats.totalEarnings)}` },
            { label: 'Food Consumed', value: formatNumber(this.stats.foodConsumed) }
        ];

        stats.forEach(stat => {
            const labelText = this.add.text(-panelWidth/2 + padding, currentY, stat.label + ':', {
                font: '16px Arial',
                fill: '#AAAAAA'
            }).setOrigin(0, 0);
            resultsPanel.add(labelText);

            const valueText = this.add.text(panelWidth/2 - padding, currentY, stat.value, {
                font: '16px Arial',
                fill: '#FFFFFF',
                fontWeight: 'bold'
            }).setOrigin(1, 0);
            resultsPanel.add(valueText);

            currentY += labelText.height + 15;
        });

        const buttonStyle = { 
            font: '20px Arial', 
            fill: '#FFFFFF',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        };

        const newStreamButton = this.add.text(
            this.cameras.main.centerX - 100,
            this.cameras.main.height - 200, 
            'New Stream',
            buttonStyle
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true })
         .setDepth(20);

        newStreamButton.on('pointerover', () => newStreamButton.setFill('#00FFFF'));
        newStreamButton.on('pointerout', () => newStreamButton.setFill('#FFFFFF'));
        newStreamButton.on('pointerdown', () => this.scene.start('GameScene'));

        const menuButton = this.add.text(
            this.cameras.main.centerX + 100,
            this.cameras.main.height - 200, 
            'Main Menu',
            buttonStyle
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true })
         .setDepth(20);

        menuButton.on('pointerover', () => menuButton.setFill('#00FFFF'));
        menuButton.on('pointerout', () => menuButton.setFill('#FFFFFF'));
        menuButton.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}