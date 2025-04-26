class MenuScene extends Phaser.Scene {
    static backgroundMusic = null;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.setBaseURL('./');
        this.load.setPath('assets');

        this.load.image('menubackground', 'portada.png'); 
        this.load.image('startButton', 'startButton.png'); 
        this.load.image('creditsButton', 'creditsButton.png'); 

        this.load.image('streamercredits', 'streamert.png');
        this.load.image('ojoscredits', 'ojos_tiernos.png');
        this.load.image('pupilascredits', 'pupilas_tiernas.png');
        this.load.image('topimage', 'topimage.png');
        this.load.image('backgroundc', 'backgroundC.png');
        this.load.image('twitterlogo', 'twitterlogo.png');  

        this.load.image('background', 'background.png');
        this.load.image('luces', 'luces.png');
        this.load.image('desk', 'desk.png');
        this.load.image('ramen_bowl1', 'ramen_bowl1.png');
        this.load.image('ramen_bowl2', 'ramen_bowl2.png');
        this.load.image('ramen_bowl3', 'ramen_bowl3.png');
        this.load.image('ramen_bowl4', 'ramen_bowl4.png');
        this.load.image('ramen_bowl5', 'ramen_bowl5.png');
        this.load.image('sushi1', 'sushi1.png');
        this.load.image('sushi2', 'sushi2.png');
        this.load.image('sushi3', 'sushi3.png');
        this.load.image('sushi4', 'sushi4.png');
        this.load.image('sushi5', 'sushi5.png');
        this.load.image('sushi6', 'sushi6.png');
        this.load.image('sushi7', 'sushi7.png');
        this.load.image('sushi8', 'sushi8.png');
        this.load.image('sushi9', 'sushi9.png');
        this.load.image('sushi10', 'sushi10.png');
        this.load.image('sushi11', 'sushi11.png');
        this.load.image('sushi12', 'sushi12.png');
        this.load.image('palillos', 'palillos.png');
        this.load.image('portapalillos', 'portapalillos.png');
        this.load.image('streamer', 'streamer.png');
        this.load.image('ojosc_cc', 'ojos_base.png');
        this.load.image('pupilasc', 'pupilas_base.png');
        this.load.image('streamerg', 'streamerg.png');
        this.load.image('ojosc_ccc', 'ojosc_ccc.png');
        this.load.image('streamergg', 'streamergg.png');
        this.load.image('caragordo', 'caragordo.png');
        this.load.image('full', 'full.png');
        this.load.image('manosfull', 'manosfull.png');
        this.load.image('streamert', 'streamert.png');
        this.load.image('ojostiernos', 'ojos_tiernos.png');
        this.load.image('pupilastiernas', 'pupilas_tiernas.png');
        this.load.image('streamertg', 'streamertg.png');

        this.load.image('bueno', 'bueno.jpg');
        this.load.image('enfermo', 'enfermo.jpg');
        this.load.image('triste', 'triste.jpg');
        this.load.image('star', 'star.png');
        this.load.audio('end', 'End.mp3');

        this.load.audio('menumusic', 'song.mp3'); 
        this.load.audio('game', 'game.mp3'); 
        this.load.audio('click', 'poop.mp3'); 
        this.load.audio('miau', 'miau.mp3');
        this.load.audio('bocado', 'bocado.mp3');
        this.load.audio('sorbido', 'sorbido.mp3');
        this.load.audio('follow', 'follow.mp3');
        this.load.audio('alerta', 'alerta.mp3');
    }

    create() {
        this.children.removeAll();

        if (!MenuScene.backgroundMusic || !MenuScene.backgroundMusic.isPlaying) {
            MenuScene.backgroundMusic = this.sound.add('menumusic', {
                loop: true,
                volume: 0.5
            });
            MenuScene.backgroundMusic.play();
        }

        this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            'menubackground'
        ).setOrigin(0.5).setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        const startButton = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.height - 50,
            'startButton'
        ).setOrigin(0.5).setScale(0.5).setInteractive();

        startButton.on('pointerover', () => startButton.setScale(0.55));
        startButton.on('pointerout', () => startButton.setScale(0.5));
        startButton.on('pointerdown', () => {
            this.sound.play('click');
            if (MenuScene.backgroundMusic && MenuScene.backgroundMusic.isPlaying) {
                MenuScene.backgroundMusic.stop(); 
            }
            this.scene.stop('MenuScene');
            this.scene.start('TutorialScene');
        });

        this.tweens.add({
            targets: startButton,
            scale: 0.55,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        const creditsButton = this.add.image(
            this.cameras.main.width - 120,
            50,
            'creditsButton'
        ).setOrigin(0.5).setScale(0.6).setInteractive();

        creditsButton.on('pointerover', () => creditsButton.setScale(0.65));
        creditsButton.on('pointerout', () => creditsButton.setScale(0.6));
        creditsButton.on('pointerdown', () => {
            this.sound.play('click'); 
            this.scene.start('CreditsScene'); 
        });
    }

    shutdown() {
        this.children.removeAll();
    }
}
