namespace MiniBillar {

    export class PoolState extends Phaser.State {

        public static currentInstance: PoolState;

        public hud: HUD;
        public gui: GUI;
        public victoryLayer: VictoryLayer;
        public loseLayer: LosePVPLayer;
        public adversaryLeftLayer: AdversaryLeftLayer;

        private arrow: Phaser.Image;
        private arrowOnTween: boolean;
        private stageContainer: StageContainer;
        private pauseLayer: PauseLayer;
        private soloRetryLayer: RetrySoloLayer;
        private spinCircleLayer: SpinCircleLayer;
        private notificationLayer: NotificationLayer;
        private chatLayer: ChatLayer;
        private groupPauseLayers: Phaser.Group;
        private groupMessagesLayer: Phaser.Group;
        private playerSetPVP: boolean;

        public init(): void {

            PoolState.currentInstance = this;

            this.playerSetPVP = false;

            this.victoryLayer = null;
            this.loseLayer = null;
            this.adversaryLeftLayer = null;
            this.notificationLayer = null;
            this.chatLayer = null;

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                MatchManagerSolo.init(this.game);
            }
        }

        public create(): void {

            this.createStage();

            if (GameVars.playerPoints === 0) {
                this.game.camera.flash(0x203161, 750);
            }

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            AudioManager.stopMusic(AudioManager.MUSIC_MINIBILLARD, false);

            this.game.time.events.add(250, function(): void {
                AudioManager.playMusic(AudioManager.MUSIC_MATCH_MINIBILLARD, true);
            }, this);
        }

        public shutdown(): void {

            PoolState.currentInstance = null;

            super.shutdown();
        }

        public update(): void {

            MatchManager.update();

            if (GameVars.gameMode === GameConstants.PVP_MODE) {

                if (!this.playerSetPVP) {
                    MatchManagerPVP.playerSet();
                    this.playerSetPVP = true;
                }
            }

            super.update();
        }

        public createStage(): void {

            const background = this.add.image(GameVars.gameWidth / 2, GameVars.gameHeight / 2, "texture_atlas_2", "background.png");
            background.anchor.set(.5);
            background.scale.set(GameVars.gameWidth / background.width, GameVars.gameHeight / background.height);

            this.stageContainer = new StageContainer(this.game);
            this.add.existing(this.stageContainer);

            this.hud = new HUD(this.game);
            this.add.existing(this.hud);

            this.gui = new GUI(this.game);
            this.add.existing(this.gui);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                this.arrow = new Phaser.Image(this.game, GameVars.gameWidth / 2 + 140, 160, "texture_atlas_1", "timer_up_arrow.png");
                this.arrow.scale.x = GameVars.scaleXMult;
                this.arrow.alpha = 0;
                this.arrow.scale.y = .2;
                this.arrow.anchor.set(.5, 1);
                this.add.existing(this.arrow);

                this.arrowOnTween = false;
            }

            this.groupMessagesLayer = new Phaser.Group(this.game);
            this.add.existing(this.groupMessagesLayer);

            this.groupPauseLayers = new Phaser.Group(this.game);
            this.add.existing(this.groupPauseLayers);

            this.spinCircleLayer = new SpinCircleLayer(this.game);
            this.groupPauseLayers.add(this.spinCircleLayer);

            if (GameVars.startMatch) { throw "Match already started"; }

            if (GameVars.gameMode === GameConstants.SOLO_MODE) { GameVars.timeMatch = Date.now(); }

