const config = {
    ...GameConfig,
    scene: [MenuScene, TutorialScene, GameScene, GameOverScene, CreditsScene]
};
const game = new Phaser.Game(config);