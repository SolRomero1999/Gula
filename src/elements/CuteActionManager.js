class CuteActionManager {
    static getRandomCatLine() {
        const catLines = [
            "Look at this cute kitty!",
            "This is pure feline elegance.",
            "Cat's out of the bag!",
            "Meow! So adorable!",
            "Such a majestic kitty!"
        ];
        return catLines[Math.floor(Math.random() * catLines.length)];
    }
}