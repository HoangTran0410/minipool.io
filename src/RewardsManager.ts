namespace MiniBillar {

    export class RewardsManager {

        private static game: Phaser.Game;
        private static cardsJSONData: CardsAssets[];
        private static unlockedCards: string[];

        public static init(game: Phaser.Game): void {

            RewardsManager.game = game;

            this.unlockedCards = [];
        }

        public static loadAndVerifyCards(): void {

            const cardsData = this.game.cache.getJSON("card-data");
            this.cardsJSONData = cardsData;

            const loadCardsForFirstTime = GameVars.gameData.statistics.rewards.cards.length === 0;

            if (loadCardsForFirstTime) {
                RewardsManager.populateCardDatabase();
                RewardsManager.initialEquip();
            } else {
                RewardsManager.updateCardDatabase();
            }

            for (let card of GameVars.gameData.statistics.rewards.cards) {
                let cardTypeMax = this.getMaxForCardType(this.getCardType(card.cardName));
                if (card.cardPoints === cardTypeMax) {
                    this.updateUnlockedCardsArray(card.cardName);
                }
            }

            GameManager.writeGameData();
        }

        public static getCuesList(): string[] {

            let answer: string[] = [];

            for (let i = 0; i < this.cardsJSONData.length; i++) {

                if (this.cardsJSONData[i].type === "cue") { answer.push(this.cardsJSONData[i].id); }
                else { continue; }
            }

            if (answer.length === 0) { throw "No cues found"; }

            return answer;
        }

        public static getMaxForCardType(type: string): number {
            return (type === "cue") ? GameConstants.MIN_PTS_UNLOCK_CUE : GameConstants.MIN_PTS_UNLOCK_TABLE;
        }

        public static getCurrentStarProgress(): number {
            return GameVars.gameData.statistics.rewards.starProgress;
        }

        public static getCueSpriteFrames(cardId: string): number {

            let cardOnDatabase = this.cardsJSONData.filter(obj => obj.id === cardId)[0];

            if (cardOnDatabase.type !== "cue") { throw "Cannot request sprite data from table card. Check card_data.json"; }

            if (cardOnDatabase.spriteFrames) { return cardOnDatabase.spriteFrames; } else { return 1; }
        }

        public static getCueSpriteIntermittent(cardId: string): boolean {

            let cardOnDatabase = this.cardsJSONData.filter(obj => obj.id === cardId)[0];

            if (cardOnDatabase.type !== "cue") { throw "Cannot request animation data from table card. Check card_data.json"; }

            return cardOnDatabase.intermittentAnimation;
        }

        public static getTableTunnelColour(cardId: string): number {

            let cardOnDatabase = this.cardsJSONData.filter(obj => obj.id === cardId)[0];

            if (cardOnDatabase.type !== "table") { 
                throw "Cannot request tunnel colour data from cue card. Check card_data.json";
            }

            if (cardOnDatabase.customTunnelColour) { 
                return parseInt(cardOnDatabase.customTunnelColour);
            } else { 
                return 0x3A2A3A; 
            }
        }

        public static getMostLikelyNextCard(): any {

            let highestCardId = "";
            let highestCardPoints = 0;

            for (let card of GameVars.gameData.statistics.rewards.cards) {
                if (highestCardPoints <= card.cardPoints) {
                    const cardType = this.getCardType(card.cardName);
                    const typeMax = this.getMaxForCardType(cardType);

                    if (card.cardPoints >= typeMax) { 
                        continue; 
                    }

                    highestCardId = card.cardName;
                    highestCardPoints = card.cardPoints;
                }
            }

            return { cardId: highestCardId, cardPoints: highestCardPoints };
        }

        public static getCardPoints(cardId: string): number {

            const cardOnDatabase = GameVars.gameData.statistics.rewards.cards.filter(obj => obj.cardName === cardId)[0];

            if (cardOnDatabase) { 
                return cardOnDatabase.cardPoints; 
            } else { 
                throw cardId.toString() + " not found in gameData"; 
            }
        }

        public static getCardType(cardId: string): string {

            const cardOnDatabase = this.cardsJSONData.filter(obj => obj.id === cardId)[0];

            if (cardOnDatabase) { 
                return cardOnDatabase.type; 
            } else { 
                throw cardId + " not found in gameData"; 
            }
        }

        public static getRandomCardIds(requestedCardsCount: number = 3): string[] {

            let cuesAvailable: string[] = [];
            let tablesAvailable: string[] = [];

            GameVars.gameData.statistics.rewards.cards.forEach(cardData => {

                if (RewardsManager.unlockedCards.indexOf(cardData.cardName) < 0) {

                    if (RewardsManager.getCardType(cardData.cardName) === "cue") {

                        if (cardData.cardName !== GameVars.gameData.playerData.equipedCue) {
                            cuesAvailable.push(cardData.cardName);
                        }
                    } else {
                        if (cardData.cardName !== GameVars.gameData.equippedTable) {
                            tablesAvailable.push(cardData.cardName);
                        }
                    }
                }
            });

            let selectedCues: Set<string> = new Set<string>();
            while (selectedCues.size < 2 && cuesAvailable.length > 0) {

                const randomIndex = this.game.rnd.integerInRange(0, cuesAvailable.length - 1);
                selectedCues.add(cuesAvailable[randomIndex]);
                cuesAvailable.splice(randomIndex, 1);
            }

            let selectedTables: Set<string> = new Set<string>();

            while (selectedTables.size < 1 && tablesAvailable.length > 0) {

                const randomIndex = this.game.rnd.integerInRange(0, tablesAvailable.length - 1);
                selectedTables.add(tablesAvailable[randomIndex]);
                tablesAvailable.splice(randomIndex, 1);
            }

            return Array.from(selectedCues.values()).concat(Array.from(selectedTables.values()));
        }

        public static resetStarCount(): void { 
            GameVars.gameData.statistics.rewards.starProgress = 0; 
        }

        public static unlockAllCards(): void {

            let cardArray = GameVars.gameData.statistics.rewards.cards;

            cardArray.forEach(card => {

                if (RewardsManager.unlockedCards.indexOf(card.cardName) < 0 &&
                    card.cardName !== GameVars.gameData.playerData.equipedCue &&
                    card.cardName !== GameVars.gameData.equippedTable) {

                    const cardType = RewardsManager.getCardType(card.cardName);
                    const progMaxValue = (cardType === "cue") ? GameConstants.MIN_PTS_UNLOCK_CUE : GameConstants.MIN_PTS_UNLOCK_TABLE;
                    card.cardPoints = progMaxValue;
                    this.updateUnlockedCardsArray(card.cardName);
                }
            });

            GameManager.writeGameData();
        }

        public static equipTable(cardId: string): any {

            if (RewardsManager.getCardType(cardId) !== "table") { throw "Cannot equip cue as table"; }
            else { GameVars.gameData.equippedTable = cardId; }
        }

        public static equipCue(cardId: string): any {

            if (RewardsManager.getCardType(cardId) !== "cue") { throw "Cannot equip table as cue"; }
            else { GameVars.gameData.playerData.equipedCue = cardId; }
        }

        public static prepareRewardStats(): VictoryData {

            let victoryData: VictoryData = { starUnlocked: 0, recentlyUnlockedCardIds: [], numberOfCardsUnlocked: [] };

            if (!GameVars.gameData.statistics.rewards.allUnlocked) {

                GameVars.gameData.statistics.rewards.starProgress++;

                const numberOfCardsToUnlock = 3;
                const potentialUnlockableCards = RewardsManager.getRandomCardIds(numberOfCardsToUnlock);

                if (potentialUnlockableCards.length < 1) {
                    GameVars.gameData.statistics.rewards.allUnlocked = true;
                    GameManager.enterSplash();

                } else {

                    victoryData.starUnlocked = 1;

                    if (GameVars.gameData.statistics.rewards.starProgress === 2) { victoryData.starUnlocked = 2; }
                    else if (GameVars.gameData.statistics.rewards.starProgress === 3) {

                        victoryData.starUnlocked = 3;
                        RewardsManager.resetStarCount();

                        victoryData.recentlyUnlockedCardIds = potentialUnlockableCards;
                        victoryData.numberOfCardsUnlocked = RewardsManager.fillNumberArrayWithIntRange(
                            victoryData.recentlyUnlockedCardIds.length,
                            GameConstants.MIN_CARDS_WON_AT_A_TIME, GameConstants.MAX_CARDS_WON_AT_A_TIME);

                        for (let i = 0; i < victoryData.recentlyUnlockedCardIds.length; i++) {

                            RewardsManager.incrementCardPoint(
                                victoryData.recentlyUnlockedCardIds[i], victoryData.numberOfCardsUnlocked[i]);
                        }
                    }
                }
            }

            return victoryData;
        }

        private static incrementCardPoint(cardId: string, incrementValue: number): void {

            let currentPoints = this.getCardPoints(cardId);
            currentPoints += incrementValue;

            const cardType = RewardsManager.getCardType(cardId);
            const progMaxValue = (cardType === "cue") ? GameConstants.MIN_PTS_UNLOCK_CUE : GameConstants.MIN_PTS_UNLOCK_TABLE;

            const finalPoints = Math.min(progMaxValue, currentPoints);

            // will be slow later. refactor with a map/dictionary
            for (let i = 0; i < GameVars.gameData.statistics.rewards.cards.length; i++) {
                if (GameVars.gameData.statistics.rewards.cards[i].cardName === cardId) {
                    RewardsManager.setCardPoints(cardId, finalPoints, cardType);
                }
            }
        }

        private static initialEquip() {

            let cueFound = false;
            let tableFound = false;

            for (let i = 0; i < this.cardsJSONData.length; i++) {
                if (!cueFound) {
                    if (this.cardsJSONData[i].type === "cue") {
                        RewardsManager.setCardPoints(this.cardsJSONData[i].id, GameConstants.MIN_PTS_UNLOCK_CUE, "cue");
                        RewardsManager.equipCue(this.cardsJSONData[i].id);
                        cueFound = true;
                    } else { 
                        continue; 
                    }
                }

                if (!tableFound) {
                    if (this.cardsJSONData[i].type === "table") {
                        RewardsManager.setCardPoints(this.cardsJSONData[i].id, GameConstants.MIN_PTS_UNLOCK_TABLE, "table");
                        RewardsManager.equipTable(this.cardsJSONData[i].id);
                        tableFound = true;
                    } else { 
                        continue; 
                    }
                }
            }

            if (!cueFound) {
                throw "No cues present";
            }

            if (!tableFound) {
                throw "No tables present";
            }
        }

        private static updateUnlockedCardsArray(cardId: string) {

            if (RewardsManager.unlockedCards.indexOf(cardId) < 0) {
                RewardsManager.unlockedCards.push(cardId);
            }
        }

        private static setCardPoints(cardId: string, points: number, cardType: string) {

            for (let i = 0; i < GameVars.gameData.statistics.rewards.cards.length; i++) {

                if (GameVars.gameData.statistics.rewards.cards[i].cardName === cardId) {

                    const cardTypeMax = RewardsManager.getMaxForCardType(cardType);

                    if (points >= cardTypeMax) {
                        GameVars.gameData.statistics.rewards.cards[i].cardPoints = cardTypeMax;
                        this.updateUnlockedCardsArray(cardId);
                    } else { 
                        GameVars.gameData.statistics.rewards.cards[i].cardPoints = points; 
                    }

                    return;
                }
            }

            GameManager.log("Failed to find " + cardId);
        }

        private static updateCardDatabase(): void {
            let pruneList: any[] = [];

            for (let preexistingCards of GameVars.gameData.statistics.rewards.cards) {

                if (!Game.currentInstance.cache.getFrameByName("texture_atlas_5", preexistingCards.cardName + ".png")) {
                    GameManager.log("No art for " + preexistingCards.cardName + ". Removing card from gameData");
                    pruneList.push(preexistingCards);
                }
            }

            for (let ri of pruneList) {

                GameVars.gameData.statistics.rewards.cards = GameVars.gameData.statistics.rewards.cards.filter(obj => obj !== ri);
            }

            for (let c of this.cardsJSONData) {

                if (GameVars.gameData.statistics.rewards.cards.filter(x => x.cardName === (c.id)).length < 1) {
                    if (Game.currentInstance.cache.getFrameByName("texture_atlas_5", c.id + ".png")) {
                        GameManager.log("Adding card_" + c.id);
                        GameVars.gameData.statistics.rewards.cards.push({ cardName: c.id, cardPoints: 0 });
                    }
                }
            }
        }

        private static populateCardDatabase(): void {

            for (let c of this.cardsJSONData) {
                const cardIdFromJSON: string = c.id;
                if (Game.currentInstance.cache.getFrameByName("texture_atlas_5", cardIdFromJSON + ".png")) {
                    GameManager.log("First time adding card " + c.id);
                    GameVars.gameData.statistics.rewards.cards.push({ cardName: cardIdFromJSON, cardPoints: 0 });
                } else {
                    GameManager.log("No art for card " + cardIdFromJSON);
                }
            }
        }

        private static fillNumberArrayWithIntRange(count: number, min: number, max: number): number[] {

            let answer: number[] = [];

            for (let i = 0; i < count; i++) { 
                answer.push(RewardsManager.game.rnd.integerInRange(min, max)); 
            }

            return answer;
        }
    }
}
