const config = {
    ...GameConfig,
    scene: [MenuScene, GameScene, GameOverScene, CreditsScene]
};
const game = new Phaser.Game(config);