class MoneyManager {
    constructor(scene) {
        this.scene = scene;
        this.money = 0;
        this.totalEarnings = 0;

        this.createMoneyPanel();
    }

    createMoneyPanel() {
        const paddingX = 20;
        const paddingY = 10;
        const fontSize = 26;

        this.moneyText = this.scene.add.text(0, 0, `$0`, {
            font: `bold ${fontSize}px Arial`,
            fill: '#ffffff',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000',
                blur: 3,
                fill: true
            }
        }).setDepth(11);

        this.moneyText.setOrigin(0, 0);
        this.moneyText.setPosition(60, 20); 

        this.panel = this.scene.add.graphics().setDepth(10);
        this.updatePanelBackground();

        this.coinIcon = this.scene.add.text(16, 20, '💰', {
            font: `28px Arial`
        }).setDepth(12);
    }

    updatePanelBackground() {
        const bounds = this.moneyText.getBounds();
        const paddingX = 20;
        const paddingY = 10;

        const width = bounds.width + paddingX;
        const height = bounds.height + paddingY;
        const x = this.moneyText.x - paddingX / 2;
        const y = this.moneyText.y - paddingY / 2;

        this.panel.clear();
        this.panel.fillStyle(0x1e1e1e, 0.8);
        this.panel.fillRoundedRect(x, y, width, height, 12);
        this.panel.lineStyle(2, 0xffffff, 0.3);
        this.panel.strokeRoundedRect(x, y, width, height, 12);
    }

    addMoney(amount) {
        this.money += amount;
        this.totalEarnings += amount;
        this.updateMoneyText();
    }

    updateMoneyText() {
        this.moneyText.setText(`$${this.money}`);
        this.updatePanelBackground();
    }

    resetMoney() {
        this.money = 0;
        this.updateMoneyText();
    }

    cleanup() {
        this.moneyText?.destroy();
        this.panel?.destroy();
        this.coinIcon?.destroy();
    }
}
