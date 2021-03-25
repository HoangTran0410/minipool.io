namespace MiniBillar {

    export class PauseLayer extends Phaser.Group {

        public static currentInstance: PauseLayer;

        private powerLabel: Phaser.Text;

        constructor(game: Phaser.Game) {

            super(game, null, "pause-layer");

            PauseLayer.currentInstance = this;

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .6;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const buttonBack = new Phaser.Button(this.game, 38 * GameVars.scaleXMult, 38 * GameVars.scaleYMult, "texture_atlas_1", this.onClickExit, this);
            buttonBack.setFrames("btn_back_on.png", "btn_back_off.png", "btn_back_on.png", "btn_back_off.png");
            buttonBack.forceOut = true;
            buttonBack.anchor.set(.5);
            if (this.game.device.touch) {
                buttonBack.onInputDown.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            }
            buttonBack.onInputOver.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            buttonBack.onInputOut.add(function () { buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(buttonBack);

            let scaledItemsContainer = new Phaser.Group(this.game);
            scaledItemsContainer.x = GameVars.gameWidth / 2;
            scaledItemsContainer.y = GameVars.gameHeight / 2;
            scaledItemsContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(scaledItemsContainer);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                const restartButton = new Phaser.Button(this.game, 0, -8, "texture_atlas_1", this.onClickReset, this);
                restartButton.setFrames("btn_restart_pressed.png", "btn_restart.png", "btn_restart_pressed.png", "btn_restart.png");
                restartButton.anchor.set(.5);
                restartButton.scale.set(1);
                if (this.game.device.touch) {
                    restartButton.onInputDown.add(function () { restartButton.scale.set(restartButton.scale.x * 1.1, restartButton.scale.y * 1.1); }, this);
                }
                restartButton.onInputOver.add(function () { restartButton.scale.set(restartButton.scale.x * 1.1, restartButton.scale.y * 1.1); }, this);
                restartButton.onInputOut.add(function () { restartButton.scale.set(1); }, this);
                scaledItemsContainer.add(restartButton);

                const soloHomeButton = new Phaser.Button(this.game, 0, 100, "texture_atlas_1", this.onClickSoloHome, this);
                soloHomeButton.setFrames("btn_close_pressed.png", "btn_close.png", "btn_close_pressed.png", "btn_close.png");
                soloHomeButton.anchor.set(.5);
                if (this.game.device.touch) {
                    soloHomeButton.onInputDown.add(function () { soloHomeButton.scale.set(soloHomeButton.scale.x * 1.1, soloHomeButton.scale.y * 1.1); }, this);
                }
                soloHomeButton.onInputOver.add(function () { soloHomeButton.scale.set(soloHomeButton.scale.x * 1.1, soloHomeButton.scale.y * 1.1); }, this);
                soloHomeButton.onInputOut.add(function () { soloHomeButton.scale.set(1); }, this);
                scaledItemsContainer.add(soloHomeButton);

                const rulesText = new Phaser.Text(this.game, 0, 160, GameConstants.RULES_TEXT, { font: this.game.device.desktop ? "24px Oswald-DemiBold" : "34px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center", stroke: "#2f3237", strokeThickness: 3 });
                rulesText.anchor.set(0.5, 0);
                Utils.colourRulesText(rulesText);
                scaledItemsContainer.add(rulesText);

            } else {

                const resignButton = new Phaser.Button(this.game, 0, -8, "texture_atlas_1", this.onClickResign, this);
                resignButton.setFrames("btn_resign_pressed.png", "btn_resign.png", "btn_resign_pressed.png", "btn_resign.png");
                resignButton.anchor.set(.5);
                resignButton.scale.set(1);

                if (this.game.device.touch) {
                    resignButton.onInputDown.add(function () { resignButton.scale.set(resignButton.scale.x * 1.1, resignButton.scale.y * 1.1); }, this);
                }
                resignButton.onInputOver.add(function () { resignButton.scale.set(resignButton.scale.x * 1.1, resignButton.scale.y * 1.1); }, this);
                resignButton.onInputOut.add(function () { resignButton.scale.set(1); }, this);

                scaledItemsContainer.add(resignButton);
            }

            const audioSwitchButton = new SwitchButton(this.game, !GameVars.gameData.musicMuted, SwitchButton.MUSIC);
            audioSwitchButton.x = 30;
            audioSwitchButton.y = -100;
            scaledItemsContainer.add(audioSwitchButton);

            const audioLabel = new Phaser.Text(this.game, -24, audioSwitchButton.y + 2, "AUDIO", { font: "24px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center", stroke: "#2f3237", strokeThickness: 3 });
            audioLabel.anchor.set(1, .5);
            scaledItemsContainer.add(audioLabel);

            if (this.game.device.touch) {

                const switchStartingState = GameVars.gameData.powerBarSide === GameConstants.RIGHT;
                const powerSwitchButton = new SwitchButton(this.game, switchStartingState, SwitchButton.POWER);
                powerSwitchButton.x = 30;
                powerSwitchButton.y = -160;
                scaledItemsContainer.add(powerSwitchButton);

                const powerTextLeft = "POWER BAR: LEFT";
                const powerTextRight = "POWER BAR: RIGHT";
                this.powerLabel = new Phaser.Text(this.game, -24, powerSwitchButton.y + 2, powerTextLeft, { font: "24px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center", stroke: "#2f3237", strokeThickness: 3 });
                this.powerLabel.anchor.set(1, .5);
                scaledItemsContainer.add(this.powerLabel);
                if (GameVars.gameData.powerBarSide === GameConstants.RIGHT) { this.powerLabel.text = powerTextRight; }

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    scaledItemsContainer.y += 100;
                }
            }

            this.alpha = 0;
            this.game.add.tween(this)
                .to({ alpha: 1 }, 400, Phaser.Easing.Cubic.Out, true);
        }

        public changePower(): void {

            const powerTextLeft = "POWER BAR: LEFT";
            const powerTextRight = "POWER BAR: RIGHT";

            if (GameVars.gameData.powerBarSide === GameConstants.LEFT) {
                this.powerLabel.text = powerTextLeft;
            } else {
                this.powerLabel.text = powerTextRight;
            }
        }

        public destroy(): void {

            PauseLayer.currentInstance = null;
            super.destroy();
        }

        private onClickExit(b: Phaser.Button): void {

            b.clearFrames();
            MatchManager.hidePauseLayer();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickResign(b: Phaser.Button): void {

            b.clearFrames();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            MatchManager.hideNotificationLayer();
            MatchManager.hidePauseLayer();

            if (GameVars.gameMode === GameConstants.PVP_MODE) {

                if (GameConstants.LOG_SERVER_INFO) { 
                    console.error("sending GameConstants.MESSAGE_TYPE_RESIGN"); 
                }

                MatchManagerPVP.matchOverDueToResignation(GameVars.gameData.playerData.sessionId);

            } else if (GameVars.gameMode === GameConstants.PVBOT_MODE) {

                if (GameConstants.LOG_BOT_SERVER_INFO) {
                    console.error("sending GameConstants.MESSAGE_TYPE_RESIGN");
                }
                MatchManagerPVBot.matchOverDueToResignation(true);
            }

        }

        private onClickReset(b: Phaser.Button): void {

            b.clearFrames();
            GameVars.paused = false;
            GameVars.rematch = true;

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                GameManager.enterSoloGame();
            }

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickSoloHome(b: Phaser.Button): void {

            b.clearFrames();
            MatchManager.hidePauseLayer();

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                MatchManagerSolo.endSoloGame(GameConstants.PLAYER_RESIGNS);
            }

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onDownTransparentLayer(): void {
            // 
        }
    }
}
