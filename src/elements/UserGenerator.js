class UserGenerator {
    static generateUsername() {
        return [
            "xXGamer99", "TTV_Eater", "MrFoodie", "DrChomp", "Sawkhe", "RonLimonMon", "Milk_ai",
            "KingNom", "QueenHungry", "ProSnack", "LilMunch",
            "HungryAF", "FoodDestroyer", "SnackKing", "MukbangLover"
        ][Math.floor(Math.random() * 12)];
    }

    static generateUserColor() {
        const usernameColors = [
            '#FF0000', '#0000FF', '#008000', '#B22222', 
            '#FF7F50', '#9ACD32', '#FF4500', '#2E8B57',
            '#DAA520', '#D2691E', '#5F9EA0', '#1E90FF'
        ];
        return usernameColors[Math.floor(Math.random() * usernameColors.length)];
    }
}