            this.startGame();
        }

        public startGame(): void {

            if (GameVars.canStart) {
                return;
            }

            GameVars.startMatch = true;
            GameVars.canStart = true;

            if (GameVars.gameMode === GameConstants.SOLO_MODE) { MatchManagerSolo.startGame(); }
            else if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.startGame(); }
            else if (GameVars.gameMode === GameConstants.PVBOT_MODE) { MatchManagerPVBot.startGame(); }
            else if (GameVars.gameMode === GameConstants.NO_GAME) { throw "No game mode selected"; }

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                if (GameVars.gameEnded === GameConstants.GAME_UNDECIDED) {

                    MatchManagerSolo.startSoloTime();

                } else {

                    this.endGame();
                    return;
                }
            }

            this.startStage();
        }

        public ballPocketed(ballId: number): void {

            this.hud.ballPocketed(ballId);
        }

        public updateBallsHUD(): void {

            this.hud.updateBallsHUD();
        }

        public startStage(): void {

            this.stageContainer.start();
            this.hud.start();
            this.gui.start();
        }

        public showSpinCircleLayer(): void {

            this.stageContainer.pauseGame();

            this.spinCircleLayer.show();
        }

        public onNonSoloTimeOut(playerTurn: boolean): void {

            this.hideSpinCircleLayer();

            if (this.game.device.touch && !playerTurn) {
                this.gui.forceSettingContainer.disable();
                this.gui.forceSettingContainer.hide();
            }
        }

        public hideSpinCircleLayer(): void {

            this.stageContainer.resumeGame();

            this.gui.setRedPointPosition();
            this.spinCircleLayer.hide();
        }

        public resetSpinCircleLayer(): void {

            this.spinCircleLayer.reset();
        }

        public pauseGame(): void {

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) { this.hideNotificationLayer(); }

            this.pauseLayer = new PauseLayer(this.game);
            this.groupPauseLayers.add(this.pauseLayer);

            this.stageContainer.pauseGame();
        }

        public resumeGame(): void {

            if (this.pauseLayer) {
                this.pauseLayer.destroy();
            }

            this.stageContainer.resumeGame();
        }

        public showVictoryLayer(victoryData?: VictoryData): void {

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            if (this.pauseLayer) { this.pauseLayer.destroy(); }
            if (this.notificationLayer) {
                this.notificationLayer.destroy();
                this.notificationLayer = null;
            }

            if (this.spinCircleLayer) { this.spinCircleLayer.hide(); }

            this.stageContainer.pauseGame();
            this.gui.visible = false;
            this.hud.stopClock();
            this.stageContainer.hideGuide("Showing victory layer");
            this.stageContainer.hideCue("Showing victory layer");
            this.stageContainer.hideSelectPocket("Showing victory layer");

            PoolState.currentInstance.victoryLayer = new VictoryLayer(this.game);
            PoolState.currentInstance.victoryLayer.init(victoryData);
            this.groupPauseLayers.add(PoolState.currentInstance.victoryLayer);

            if (this.chatLayer) {
                this.hideChatLayer();
            }
        }

        public hideVictoryLayer(): void {

            PoolState.currentInstance.victoryLayer.destroy();
            PoolState.currentInstance.endGame();
        }

        public showLoseLayer(victoryData?: VictoryData): void {

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            if (this.pauseLayer) { this.pauseLayer.destroy(); }

            if (this.notificationLayer) {
                this.notificationLayer.destroy();
                this.notificationLayer = null;
            }

            if (this.spinCircleLayer) { this.spinCircleLayer.hide(); }

            this.stageContainer.pauseGame();
            this.gui.visible = false;
            this.hud.stopClock();
            this.stageContainer.hideGuide("Showing lose layer");
            this.stageContainer.hideCue("Showing lose layer");
            this.stageContainer.hideSelectPocket("Showing lose layer");

            PoolState.currentInstance.loseLayer = new LosePVPLayer(this.game);
            this.groupPauseLayers.add(PoolState.currentInstance.loseLayer);

            if (this.chatLayer) {
                this.hideChatLayer();
            }
        }

        public hideLoseLayer(): void {

            PoolState.currentInstance.loseLayer.destroy();
            this.endGame();
        }

        public showAdversaryLeftLayer(): void {

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            if (this.pauseLayer) { this.pauseLayer.destroy(); }

            if (this.notificationLayer) {
                this.notificationLayer.destroy();
                this.notificationLayer = null;
            }

            if (this.spinCircleLayer) { this.spinCircleLayer.hide(); }

            this.stageContainer.pauseGame();
            this.gui.visible = false;
            this.hud.stopClock();
            this.stageContainer.hideGuide("Showing adversary left layer");
            this.stageContainer.hideCue("Showing adversary left layer");
            this.stageContainer.hideSelectPocket("Showing adversary left layer");
            let cueBall = <CueBallObject>GameVars.ballArray[0];
            cueBall.hideHandIcon();

            PoolState.currentInstance.adversaryLeftLayer = new AdversaryLeftLayer(this.game);
            this.groupPauseLayers.add(PoolState.currentInstance.adversaryLeftLayer);

            if (this.chatLayer) {
                this.hideChatLayer();
            }
        }

        public hideAdversaryLeftLayer(): void {

            PoolState.currentInstance.adversaryLeftLayer.destroy();
            this.endGame();
        }

        public showSoloRetryLayer(): void {

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            if (this.pauseLayer) { this.pauseLayer.destroy(); }
            if (this.spinCircleLayer) { this.spinCircleLayer.hide(); }

            this.stageContainer.pauseGame();
            this.gui.visible = false;
            this.stageContainer.hideGuide("Showing retry layer");
            this.stageContainer.hideCue("Showing retry layer");

            this.soloRetryLayer = new RetrySoloLayer(this.game);
            this.groupPauseLayers.add(this.soloRetryLayer);
        }

        public hideRetryLayer(): void {

            this.stageContainer.resumeGame();
            this.soloRetryLayer.destroy();
        }

        public showNotificationLayer(type: string, isPlayerTurn?: boolean, opponentChoosingPocket?: boolean): void {

            if (this.notificationLayer) {
                this.notificationLayer.destroy();
                this.notificationLayer = null;
            }

            this.notificationLayer = new NotificationLayer(this.game, type, isPlayerTurn, opponentChoosingPocket);
            this.groupMessagesLayer.add(this.notificationLayer);
        }

        public hideNotificationLayer(): void {

            if (this.notificationLayer) {
                this.notificationLayer.destroy();
                this.notificationLayer = null;
            }
        }

        public hideNonSOLOTimers(): void {

            this.hud.hideNonSOLOTimers();
        }

        public endGame(): void {

            GameManager.enterSplash();

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);
            }
        }

        public newTurn(): void {

            this.gui.newTurn();
            this.stageContainer.newTurn();
        }

        public changePowerBar(): void {

            this.pauseLayer.changePower();

            if (this.gui.forceSettingContainer !== null) {
                this.gui.forceSettingContainer.changeSide();
            }

            this.stageContainer.pocketedBallsTrail.changeSide();
        }

        public animArrow(): void {

            if (!this.arrowOnTween) {
                this.arrowOnTween = true;

                this.game.add.tween(this.arrow.scale)
                    .to({ y: 1 }, 400, Phaser.Easing.Cubic.In, true);

                let tweenA = this.game.add.tween(this.arrow)
                    .to({ alpha: 1 }, 400, Phaser.Easing.Cubic.In, true);

                let tweenB = this.game.add.tween(this.arrow)
                    .to({ y: 110, alpha: 0 }, 400, Phaser.Easing.Cubic.Out);

                tweenA.chain(tweenB);

                this.game.time.events.add(900, function (): void {
                    this.arrowOnTween = false;
                    this.arrow.scale.y = .2;
                    this.arrow.y = 160;
                }, this);
            }
        }

        public changePowerBarSide(): void {

            if (this.gui.forceSettingContainer) {
                this.gui.forceSettingContainer.changeSide();
            }
        }

        public showAdversaryEmoticon(emoticonID: number): void {

            this.hud.showEmoticon(emoticonID, false);
        }

        public emoticonSelected(emoticonID: number): void {

            if (this.chatLayer) {
                this.chatLayer.destroy();
                this.chatLayer = null;
            }

            this.hud.showEmoticon(emoticonID, true);
        }

        public onPlayerEmoticonShown(): void {

            this.game.time.events.add(1500, function (): void {
                this.gui.showChatButton();
            }, this);
        }

        public showChatLayer(): void {

            this.gui.hideChatButton();

            this.chatLayer = new ChatLayer(this.game);
            this.add.existing(this.chatLayer);
        }

        public hideChatLayer(): void {

            this.gui.showChatButton();

            this.chatLayer.destroy();
            this.chatLayer = null;
        }
    }
}
