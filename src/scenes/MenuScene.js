class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menubackground', 'assets/portada.jpg'); // Fondo
        this.load.image('startButton', 'assets/startButton.png'); // Botón de iniciar
        this.load.image('creditsButton', 'assets/creditsButton.png'); // Botón de créditos
    }

    create() {
        this.children.removeAll();

        // Fondo con imagen
        this.add.image(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'menubackground'
        ).setOrigin(0.5).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Botón de iniciar stream con imagen
        const startButton = this.add.image(
            this.cameras.main.centerX, 
            this.cameras.main.height - 50, // Abajo con margen
            'startButton'
        ).setOrigin(0.5).setScale(0.5).setInteractive();

        startButton.on('pointerover', () => startButton.setScale(0.55));
        startButton.on('pointerout', () => startButton.setScale(0.5));
        startButton.on('pointerdown', () => {
            this.scene.stop('MenuScene');
            this.scene.start('TutorialScene');
        });

        // Efecto animado tipo pulso, más sutil
        this.tweens.add({
            targets: startButton,
            scale: 0.55,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        // Botón de créditos en la esquina superior derecha
        const creditsButton = this.add.image(
            this.cameras.main.width - 120, 
            50, 
            'creditsButton'
        ).setOrigin(0.5).setScale(0.6).setInteractive();

        creditsButton.on('pointerover', () => creditsButton.setScale(0.65));
        creditsButton.on('pointerout', () => creditsButton.setScale(0.6));
        creditsButton.on('pointerdown', () => {
            this.scene.start('CreditsScene');
        });
    }

    shutdown() {
        this.children.removeAll();
    }
}
