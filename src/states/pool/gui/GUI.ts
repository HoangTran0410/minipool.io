namespace MiniBillar {

    export class GUI extends Phaser.Group {

        public static readonly CUE_BALL_BUTTON_SCALE = .13;

        public forceSettingContainer: ForceSettingContainer;
        public cueBallSpinButton: CueBallSpinButton;

        private chatButton: Phaser.Button;

        constructor(game: Phaser.Game) {

            super(game, null, "gui");

            if (GameConstants.SHOW_DEV_BUTTONS_ON_SOLO && GameVars.gameMode === GameConstants.SOLO_MODE) {

                const winButton = new Phaser.Button(this.game, 920, 25, "texture_atlas_0");
                winButton.anchor.set(1.0, 0.5);
                winButton.inputEnabled = true;
                winButton.events.onInputDown.add(this.onClickForceWin, this);
                winButton.setFrames("btn_force_win_on.png", "btn_force_win_off.png", "btn_force_win_on.png");
                winButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(winButton);

                const loseButton = new Phaser.Button(this.game, 920, 75, "texture_atlas_0");
                loseButton.anchor.set(1.0, 0.5);
                loseButton.inputEnabled = true;
                loseButton.events.onInputDown.add(this.onClickForceLose, this);
                loseButton.setFrames("btn_force_lose_on.png", "btn_force_lose_off.png", "btn_force_lose_on.png");
                loseButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(loseButton);

                const resetButton = new Phaser.Button(this.game, 150, 40, "texture_atlas_0");
                resetButton.anchor.set(1.0, 0.5);
                resetButton.inputEnabled = true;
                resetButton.events.onInputDown.add(this.onClickForceReset, this);
                resetButton.setFrames("btn_menu_on.png", "btn_menu_off.png", "btn_menu_on.png");
                resetButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(resetButton);

            } else if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                this.chatButton = new Phaser.Button(this.game, GameVars.gameWidth / 2 - 40 * GameVars.scaleXMult, 18, "texture_atlas_1", this.onClickChat, this);
                this.chatButton.setFrames("btn_chat_on.png", "btn_chat_off.png", "btn_chat_on.png");
                this.chatButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.chatButton.anchor.set(.5);
                if (this.game.device.touch) {
                    this.chatButton.onInputDown.add(function () {
                        GameVars.GUIButtonDown = true;
                        this.chatButton.scale.set(this.chatButton.scale.x * 1.1, this.chatButton.scale.y * 1.1);
                    }, this, 5);
                }
                this.chatButton.onInputOver.add(function () { this.chatButton.scale.set(this.chatButton.scale.x * 1.1, this.chatButton.scale.y * 1.1); }, this);
                this.chatButton.onInputOut.add(function () { this.chatButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
                this.chatButton.forceOut = true;
                this.add(this.chatButton);

                if (GameConstants.SHOW_PVBOT_CHEAT_BUTTONS && GameVars.gameMode === GameConstants.PVBOT_MODE) {

                    GameVars.laserGuideActive = false;
                    GameVars.sabotageBot = false;

                    const superGuideButton = new Phaser.Button(this.game, 920, 25, "texture_atlas_0");
                    superGuideButton.anchor.set(1.0, 0.5);
                    superGuideButton.inputEnabled = true;
                    superGuideButton.events.onInputDown.add(this.onClickActivateSuperGuide, this);
                    superGuideButton.setFrames("btn_laserGuide_pressed.png", "btn_laserGuide.png", "btn_laserGuide_pressed.png");
                    superGuideButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                    this.add(superGuideButton);

                    const sabotageBotButton = new Phaser.Button(this.game, 920, 75, "texture_atlas_0");
                    sabotageBotButton.anchor.set(1.0, 0.5);
                    sabotageBotButton.inputEnabled = true;
                    sabotageBotButton.events.onInputDown.add(this.onClickActivateSabotageBot, this);
                    sabotageBotButton.setFrames("btn_bot_sabotage_pressed.png", "btn_bot_sabotage.png", "btn_bot_sabotage_pressed.png");
                    sabotageBotButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                    this.add(sabotageBotButton);
                }
            }

            const pauseButton = new Phaser.Button(this.game, 38 * GameVars.scaleXMult, 38 * GameVars.scaleYMult, "texture_atlas_1");
            pauseButton.inputEnabled = true;
            pauseButton.anchor.set(0.5);
            pauseButton.events.onInputUp.add(this.onClickPause, this);
            if (this.game.device.touch) {
                pauseButton.onInputDown.add(function () {
                    GameVars.GUIButtonDown = true;
                    pauseButton.scale.set(pauseButton.scale.x * 1.1, pauseButton.scale.y * 1.1);
                }, this, 5);
            }
            pauseButton.onInputOver.add(function () { pauseButton.scale.set(pauseButton.scale.x * 1.1, pauseButton.scale.y * 1.1); }, this);
            pauseButton.onInputOut.add(function () { pauseButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            pauseButton.setFrames("btn_pause_pressed.png", "btn_pause.png", "btn_pause_pressed.png");
            pauseButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(pauseButton);

            this.cueBallSpinButton = new CueBallSpinButton(this.game);
            this.cueBallSpinButton.x = (GameVars.gameWidth - 37 * GameVars.scaleXMult);
            this.cueBallSpinButton.y = 37 * GameVars.scaleYMult;
            this.add(this.cueBallSpinButton);

            if (this.game.device.touch) {
                this.forceSettingContainer = new ForceSettingContainer(this.game);
                this.add(this.forceSettingContainer);
            } else {
                this.forceSettingContainer = null;
            }
        }

        public setRedPointPosition(english?: number, verticalSpin?: number): void {

            this.cueBallSpinButton.setRedPointPosition(english, verticalSpin);
        }

        public start(): void {

            if (this.game.device.touch) {

                if (this.forceSettingContainer) {

                    if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                        this.forceSettingContainer.reset();
                        this.forceSettingContainer.show();
                    } else if (GameVars.currentTurn === GameConstants.PLAYER) {
                        this.forceSettingContainer.reset();
                        this.forceSettingContainer.show();
                    }
                }
            }

            this.checkCueBallButtonValidity();
        }

        public newTurn(): void {

            if (GameVars.currentTurn === GameConstants.PLAYER) {
                this.cueBallSpinButton.enable();
            } else {
                this.cueBallSpinButton.disable();
            }

            if (this.game.device.touch) {

                if (this.forceSettingContainer) {

                    if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                        this.forceSettingContainer.reset();
                        this.forceSettingContainer.show();
                    } else if (GameVars.currentTurn === GameConstants.PLAYER) {
                        this.forceSettingContainer.reset();
                        this.forceSettingContainer.show();
                    }
                }
            }

            this.checkCueBallButtonValidity();

            MatchManager.resetSpinCircleLayer();
        }

        public disableSpinButton() {

            this.cueBallSpinButton.disable();
        }

        public hideChatButton(): void {

            this.chatButton.visible = false;
        }

        public showChatButton(): void {

            this.chatButton.visible = true;
        }

        private checkCueBallButtonValidity() {

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                if (GameVars.currentTurn === GameConstants.PLAYER) {
                    this.cueBallSpinButton.enable();
                } else {
                    this.cueBallSpinButton.disable();
                }

            } else {

                this.cueBallSpinButton.enable();
            }
        }

        private onClickPause(b: Phaser.Button): void {

            b.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            MatchManager.showPauseLayer();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickForceWin(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                GameVars.playerPoints = GameConstants.MIN_PTS_TO_GET_REWARD + 1;
                MatchManagerSolo.endSoloGame(GameConstants.PLAYER_WIN);
            }
        }

        private onClickForceLose(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                GameVars.playerPoints = 0;
                MatchManagerSolo.endSoloGame(GameConstants.PLAYER_LOSE);
            }
        }

        private onClickForceReset(): void {

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                AudioManager.playEffect(AudioManager.BTN_NORMAL);

                MatchManagerSolo.reset();
            }
        }

        private onClickActivateSuperGuide(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameVars.laserGuideActive = !GameVars.laserGuideActive;
            console.log(GameVars.laserGuideActive ? "Laser cue guide active" : "Laser cue guide inactive");
        }

        private onClickActivateSabotageBot(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameVars.sabotageBot = !GameVars.sabotageBot;
            console.log(GameVars.sabotageBot ? "Bot will fail" : "Bot back to normal");
        }

        private onClickChat(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            this.chatButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            PoolState.currentInstance.showChatLayer();
        }
    }
}
