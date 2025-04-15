class MessageGenerator {
    static generateMessage() {
        const emotes = ['PogChamp', 'KEKW', 'LUL', 'MonkaS', 'Kappa', 'PepeLaugh', 'FeelsBadMan'];
        const emote = emotes[Math.floor(Math.random() * emotes.length)];

        const messages = [
            `OMG that looks delicious! ${emote}`,
            `How can you eat so much?? ${emote}`,
            `${emote} ${emote} ${emote}`,
            `That's a big bite!`,
            `Don't choke! MonkaS`,
            `Yummy yummy! ${emote}`,
            `I could never eat that much`,
            `Bruh that's insane LUL`,
            `That's some next level eating`,
            `How many calories is that?`,
            `I'm getting full just watching ${emote}`,
            `That crunch tho!`,
            `No way he finishes that`,
            `Absolute madlad ${emote}`,
            `This is my dinner show`,
            `I can't look away`,
            `That sauce looks spicy!`,
            `My stomach hurts watching this`
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    static getRandomPositiveReaction() {
        const positiveChatReactions = [
            "AWWWW SO CUTE!!!",
            "I'M DYING FROM CUTENESS",
            "PET THE KITTY!!!",
            "OMG THAT FACE!!!",
            "I WOULD DIE FOR THIS CAT",
            "BABY!!!! BABY CAT!!!!",
            "LOOK AT THOSE EYES",
            "PURE INNOCENCE",
            "MY HEART CAN'T TAKE IT",
            "KITTY LOVE!!!"
        ];
        return positiveChatReactions[Math.floor(Math.random() * positiveChatReactions.length)];
    }

    static getRandomCringeReaction() {
        const cringeChatReactions = [
            "Okay that's too much...",
            "Cringe...",
            "Trying too hard kitty",
            "Second hand embarrassment",
            "Oof... awkward",
            "Now it's just sad",
            "We get it, you're cute",
            "Okay we've seen this before",
            "*unfollows*",
            "Yikes..."
        ];
        return cringeChatReactions[Math.floor(Math.random() * cringeChatReactions.length)];
    }
    
}