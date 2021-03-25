module MiniBillar {

    export class EquipmentState extends Phaser.State {

        public static currentInstance: EquipmentState;

        private railContainer: Phaser.Group;
        private cueRail: Rail;
        private tableRail: Rail;

        private swipingCueRail: boolean;
        private swiping: boolean;
        private swipeStartPosX: number;

        public init(): void {

            EquipmentState.currentInstance = this;
        }

        public create(): void {

            const background = this.add.image(GameVars.gameWidth / 2, GameVars.gameHeight / 2, "texture_atlas_2", "lobby.png");
            background.anchor.set(.5);
            background.scale.set(GameVars.scaleXMult, GameVars.gameHeight / background.height);

            this.railContainer = this.add.group();

            const tablesLabel = this.add.image(GameVars.gameWidth * 0.5 + 4 * GameVars.scaleXMult, 16, "texture_atlas_1", "tables_cues_text.png");
            tablesLabel.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            tablesLabel.anchor.set(.5, 0);

            const buttonBack = this.add.button(38 * GameVars.scaleXMult, 38 * GameVars.scaleYMult, "texture_atlas_1", this.onClickBack, this);
            buttonBack.setFrames("btn_back_on.png", "btn_back_off.png", "btn_back_on.png");
            buttonBack.forceOut = true;
            if (this.game.device.touch) { buttonBack.onInputDown.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this); }
            buttonBack.onInputOver.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            buttonBack.onInputOut.add(function () { buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            buttonBack.anchor.set(0.5);
            buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            if (GameConstants.DEVELOPMENT && !GameVars.gameData.statistics.rewards.allUnlocked) {

                const buttonUnlock = this.add.button(GameVars.gameWidth - 10 * GameVars.scaleXMult, 10 * GameVars.scaleYMult, "texture_atlas_0", this.onClickUnlock, this);
                buttonUnlock.forceOut = true;
                buttonUnlock.anchor.set(1, 0);
                buttonUnlock.setFrames("btn_unlock_on.png", "btn_unlock_off.png", "btn_unlock_on.png");
                buttonUnlock.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            }

            const cardsData = this.game.cache.getJSON("card-data");
            let cardsInJSON: CardsAssets[] = cardsData;

            this.cueRail = this.createRail(505, cardsInJSON, "cue");
            this.tableRail = this.createRail(236, cardsInJSON, "table");

            if (!this.cueRail || !this.tableRail) { throw "Error creating rails"; }

            this.scrollToEquippedCards();

            // swipe
            this.game.input.onDown.add(this.startSwipe, this);
            this.game.input.onUp.add(this.endSwipe, this);
            this.clearSwipe();

            this.game.camera.flash(0x000000, 350, false);
        }

        public update(): void {

            if (this.swiping) {

                const currentPointerPos = this.game.input.activePointer.position;
                let xDelta = this.swipeStartPosX - currentPointerPos.x;

                let swipeProgress = xDelta / GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
                swipeProgress = Phaser.Math.clamp(swipeProgress, -.999, .999);

                if (this.swipingCueRail) {
                    this.cueRail.scrollPreview(swipeProgress);
                } else {
                    this.tableRail.scrollPreview(swipeProgress);
                }
            }

            super.update();
        }

        public shutdown(): void {

            EquipmentState.currentInstance = null;

            super.shutdown();
        }

        private scrollToEquippedCards(): void {

            let stepsToScrollTable = 0;
            for (let i = 0; i < this.tableRail.cardArray.length; i++) {

                const card = this.tableRail.cardArray[i];
                if (card.cardType !== "table") { continue; }

                if (card.cardId === GameVars.gameData.equippedTable) {
                    stepsToScrollTable = i;
                    break;
                }
            }
            this.tableRail.scrollStepped(stepsToScrollTable - 2, false);

            let stepsToScrollCard = 0;
            for (let i = 0; i < this.cueRail.cardArray.length; i++) {

                const card = this.cueRail.cardArray[i];
                if (card.cardType !== "cue") { continue; }

                if (card.cardId === GameVars.gameData.playerData.equipedCue) {
                    stepsToScrollCard = i;
                    break;
                }
            }
            this.cueRail.scrollStepped(stepsToScrollCard - 2, false);
        }

        private createRail(y: number, cardsInJSON: CardsAssets[], type: string): Rail {

            const cueCards = cardsInJSON.filter(obj => obj.type === type);
            let railObject: Rail;

            if (type === "cue") {
                railObject = new Rail(this.game, cueCards, type);
            } else {
                railObject = new Rail(this.game, cueCards, type);
            }

            railObject.y = y;
            this.railContainer.add(railObject);

            return railObject;
        }

        private onClickBack(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameManager.enterSplash();
        }

        private onClickUnlock(b: Phaser.Button): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameVars.gameData.statistics.rewards.allUnlocked = true;
            RewardsManager.unlockAllCards();
            GameManager.enterEquipment();
            b.visible = false;
        }

        private startSwipe(): void {

            this.clearSwipe();

            if (this.game.input.activePointer.position.y > 110) {

                this.swipingCueRail = this.game.input.activePointer.position.y > 370;

                if (this.swipingCueRail && this.cueRail.tweening) { return; }
                else if (!this.swipingCueRail && this.tableRail.tweening) { return; }

                this.swipeStartPosX = this.game.input.activePointer.position.x;
                this.swiping = true;
            }
        }

        private endSwipe(): void {

            if (!this.swiping) { return; }

            const currentPointerPos = this.game.input.activePointer.position;

            let xDelta = this.swipeStartPosX - currentPointerPos.x;

            let swipeProgress = xDelta / GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
            swipeProgress = Phaser.Math.clamp(swipeProgress, -1, 1);
            swipeProgress = Math.round(swipeProgress);

            if (this.swipingCueRail) {
                this.cueRail.scrollStepped(swipeProgress);
            } else {
                this.tableRail.scrollStepped(swipeProgress);
            }

            this.clearSwipe();
        }

        private clearSwipe(): void {

            this.swipingCueRail = true;
            this.swiping = false;
            this.swipeStartPosX = null;
        }
    }
}
