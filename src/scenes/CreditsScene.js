class CreditsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CreditsScene' });
    }

    preload() {

    }

    create() {
        console.log('CreditsScene loaded');

        this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'backgroundc'
        ).setOrigin(0.5).setDepth(-1).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        this.add.rectangle(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        ).setDepth(0);

        const scale = 0.6;

        const streamerX = this.cameras.main.width - 300;
        const streamerY = this.cameras.main.centerY + 100;

        this.add.image(streamerX, streamerY, 'streamercredits').setOrigin(0.5).setScale(scale).setDepth(12);
        this.add.image(streamerX, streamerY, 'ojoscredits').setOrigin(0.5).setScale(scale).setDepth(13);
        this.add.image(streamerX, streamerY, 'pupilascredits').setOrigin(0.5).setScale(scale).setDepth(14);

        this.add.image(
            this.cameras.main.centerX,
            80,
            'topimage'
        ).setOrigin(0.5, 0).setScale(0.3).setDepth(11);

        const panelX = 450;
        const panelY = 200;
        const panelWidth = 400;
        const panelHeight = this.cameras.main.height - 250;
        const padding = 20;

        const creditsPanel = this.add.container(panelX, panelY).setDepth(10);

        const panelBg = this.add.graphics()
            .fillStyle(0x000000, 0.7)
            .fillRoundedRect(0, 0, panelWidth, panelHeight, 10)
            .lineStyle(2, 0x9147ff)
            .strokeRoundedRect(0, 0, panelWidth, panelHeight, 10);

        creditsPanel.add(panelBg);

        let currentY = padding + 20;

        const credits = [
            { 
                name: "RonLimonMon", 
                role: "Artist", 
                color: "#FFD700",
                links: [
                    { text: "Twitter", url: "https://x.com/RonLimonArt" },
                    { text: "Instagram", url: "https://www.instagram.com/ronlimonart/" }
                ]
            },
            { 
                name: "Milkai", 
                role: "Artist", 
                color: "#00FF7F",
                links: [
                    { text: "Twitter", url: "https://x.com/KumiMori1" },
                    { text: "Instagram", url: "https://www.instagram.com/_milk_ai_" }
                ]
            },
            { 
                name: "Sawkhe", 
                role: "Programmer",
                color: "#1E90FF",
                links: [
                    { text: "Twitter", url: "https://x.com/Sawkhe99" },
                    { text: "GitHub", url: "https://github.com/SolRomero1999" }
                ]
            }
        ];

        credits.forEach(person => {
            const nameText = this.add.text(padding, currentY, `${person.name} - ${person.role}`, {
                font: '16px Arial',
                fill: person.color,
                fontWeight: 'bold'
            }).setOrigin(0, 0);
            creditsPanel.add(nameText);
            currentY += nameText.height + 15;

            person.links.forEach(link => {
                const linkText = this.add.text(padding, currentY, `${link.text}: `, {
                    font: '14px Arial',
                    fill: '#FFFFFF'
                }).setOrigin(0, 0);

                const clickHere = this.add.text(padding + linkText.width, currentY, "Click here", {
                    font: '14px Arial',
                    fill: '#00FFFF'
                }).setOrigin(0, 0)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => window.open(link.url, '_blank'))
                .on('pointerover', () => clickHere.setFill('#FF00FF'))
                .on('pointerout', () => clickHere.setFill('#00FFFF'));

                creditsPanel.add(linkText);
                creditsPanel.add(clickHere);
                currentY += linkText.height + 10;
            });

            currentY += 20;
        });

        const twitterButton = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.height - 120, 
            'twitterlogo'
        ).setOrigin(0.5).setScale(0.3).setInteractive({ useHandCursor: true }).setDepth(20);

        twitterButton.on('pointerdown', () => window.open('https://x.com/RosemaryTeamJam', '_blank'));
        twitterButton.on('pointerover', () => twitterButton.setScale(0.33));
        twitterButton.on('pointerout', () => twitterButton.setScale(0.3));

        const backButton = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.height - 50,
            'Back to Menu',
            { 
                font: '20px Arial', 
                fill: '#FFFFFF',
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5)
         .setInteractive({ useHandCursor: true })
         .setDepth(20);

        backButton.on('pointerover', () => backButton.setFill('#00FFFF'));
        backButton.on('pointerout', () => backButton.setFill('#FFFFFF'));
        backButton.on('pointerdown', () => this.scene.start('MenuScene'));
    }
}