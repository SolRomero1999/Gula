class CuteActionManager {
    static executeCuteAction(gameScene) {
        const isOverusing = gameScene.cuteOveruseCounter >= 3 && Math.random() < 0.5;
        
        if (isOverusing) {
            const audienceLoss = Math.floor(30 + Math.random() * 70);
            gameScene.audienceRating = Math.max(0, gameScene.audienceRating - audienceLoss);
            const cringeMessage = MessageGenerator.getRandomCringeReaction();
            gameScene.chatSystem.addSpecialMessage("Chat", cringeMessage, "#ff5555");
            gameScene.cuteOveruseCounter = 0;
            
            return {
                isOverusing: true,
                audienceChange: -audienceLoss
            };
        } else {
            const audienceGain = Math.floor(80 + Math.random() * 120);
            gameScene.audienceRating += audienceGain;
            gameScene.cuteOveruseCounter++;
            
            const catLine = CuteActionManager.getRandomCatLine();
            const positiveReaction = MessageGenerator.getRandomPositiveReaction();
            
            gameScene.chatSystem.addSpecialMessage("Gatito", catLine, "#ff69b4");
            gameScene.chatSystem.addSpecialMessage("Chat", positiveReaction, "#55ff55");
            
            return {
                isOverusing: false,
                audienceChange: audienceGain
            };
        }
    }

    static getRandomCatLine() {
        const catLines = [
            "¡Mira qué gatito más mono!",
            "Esto es pura elegancia felina",
            "¡Miau! ¡Qué adorable!",
            "Qué gato más majestuoso",
            "Ronroneos de felicidad",
            "¡Pawsitivamente encantador!",
            "Bigotes de ternura",
            "Zarpas de seda",
            "¡Este gatito es trending topic!",
            "Purrfecto para el directo"
        ];
        return catLines[Math.floor(Math.random() * catLines.length)];
    }
}