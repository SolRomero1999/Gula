const config = {
    ...GameConfig,
    scene: [MenuScene, GameScene, GameOverScene]
};
const game = new Phaser.Game(config);