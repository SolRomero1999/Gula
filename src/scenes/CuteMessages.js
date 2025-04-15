class CuteMessages {
    constructor() {
        this.cuteCatLines = [
            "Meow~ *purrs*",
            "*rolls over* UwU",
            "*shows belly* Pet me hooman!",
            "*slow blinks* I love you~",
            "*paws at invisible string*",
            "*headbutts camera*",
            "*kneads blanket* Making biscuits!",
            "*tail flicks* So playful!",
            "*stretches dramatically*",
            "*licks paw* So clean, much wow"
        ];
        
        this.positiveChatReactions = [
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
        
        this.cringeChatReactions = [
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
    }
    
    getRandomCatLine() {
        return this.cuteCatLines[Math.floor(Math.random() * this.cuteCatLines.length)];
    }
    
    getRandomPositiveReaction() {
        return this.positiveChatReactions[Math.floor(Math.random() * this.positiveChatReactions.length)];
    }
    
    getRandomCringeReaction() {
        return this.cringeChatReactions[Math.floor(Math.random() * this.cringeChatReactions.length)];
    }
}
