namespace MiniBillar {

    export class VictoryLayer extends Phaser.Group {

        private animStarBox: AnimatedStarBox;
        private rewardCardContainer: RewardCardContainer;
        private buttonHome: Phaser.Button;
        private buttonRestart: Phaser.Button;
        private buttonNewRival: Phaser.Button;
        private endGamePortraitContainer: EndGamePortraitContainer;

        constructor(game: Phaser.Game) {

            super(game, null, "victory-layer");

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .6;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            this.endGamePortraitContainer = new EndGamePortraitContainer(game, "you_win.png", true);
            this.add(this.endGamePortraitContainer);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                this.buttonRestart = new Phaser.Button(this.game, GameVars.gameWidth / 2 + 50 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickReset, this);
                this.buttonRestart.setFrames("btn_restart_pressed.png", "btn_restart.png", "btn_restart_pressed.png");
                this.buttonRestart.anchor.set(.5);
                if (this.game.device.touch) {
                    this.buttonRestart.onInputDown.add(function () { this.buttonRestart.scale.set(this.buttonRestart.scale.x * 1.1, this.buttonRestart.scale.y * 1.1); }, this);
                }
                this.buttonRestart.onInputOver.add(function () { this.buttonRestart.scale.set(this.buttonRestart.scale.x * 1.1, this.buttonRestart.scale.y * 1.1); }, this);
                this.buttonRestart.onInputOut.add(function () { this.buttonRestart.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
                this.buttonRestart.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(this.buttonRestart);

            } else {

                this.buttonNewRival = new Phaser.Button(this.game, GameVars.gameWidth / 2 + 50 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickNewRival, this);
                this.buttonNewRival.setFrames("btn_new_rival_pressed.png", "btn_new_rival.png", "btn_new_rival_pressed.png");
                this.buttonNewRival.anchor.set(.5);
                if (this.game.device.touch) {
                    this.buttonNewRival.onInputDown.add(function () { this.buttonNewRival.scale.set(this.buttonNewRival.scale.x * 1.1, this.buttonNewRival.scale.y * 1.1); }, this);
                }
                this.buttonNewRival.onInputOver.add(function () { this.buttonNewRival.scale.set(this.buttonNewRival.scale.x * 1.1, this.buttonNewRival.scale.y * 1.1); }, this);
                this.buttonNewRival.onInputOut.add(function () { this.buttonNewRival.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
                this.buttonNewRival.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(this.buttonNewRival);
            }

            this.buttonHome = new Phaser.Button(this.game, GameVars.gameWidth / 2 - 120 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickHome, this);
            this.buttonHome.setFrames("btn_close_pressed.png", "btn_close.png", "btn_close_pressed.png");
            this.buttonHome.anchor.set(.5);
            if (this.game.device.touch) {
                this.buttonHome.onInputDown.add(function () { this.buttonHome.scale.set(this.buttonHome.scale.x * 1.1, this.buttonHome.scale.y * 1.1); }, this);
            }
            this.buttonHome.onInputOver.add(function () { this.buttonHome.scale.set(this.buttonHome.scale.x * 1.1, this.buttonHome.scale.y * 1.1); }, this);
            this.buttonHome.onInputOut.add(function () { this.buttonHome.scale.set(1, 1); }, this);
            this.buttonHome.forceOut = true;
            this.buttonHome.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(this.buttonHome);

            AudioManager.playMusic(AudioManager.WIN);

            if (!GameVars.gameData.statistics.rewards.allUnlocked) {

                this.animStarBox = new AnimatedStarBox(game);
                this.animStarBox.y = 475;
                this.animStarBox.x = GameVars.gameWidth * 0.5;
                this.animStarBox.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(this.animStarBox);

                this.rewardCardContainer = new RewardCardContainer(game);
                this.rewardCardContainer.y = GameVars.gameHeight * 0.5;
                this.rewardCardContainer.x = GameVars.gameWidth * 0.5;
                this.rewardCardContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(this.rewardCardContainer);
            }
        }

        public init(victoryData?: VictoryData) {

            if (!victoryData) { throw "Error reading victory data"; }

            if (victoryData.starUnlocked === 3) {

                this.endGamePortraitContainer.visible = false;
                this.buttonHome.alpha = 0;
                if (this.buttonRestart) { this.buttonRestart.visible = false; }
                if (this.buttonNewRival) { this.buttonNewRival.visible = false; }

                if (this.animStarBox) {
                    this.animStarBox.y = this.buttonHome.y;
                    this.animStarBox.animateGiftBox();
                    this.animStarBox.giftBox.boxOpeningTween.onComplete.add(function (): void {

                        this.rewardCardContainer.createAndDisplayCards(victoryData.recentlyUnlockedCardIds);
                        this.rewardCardContainer.animateCardPointsIncrementation(victoryData.numberOfCardsUnlocked);

                        this.buttonHome.setFrames("btn_back_on.png", "btn_back_off.png", "btn_back_on.png");
                        this.buttonHome.scale.x *= -1;
                        this.buttonHome.anchor.set(.5);
                        this.buttonHome.x = GameVars.gameWidth - 10 + (this.buttonHome.width * .5);
                        this.buttonHome.y = GameVars.gameHeight - 10 - (this.buttonHome.height * .5);

                        this.game.add.tween(this.buttonHome).to({ alpha: 1 }, 250, Phaser.Easing.Cubic.Out, true, 1000)
                            .onComplete.add(function (): void {

                                const pulseTween = this.game.add.tween(this.buttonHome.scale);
                                pulseTween.to({ x: -1.0915 * GameVars.scaleXMult, y: GameVars.scaleYMult }, 300, Phaser.Easing.Linear.None, false);
                                pulseTween.to({ x: -GameVars.scaleXMult, y: 1.0915 * GameVars.scaleYMult }, 700, Phaser.Easing.Elastic.Out);
                                pulseTween.loop();
                                pulseTween.start();

                            }, this);
                    }, this);
                }
            }

            if (this.animStarBox) {
                for (let i = 0; i < 3; i++) {
                    if (i === victoryData.starUnlocked - 1) {
                        this.animStarBox.animateStarToFullScale(i);
                        break;
                    }
                    else { this.animStarBox.setStarActive(i); }
                }
            }
        }

        private onClickReset(b: Phaser.Button): void {

            b.clearFrames();
            GameVars.paused = false;
            GameVars.rematch = true;

            GameManager.enterSoloGame();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickHome(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hideVictoryLayer();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickNewRival(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hideVictoryLayer();
            GameVars.goDirectlyToLobby = true;

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onDownTransparentLayer(): void {
            // 
        }
    }
}
