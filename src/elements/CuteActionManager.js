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
            
            // Mensaje del gato como diálogo del personaje
            gameScene.addDialogueBox(catLine, "Gatito", {
                boxColor: 0x000000,
                borderColor: 0xFFFFFF,
                textColor: "#FFFFFF",
                borderThickness: 2
            });
            
            // Mensaje del chat normal
            gameScene.chatSystem.addSpecialMessage("Chat", positiveReaction, "#55ff55");
            
            return {
                isOverusing: false,
                audienceChange: audienceGain
            };
        }
    }

    static getRandomCatLine() {
        const catLines = [
            "Look at this purrfect little furball!",
            "Such feline elegance!",
            "Meow! So adorable!",
            "What a majestic kitty!",
            "Purrs of pure joy.",
            "Pawsitively charming!",
            "Whiskers full of cuteness!",
            "Silky little paws.",
            "This kitty is going viral!",
            "Purrfect moment for the stream!"
        ];
        return catLines[Math.floor(Math.random() * catLines.length)];
    }
}