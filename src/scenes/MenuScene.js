class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        // Limpiar escena por si acaso
        this.children.removeAll();

        // Fondo del menú
        this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x333333
        ).setOrigin(0.5);
        
        // Título del juego
        this.add.text(this.cameras.main.centerX, 150, 'GULA', {
            font: '64px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // Botón de inicio
        const startButton = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            'Iniciar Stream', 
            {
                font: '32px Arial',
                fill: '#ffffff',
                backgroundColor: '#555555',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => startButton.setBackgroundColor('#777777'))
        .on('pointerout', () => startButton.setBackgroundColor('#555555'))
        .on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // Efecto de botón
        this.tweens.add({
            targets: startButton,
            scale: 1.1,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });
    }

    shutdown() {
        this.children.removeAll();
    }
}