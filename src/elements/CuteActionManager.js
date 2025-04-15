class CuteActionManager {
    static executeCuteAction(gameScene) {
        const isCringe = Math.random() < 0.4; 
        if (isCringe) {
            // 1. Pérdida de audiencia
            const audienceLoss = 30 + Math.floor(Math.random() * 70);
            gameScene.audienceRating = Math.max(0, gameScene.audienceRating - audienceLoss);

            // 2. Mensaje de chat cringe (con usuario y color aleatorio)
            const username = UserGenerator.generateUsername(); 
            const userColor = UserGenerator.generateUserColor(); 
            const cringeMessage = MessageGenerator.getRandomCringeReaction();
            gameScene.chatSystem.addSpecialMessage(username, cringeMessage, userColor); 

            // 3. Efecto de sacudida de pantalla
            if (gameScene.cameras && gameScene.cameras.main) {
                gameScene.cameras.main.shake(300, 0.02);
            }

            return {
                isCringe: true,
                audienceChange: -audienceLoss,
                message: cringeMessage
            };

        } else {
            // Caso exitoso
            const audienceGain = 80 + Math.floor(Math.random() * 120);
            gameScene.audienceRating += audienceGain;
            
            const catLine = CuteActionManager.getRandomCatLine();
            
            // Mensaje positivo del chat 
            const username = UserGenerator.generateUsername(); 
            const userColor = UserGenerator.generateUserColor(); 
            const positiveReaction = MessageGenerator.getRandomPositiveReaction();
            gameScene.chatSystem.addSpecialMessage(username, positiveReaction, userColor); 
            
            // Diálogo del gato
            gameScene.addDialogueBox(catLine, "Kitty", {
                boxColor: 0x000000,
                borderColor: 0xFFFFFF,
                textColor: "#FFFFFF",
                borderThickness: 2
            });
            
            return {
                isCringe: false,
                audienceChange: audienceGain,
                message: catLine
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