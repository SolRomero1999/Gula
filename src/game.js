// Configuración final del juego con las escenas
const config = {
    ...GameConfig,
    scene: [MenuScene, GameScene, GameOverScene]
};

// Crear instancia del juego
const game = new Phaser.Game(config);