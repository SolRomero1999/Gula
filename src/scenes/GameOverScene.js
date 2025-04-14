class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.loseType = data.loseType;
        this.audienceRating = data.audienceRating || 0;
        this.audienceGoal = data.audienceGoal || 1000;
    }

    create() {
        // Limpiar escena completamente
        this.children.removeAll();

        // Fondo semi-transparente
        this.add.rectangle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x000000, 
            0.8
        ).setOrigin(0.5);
        
        // Mensaje de Game Over
        const messages = {
            stomach: '¡Te llenaste demasiado!',
            audience: '¡Perdiste a tu audiencia!'
        };
        
        this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY - 100, 
            `${messages[this.loseType]}\nGAME OVER`, 
            {
                font: '48px Arial',
                fill: '#ff0000',
                align: 'center'
            }
        ).setOrigin(0.5).setLineSpacing(20);
        
        // Estadísticas
        this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            `Espectadores finales: ${this.audienceRating}\nMeta actual: ${this.audienceGoal}`, 
            {
                font: '24px Arial',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5).setLineSpacing(10);
        
        // Botón de reinicio
        const restartButton = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 100, 
            'Volver a prender Stream', 
            {
                font: '32px Arial',
                fill: '#ffffff',
                backgroundColor: '#555555',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => restartButton.setBackgroundColor('#777777'))
        .on('pointerout', () => restartButton.setBackgroundColor('#555555'))
        .on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // Botón para volver al menú
        const menuButton = this.add.text(
            this.cameras.main.centerX, 
            this.cameras.main.centerY + 160, 
            'Volver al Menú', 
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#444444',
                padding: { x: 15, y: 8 }
            }
        )
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerover', () => menuButton.setBackgroundColor('#666666'))
        .on('pointerout', () => menuButton.setBackgroundColor('#444444'))
        .on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        // Animación de entrada
        restartButton.setAlpha(0).setScale(0.5);
        menuButton.setAlpha(0).setScale(0.5);
        
        this.tweens.add({
            targets: [restartButton, menuButton],
            alpha: 1,
            scale: 1,
            duration: 500,
            ease: 'Back.out'
        });
    }

    shutdown() {
        this.children.removeAll();
    }
}