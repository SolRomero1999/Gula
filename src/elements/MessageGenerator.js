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

    static getBoredMessages() {
        const emotes = ['FeelsBadMan', 'Sadge', 'Boring', 'DansGame', 'WutFace', 'NotLikeThis'];
        const emote = emotes[Math.floor(Math.random() * emotes.length)];
        
        return [
            `zzzz... so boring ${emote}`,
            `When will the eating start? ${emote}`,
            `I came here to watch mukbang...`,
            `${emote} This is just sad`,
            `Where's the food?? ${emote}`,
            `Bruh... this ain't mukbang`,
            `*checks watch* ${emote}`,
            `Did you forget what stream this is?`,
            `I could be watching paint dry instead`,
            `This is content? ${emote}`,
            `*yawns* ${emote}`,
            `Not what I subscribed for...`,
            `Where's the content? ${emote}`,
            `*leaves to watch actual mukbang*`,
            `This stream fell off ${emote}`,
            `Did streamer forget to eat?`,
            `I'm here for FOOD not this`,
            `*opens another stream* ${emote}`
        ];
    }

    static getAngryMukbangMessages() {
        const emotes = ['Angry', 'PepeHands', 'WutFace', 'DansGame', 'MingLee', 'FailFish'];
        const emote = emotes[Math.floor(Math.random() * emotes.length)];
        
        return [
            `THIS AIN'T MUKBANG! ${emote}`,
            `You call this eating?? ${emote}`,
            `Pathetic portions ${emote}`,
            `My grandma eats more than this!`,
            `*unsubs* ${emote}`,
            `Where's the challenge??`,
            `This is baby food amounts ${emote}`,
            `FAKE MUKBANGER ${emote}`,
            `I want my money back!`,
            `Scam mukbang ${emote}`,
            `Not even trying! ${emote}`,
            `Worst mukbang ever ${emote}`,
            `You're embarrassing us ${emote}`,
            `Do you even mukbang bro?`,
            `This is insulting to mukbang ${emote}`,
            `*throws virtual tomatoes*`,
            `0/10 would not watch again`,
            `Where's the real streamer? ${emote}`
        ];
    }
    
}