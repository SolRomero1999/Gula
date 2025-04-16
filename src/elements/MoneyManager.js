class MoneyManager {
    constructor(scene) {
        this.scene = scene;
        this.money = 0;

        this.createMoneyPanel();
    }

    createMoneyPanel() {
        const paddingX = 15;
        const paddingY = 5;
        const fontSize = 24;
        const font = `${fontSize}px Arial`;
        const text = `Money: $0`;

        // Crear el texto sin fondo, solo con padding interno visual
        this.moneyText = this.scene.add.text(0, 0, text, {
            font: font,
            fill: '#ffffff',
            padding: { x: paddingX, y: paddingY }
        }).setDepth(10);

        this.moneyText.setPosition(20, 20);
        this.moneyText.setOrigin(0, 0);

        // Medir tamaño incluyendo padding visual
        const bounds = this.moneyText.getBounds();
        const panelWidth = bounds.width;
        const panelHeight = bounds.height;

        // Crear el panel detrás del texto, sin borde
        this.panel = this.scene.add.rectangle(
            this.moneyText.x + panelWidth / 2,
            this.moneyText.y + panelHeight / 2,
            panelWidth,
            panelHeight,
            0x000000 // color negro de fondo
        ).setDepth(9);  // detrás del texto
    }

    addMoney(amount) {
        this.money += amount;
        this.updateMoneyText();
    }

    updateMoneyText() {
        this.moneyText.setText(`Money: $${this.money}`);

        const bounds = this.moneyText.getBounds();
        const panelWidth = bounds.width;
        const panelHeight = bounds.height;

        this.panel.setSize(panelWidth, panelHeight);
        this.panel.setPosition(
            this.moneyText.x + panelWidth / 2,
            this.moneyText.y + panelHeight / 2
        );
    }

    resetMoney() {
        this.money = 0;
        this.updateMoneyText();
    }

    cleanup() {
        if (this.moneyText) this.moneyText.destroy();
        if (this.panel) this.panel.destroy();
    }
}