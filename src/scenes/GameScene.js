class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.chatSystem = null;
    }

    init() {
        // Variables del juego
        this.stomachBar = null;
        this.viewersText = null;
        this.goalText = null;
        this.foodItem = null;
        this.stomachCapacity = 100;
        this.displayStomach = 100;
        this.audienceRating = 100;
        this.displayAudience = 100;
        this.isGameOver = false;
        this.audienceTimer = null;
        this.stomachRecoveryTimer = null;
        this.timeElapsed = 0;
        this.audienceGoal = 1000;
        this.animatingNumbers = false;
    }

    create() {
        // Limpieza
        this.cleanup();
        
        // Crear elementos
        this.createStomachBar();
        this.createViewersCounter();
        this.createGoalDisplay();
        this.createFood();
        
        // Temporizadores
        this.setupTimers();

        this.chatSystem = new SimpleChatSystem(this);
    }

    cleanup() {
        // Limpiar todos los objetos
        if (this.audienceTimer) this.audienceTimer.destroy();
        if (this.stomachRecoveryTimer) this.stomachRecoveryTimer.destroy();
        if (this.foodItem) this.foodItem.destroy();
        if (this.stomachBar) this.stomachBar.destroy();
        if (this.viewersText) this.viewersText.destroy();
        if (this.goalText) this.goalText.destroy();
        
        this.time.removeAllEvents();
        this.tweens.killAll();
        this.children.removeAll();
    }

    createStomachBar() {
        const barWidth = 30;
        const barHeight = 400;
        const margin = 50;
        const startY = this.cameras.main.height - margin - barHeight;
        
        // Fondo de la barra (gris)
        this.add.graphics()
            .fillStyle(0x333333, 1)
            .fillRect(margin, startY, barWidth, barHeight);
        
        // Barra de estómago (verde)
        this.stomachBar = this.add.graphics()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin, 
                startY + barHeight * (1 - this.displayStomach / 100), 
                barWidth, 
                barHeight * (this.displayStomach / 100)
            );
    }

    createViewersCounter() {
        // Contador de espectadores en una sola línea "XXX viewers"
        this.viewersText = this.add.text(
            this.cameras.main.width - 20,
            20,
            `${this.audienceRating} viewers`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 15, y: 5 }
            }
        )
        .setOrigin(1, 0)
        .setDepth(10);
    }

    createGoalDisplay() {
        // Meta actual
        this.goalText = this.add.text(
            this.cameras.main.centerX,
            20,
            `Meta: ${this.audienceRating}/${this.audienceGoal}`,
            {
                font: '24px Arial',
                fill: '#ffffff',
                backgroundColor: '#9147ff',
                padding: { x: 15, y: 5 }
            }
        )
        .setOrigin(0.5, 0)
        .setDepth(10);
    }

    createFood() {
        // Comida interactiva
        this.foodItem = this.add.circle(
            this.cameras.main.centerX, 
            this.cameras.main.centerY, 
            50, 
            0xff0000
        ).setInteractive();
        
        this.foodItem.on('pointerdown', () => {
            if (!this.isGameOver) {
                this.handleFoodClick();
            }
        });
    }

    handleFoodClick() {
        // Reducir estómago y aumentar audiencia
        this.stomachCapacity = Phaser.Math.Clamp(this.stomachCapacity - 10, 0, 100);
        const audienceGain = Math.floor(50 + Math.random() * 50);
        this.audienceRating += audienceGain;
        
        // Efecto visual de la comida
        this.tweens.add({
            targets: this.foodItem,
            scale: 0.8,
            duration: 100,
            yoyo: true
        });
        
        // Animaciones suaves
        this.animateStomachBar();
        this.animateAudienceChange(audienceGain);
        this.events.emit('eat');
    }

    setupTimers() {
        // Temporizador de pérdida de audiencia (5% cada 5 segundos)
        this.audienceTimer = this.time.addEvent({
            delay: 5000,
            callback: () => {
                if (!this.isGameOver) {
                    const lostAudience = Math.max(1, Math.floor(this.audienceRating * 0.05));
                    this.audienceRating = Math.max(0, this.audienceRating - lostAudience);
                    this.animateAudienceChange(-lostAudience);
                }
            },
            callbackScope: this,
            loop: true
        });
        
        // Temporizador de recuperación de estómago más rápido (3% cada segundo)
        this.stomachRecoveryTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.isGameOver && this.stomachCapacity < 100) {
                    this.stomachCapacity = Phaser.Math.Clamp(this.stomachCapacity + 3, 0, 100);
                    this.animateStomachBar();
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    animateStomachBar() {
        // Animación suave de la barra de estómago
        this.tweens.add({
            targets: this,
            displayStomach: this.stomachCapacity,
            duration: 300,
            ease: 'Power1',
            onUpdate: () => {
                this.updateStomachBar();
            }
        });
    }

    animateAudienceChange(change) {
        if (this.animatingNumbers) return;
        this.animatingNumbers = true;
        
        const startValue = this.displayAudience;
        const endValue = this.audienceRating;
        const duration = Math.min(800, Math.abs(change) * 15); // Ajuste de velocidad
        
        this.tweens.add({
            targets: this,
            displayAudience: endValue,
            duration: duration,
            ease: 'Power1',
            onUpdate: () => {
                // Actualizar texto en una sola línea "XXX viewers"
                this.viewersText.setText(`${Math.floor(this.displayAudience)} viewers`);
                
                // Cambiar color
                if (this.displayAudience < startValue) {
                    this.viewersText.setColor('#ff5555'); // Rojo cuando disminuye
                } else {
                    this.viewersText.setColor('#55ff55'); // Verde cuando aumenta
                }
                
                this.updateGoalDisplay();
                
                // Verificar metas durante la animación
                if (this.displayAudience >= this.audienceGoal) {
                    this.updateAudienceGoal();
                }
            },
            onComplete: () => {
                this.viewersText.setColor('#ffffff'); // Blanco al finalizar
                this.animatingNumbers = false;
                
                // Verificar condiciones de fin de juego
                if (this.audienceRating <= 0) {
                    this.triggerGameOver('audience');
                }
            }
        });
    }

    updateStomachBar() {
        const barWidth = 30;
        const barHeight = 400;
        const margin = 50;
        const startY = this.cameras.main.height - margin - barHeight;
        
        this.stomachBar.clear()
            .fillStyle(0x00ff00, 1)
            .fillRect(
                margin, 
                startY + barHeight * (1 - this.displayStomach / 100), 
                barWidth, 
                barHeight * (this.displayStomach / 100)
            );
        
        // Verificar fin de juego por estómago vacío
        if (this.stomachCapacity <= 0 && !this.isGameOver) {
            this.triggerGameOver('stomach');
        }
    }

    updateGoalDisplay() {
        this.goalText.setText(`Meta: ${Math.floor(this.displayAudience)}/${this.audienceGoal}`);
    }

    updateAudienceGoal() {
        const goals = [1000, 2500, 5000, 10000];
        for (let goal of goals) {
            if (this.audienceRating < goal) {
                this.audienceGoal = goal;
                break;
            }
        }
        
        this.showGoalReachedEffect();
    }

    showGoalReachedEffect() {
        // Efecto de flash morado
        this.cameras.main.flash(300, 145, 71, 255);
        
        // Mensaje de meta alcanzada
        const congratsText = this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            `¡Meta alcanzada!\nNueva meta: ${this.audienceGoal}`,
            {
                font: '32px Arial',
                fill: '#ffffff',
                backgroundColor: '#9147ff',
                align: 'center',
                padding: { x: 20, y: 10 }
            }
        )
        .setOrigin(0.5)
        .setDepth(20);
        
        // Desvanecer el mensaje
        this.tweens.add({
            targets: congratsText,
            alpha: 0,
            duration: 1000,
            delay: 1000,
            onComplete: () => congratsText.destroy()
        });
    }

    triggerGameOver(loseType) {
        this.isGameOver = true;
        this.cleanup();
        
        this.scene.start('GameOverScene', { 
            loseType: loseType,
            audienceRating: this.audienceRating,
            audienceGoal: this.audienceGoal
        });
    }

    shutdown() {
        this.cleanup();
    }
}