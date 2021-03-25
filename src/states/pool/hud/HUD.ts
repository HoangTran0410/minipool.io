namespace MiniBillar {

    export class HUD extends Phaser.Group {

        private playerNameLabel: Phaser.Text;
        private adversaryNameLabel: Phaser.Text;
        private playerAvatarBubble: AvatarBubble;
        private adversaryAvatarBubble: AvatarBubble;
        private ballsSet: Phaser.Image[];
        private timer: Phaser.Text;
        private timerS: Phaser.Text;
        private timerSXOffset: number;
        private turnStartTime: Date;
        private points: Phaser.Text;
        private highscoreLayer: Phaser.Text;
        private vs: Phaser.Image;
        private sumPoints: boolean;
        private counter: number;
        private sumTime: boolean;
        private counterTime: number;
        private pocketedBalls: number[];
        private sidesAssigned: boolean;
        private updateNonSOLOClock: boolean;
        private matchDataContainer: Phaser.Group;
        private playerEmoticonBalloon: EmoticonBalloon;
        private adversaryEmoticonBalloon: EmoticonBalloon;

        private comboText: Phaser.Image;
        private superText: Phaser.Image;
        private comboTextTween1: Phaser.Tween;
        private comboTextTween2: Phaser.Tween;

        constructor(game: Phaser.Game) {

            super(game, null, "hud");

            this.x = GameVars.gameWidth / 2;

            this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            this.sumPoints = false;
            this.counter = 0;

            this.timerSXOffset = 14;

            this.sidesAssigned = false;

            this.sumTime = false;
            this.counterTime = 0;

            this.updateNonSOLOClock = false;

            const hudBg = new Phaser.Image(this.game, 0, 0, "texture_atlas_1", "hudBg.png");
            hudBg.anchor.set(.5, 1);
            hudBg.angle = 180;
            this.add(hudBg);

            this.matchDataContainer = this.game.add.group();
            this.add(this.matchDataContainer);
            this.matchDataContainer.y = -20;

            this.pocketedBalls = [];

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                this.createSoloModeHud();

                this.superText = new Phaser.Image(this.game, 0, GameVars.gameHeight * .4, "texture_atlas_1", "superText.png");
                this.superText.anchor.set(.5);
                this.superText.scale.set(0);
                this.superText.alpha = 0;
                this.add(this.superText);

                this.comboText = new Phaser.Image(this.game, 0, GameVars.gameHeight * .4, "texture_atlas_1", "comboText.png");
                this.comboText.anchor.set(.5);
                this.comboText.scale.set(0);
                this.comboText.alpha = 0;
                this.add(this.comboText);

                this.comboTextTween1 = null;
                this.comboTextTween2 = null;

            } else {

                this.createPlayersInfoBar(GameVars.gameData.playerData, GameVars.adversaryData);

                this.vs = new Phaser.Image(this.game, 0, 65, "texture_atlas_1", "vs.png");
                this.vs.anchor.set(.5);
                this.matchDataContainer.add(this.vs);

                this.createPocketedBallsSetsNonSOLO();

                this.createEmoticonBalloons();
            }
        }

        public start(): void {

            if (GameVars.gameMode !== GameConstants.SOLO_MODE && GameVars.firstShot) {
                this.animatePlayerDataOnStart();

                this.updateNonSOLOClock = true;
                this.turnStartTime = new Date();
            }
        }

        public update(): void {

            super.update();

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                this.updateSoloScore();
            }
            else {

                if (this.updateNonSOLOClock) {

                    if (GameVars.gameOver) {
                        this.updateNonSOLOClock = false;
                    }

                    const currentTime = new Date();
                    const timeDifference = this.turnStartTime.getTime() - currentTime.getTime();
                    const halfSecondsPassedDuringTurn = Math.floor(Math.abs(timeDifference / 500));

                    if (GameVars.currentTurn === GameConstants.PLAYER) {
                        this.playerAvatarBubble.setTimerProgress((GameVars.timerPVP * 2) - halfSecondsPassedDuringTurn);
                    } else {
                        this.adversaryAvatarBubble.setTimerProgress((GameVars.timerPVP * 2) - halfSecondsPassedDuringTurn);
                    }

                    if (GameVars.gameMode === GameConstants.PVBOT_MODE) {
                        if ((GameVars.timerPVP * 1000) + timeDifference < 0) {
                            RulesManager.timeOut();
                        }
                    }
                }
            }
        }

        public newTurn(): void {


            for (let ballId of this.pocketedBalls) { this.updateBallSet(ballId); }

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                this.updateNonSOLOClock = true;
                this.turnStartTime = new Date();
            }

            if (this.sidesAssigned) { this.pocketedBalls = []; }
        }

        public ballPocketed(id?: number): void {

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                this.sumPoints = true;
                if (id !== 0) { this.sumTime = true; }
            }
            else if (id === 8 || id === 0) { return; }

            this.pocketedBalls.push(id);
            this.updateBallSet(id);
        }

        public assignSidesForNonSOLO(leftSideType: string): void {

            this.populateBallSetNonSOLO(leftSideType !== GameConstants.BALL_TYPE_SOLID);
        }

        public focusOnActivePortrait(startingGame: boolean): void {

            const playerTurn = GameVars.currentTurn === GameConstants.PLAYER;

            this.playerAvatarBubble.setAlpha(playerTurn ? 1 : .45);
            this.adversaryAvatarBubble.setAlpha(playerTurn ? .45 : 1);

            if (playerTurn) {
                this.playerAvatarBubble.setTimerProgress(60);
                this.adversaryAvatarBubble.hideTimer(startingGame, true);
                this.playerAvatarBubble.showTimer();
            }
            else {
                this.adversaryAvatarBubble.setTimerProgress(60);
                this.playerAvatarBubble.hideTimer(startingGame, true);
                this.adversaryAvatarBubble.showTimer();
            }
        }

        public hideNonSOLOTimers(): void {

            this.updateNonSOLOClock = false;

            if (this.playerAvatarBubble.visible) {
                this.playerAvatarBubble.hideTimer(false, false);
            }
            if (this.adversaryAvatarBubble.visible) {
                this.adversaryAvatarBubble.hideTimer(false, false);
            }
        }

        public updateBallsHUD(): void {

            this.ballPocketed();
        }

        public updateSoloTimer(): void {

            if (!this.sumTime) {

                this.timer.text = (Math.max(GameVars.timerSolo, 0)) + "";

                this.updateTimerSLabel();

                if (GameVars.timerSolo <= 20) { AudioManager.playEffect(AudioManager.TIME_RUNNING_OUT); } else {
                    AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);
                }
            }
        }

        public stopClock() {

            if (this.updateNonSOLOClock) {
                this.updateNonSOLOClock = false;
            }
        }

        public showEmoticon(emoticonID: number, isPlayer: boolean): void {

            if (isPlayer) {
                this.playerEmoticonBalloon.showEmoticon(emoticonID);
            } else {
                this.adversaryEmoticonBalloon.showEmoticon(emoticonID);
            }
        }

        public showComboEffect(delay: number = 0): void {

            this.comboTextTween1 = this.game.add.tween(this.comboText.scale)
                .to({ x: 1, y: 1 }, 600, Phaser.Easing.Elastic.Out, true, delay);

            this.comboTextTween1.onStart.add(function (): void {
                this.createExplosionArray(this.comboText.x, this.comboText.y+50, 10);
            }, this);

            this.game.add.tween(this.comboText)
                .to({ alpha: 1 }, 400, Phaser.Easing.Cubic.Out, true)
                .onComplete.add(function (): void {
                    this.comboTextTween2 = this.game.add.tween(this.comboText)
                        .to({ alpha: 0 }, 400, Phaser.Easing.Cubic.Out, true, 1800)
                        .onComplete.add(function (): void {
                            this.comboText.scale.set(0);
                        }, this);
                }, this);
        }

        public showSuperComboEffect(delay: number): void {

            this.game.add.tween(this.superText.scale)
                .to({ x: 1, y: 1 }, 600, Phaser.Easing.Elastic.Out, true, delay);

            if (this.comboTextTween1) {
                this.comboTextTween1.pendingDelete = true;
            }
            if (this.comboTextTween2) {
                this.comboTextTween2.pendingDelete = true;
            }


            let tween = this.game.add.tween(this.superText);
            tween.to({ alpha: 1 }, 400, Phaser.Easing.Cubic.Out, true, delay);
            tween.onStart.add(function (): void {

                this.showComboEffect(600);

                this.createExplosionArray(this.superText.x, this.superText.y-30, 10);


            }, this);
            tween.onComplete.add(function (): void {
                this.game.add.tween(this.superText)
                    .to({ alpha: 0 }, 400, Phaser.Easing.Cubic.Out, true, 800)
                    .onComplete.add(function (): void {
                        this.superText.scale.set(0);
                    }, this);
            }, this);
        }

        private createExplosionArray(x: number, y: number, explosionCount: number) {

            const xDelta = 20;
            let startX = -(xDelta * (explosionCount * .5));

            for (let i = 0; i < explosionCount; i++) {

                const sparkleSprite = new Phaser.Sprite(this.game, startX + (i * xDelta), y, "texture_atlas_1");
                sparkleSprite.anchor.set(0.5);
                sparkleSprite.angle = (360 / explosionCount) * i;
                const sparkleFrames = Utils.createAnimFramesArr("sparkle_effect", 14, false, 0, 15);
                sparkleSprite.animations.add("sparkle", sparkleFrames).play(24, false, true);
                this.add(sparkleSprite);
                sparkleSprite.sendToBack();
            }
        }

        private updateBallSet(ballId: number) {

            for (let entry of this.ballsSet) {

                if (entry.frameName === "ball_icon_" + ballId + ".png") {
                    entry.frameName = "ball_icon_0.png";
                }
            }
        }

        private updateSoloScore(): void {

            if (this.sumPoints) {

                let num = parseInt(this.points.text.replace(/,/g, ""));

                if (GameVars.playerPoints > 999999) {
                    this.points.setStyle({ font: "28px Oswald-DemiBold" }, true);

                    if (GameVars.playerPoints > 9999999) {
                        this.points.setStyle({ font: "24px Oswald-DemiBold" }, true);
                    }
                }

                if (num < GameVars.playerPoints) {
                    num++;
                    this.points.text = Utils.validNumber(num) + " pts";
                    this.points.fill = "#1CCE68";

                    if (num > GameVars.gameData.statistics.solo.highScore) {
                        GameVars.gameData.statistics.solo.highScore = num;
                        this.highscoreLayer.text = Utils.validNumber(GameVars.gameData.statistics.solo.highScore);
                    }
                } else if (num > GameVars.playerPoints) {

                    if (this.counter === 3) {
                        num--;
                        this.points.text = Utils.validNumber(num) + " pts";
                        this.points.fill = "#FA2E63";

                        if (num > GameVars.gameData.statistics.solo.highScore) {
                            GameVars.gameData.statistics.solo.highScore = num;
                            this.highscoreLayer.text = Utils.validNumber(GameVars.gameData.statistics.solo.highScore);
                        }

                        this.counter = 0;
                    } else {
                        this.counter++;
                    }
                } else {
                    this.counter = 0;
                    this.sumPoints = false;
                    this.points.fill = "#E5FFFF";
                }
            }

            if (this.sumTime) {

                let num = parseInt(this.timer.text);
                if (num < GameVars.timerSolo) {

                    if (this.counterTime === 3) {
                        num++;
                        this.timer.text = num + "";

                        this.updateTimerSLabel();

                        this.counterTime = 0;
                    } else {
                        this.counterTime++;
                    }
                } else {
                    this.sumTime = false;
                }
            }
        }

        private updateTimerSLabel(): void {

            if (GameVars.timerSolo > 999) {
                this.timerS.x = this.timer.x + this.timerSXOffset * 4;
            }
            else if (GameVars.timerSolo > 99) {
                this.timerS.x = this.timer.x + this.timerSXOffset * 3;
            }
            else if (GameVars.timerSolo > 9) {
                this.timerS.x = this.timer.x + this.timerSXOffset * 2;
            }
            else {
                this.timerS.x = this.timer.x + this.timerSXOffset;
            }
        }

        private createSoloModeHud(): void {

            this.createPocketedBallsSetsSolo();
            this.populateBallSetSolo();

            const nameLine = new Phaser.Image(this.game, -276, 54, "texture_atlas_1", "name_line.png");
            nameLine.anchor.set(0, .5);
            this.matchDataContainer.add(nameLine);

            const playerName = new Phaser.Text(this.game, -261, 58, GameVars.gameData.playerData.nick, { font: "18px Oswald-Medium", fontWeight: "400", fill: "#E5FFFF" });
            playerName.anchor.set(0, 1);
            this.matchDataContainer.add(playerName);

            const avatarBubble = new AvatarBubble(this.game, GameVars.gameData.playerData.avatar, -310, 65, false);
            this.matchDataContainer.add(avatarBubble);

            this.timer = new Phaser.Text(this.game, 0, 76, GameVars.timerSolo.toString(), { font: "44px Oswald-DemiBold", fontWeight: "400", fill: "#E5FFFF" });
            this.timer.anchor.set(0.5, 1);
            this.matchDataContainer.add(this.timer);

            this.timerS = new Phaser.Text(this.game, 0, this.timer.y - 5, "s", { font: "24px Oswald-DemiBold", fontWeight: "400", fill: "#E5FFFF" });
            this.timerS.anchor.set(0, 1);
            this.matchDataContainer.add(this.timerS);
            this.updateTimerSLabel();

            this.points = new Phaser.Text(this.game, 340, 82, Utils.validNumber(GameVars.playerPoints) + " pts", { font: "28px Oswald-DemiBold", fontWeight: "400", fill: "#E5FFFF" });
            this.points.anchor.set(1, .5);
            this.matchDataContainer.add(this.points);

            const highScoreLabel = new Phaser.Text(this.game, 275, 54, "HIGHSCORE:", { font: "21px Oswald-Medium", fontWeight: "400", fill: "#E5FFFF" });
            highScoreLabel.anchor.set(1);
            this.matchDataContainer.add(highScoreLabel);

            this.highscoreLayer = new Phaser.Text(this.game, 340, 54, Utils.validNumber(GameVars.gameData.statistics.solo.highScore), { font: "21px Oswald-Medium", fontWeight: "400", fill: "#E5FFFF" });
            this.highscoreLayer.anchor.set(1);
            this.matchDataContainer.add(this.highscoreLayer);
        }

        private createPlayersInfoBar(playerData: Player, adversaryData: Player): void {

            // player
            this.playerNameLabel = new Phaser.Text(this.game, -125, 39, playerData.nick, { font: "18px Oswald-Medium", fontWeight: "400", fill: "#E5FFFF" });
            this.playerNameLabel.anchor.set(1, 0.5);
            this.matchDataContainer.add(this.playerNameLabel);

            const playerNameLine = new Phaser.Image(this.game, -110, 52, "texture_atlas_1", "name_line.png");
            playerNameLine.anchor.set(0, .5);
            playerNameLine.scale.x *= -1;
            this.matchDataContainer.add(playerNameLine);

            this.playerAvatarBubble = new AvatarBubble(this.game, playerData.avatar, - 80, 63, true);
            this.matchDataContainer.add(this.playerAvatarBubble);

            const currentCuePlayer = new Phaser.Image(this.game, -440, 63, "texture_atlas_5", GameVars.gameData.playerData.equipedCue + "_sprite_0.png");
            currentCuePlayer.scale.set(.8, .8);
            currentCuePlayer.anchor.set(1, .5);
            currentCuePlayer.angle = 180;
            this.matchDataContainer.add(currentCuePlayer);

            const cueMaskPlayer = new Phaser.Graphics(this.game);
            cueMaskPlayer.beginFill(0xffffff);
            cueMaskPlayer.drawRect(-355, 0, -100, 200);
            this.add(cueMaskPlayer);
            currentCuePlayer.mask = cueMaskPlayer;

            // adversary
            const adversaryName = adversaryData.nick;
            this.adversaryNameLabel = new Phaser.Text(this.game, 125, 39, adversaryName, { font: "18px Oswald-Medium", fontWeight: "400", fill: "#E5FFFF", align: "center" });
            this.adversaryNameLabel.anchor.set(0, 0.5);
            this.matchDataContainer.add(this.adversaryNameLabel);

            const adversaryNameLine = new Phaser.Image(this.game, 110, 52, "texture_atlas_1", "name_line.png");
            adversaryNameLine.anchor.set(0, .5);
            this.matchDataContainer.add(adversaryNameLine);

            this.adversaryAvatarBubble = new AvatarBubble(this.game, adversaryData.avatar, 80, 63, true);
            this.matchDataContainer.add(this.adversaryAvatarBubble);

            const currentCueAdversary = new Phaser.Image(this.game, 440, 63, "texture_atlas_5", adversaryData.equipedCue + "_sprite_0.png");
            currentCueAdversary.scale.set(.8, .8);
            currentCueAdversary.anchor.set(1, .5);
            this.matchDataContainer.add(currentCueAdversary);

            const cueMaskAdversary = new Phaser.Graphics(this.game);
            cueMaskAdversary.beginFill(0xffffff);
            cueMaskAdversary.drawRect(355, 0, 100, 200);
            this.add(cueMaskAdversary);
            currentCueAdversary.mask = cueMaskAdversary;
        }

        private createEmoticonBalloons(): void {

            this.adversaryEmoticonBalloon = new EmoticonBalloon(this.game, false);
            this.adversaryEmoticonBalloon.x = 26;
            this.adversaryEmoticonBalloon.y = 112;
            this.matchDataContainer.add(this.adversaryEmoticonBalloon);

            this.playerEmoticonBalloon = new EmoticonBalloon(this.game, true);
            this.playerEmoticonBalloon.x = -26;
            this.playerEmoticonBalloon.y = 112;
            this.matchDataContainer.add(this.playerEmoticonBalloon);
        }

        private createPocketedBallsSetsSolo(): any {

            this.ballsSet = [];

            let x = -250;

            for (let i = 0; i < 15; i++) {

                let ballSocket = new Phaser.Image(this.game, x, 80, "texture_atlas_1", "ball_icon_0.png");
                ballSocket.anchor.set(0.5);
                this.matchDataContainer.add(ballSocket);
                this.ballsSet.push(ballSocket);

                x += 30;
            }
        }

        private createPocketedBallsSetsNonSOLO(): any {

            this.ballsSet = [];

            const distanceFromCenterX = 327;
            let x = -distanceFromCenterX;
            const distBetweenBalls = 32;

            for (let i = 0; i < 15; i++) {

                if (i === 7) { x *= -1; } else {

                    let ballSocket = new Phaser.Image(this.game, x, 74, "texture_atlas_1", "ball_icon_0.png");
                    ballSocket.anchor.set(0.5);
                    this.matchDataContainer.add(ballSocket);
                    this.ballsSet.push(ballSocket);

                }
                x += distBetweenBalls;
            }
        }

        private animatePlayerDataOnStart(): void {

            this.playerNameLabel.scale.set(0);
            this.playerNameLabel.alpha = 0;

            this.game.add.tween(this.playerNameLabel.scale)
                .to({ y: 1, x: 1 }, 300, Phaser.Easing.Cubic.Out, true, 500);

            this.game.add.tween(this.playerNameLabel)
                .to({ alpha: 1 }, 300, Phaser.Easing.Cubic.Out, true, 500);

            // VS
            this.vs.scale.y = 0;
            this.game.add.tween(this.vs.scale)
                .to({ y: 1 }, 300, Phaser.Easing.Elastic.Out, true, 1300);

            // ADVERSARY
            this.adversaryNameLabel.scale.set(0);
            this.adversaryNameLabel.alpha = 0;

            this.game.add.tween(this.adversaryNameLabel.scale)
                .to({ y: 1, x: 1 }, 300, Phaser.Easing.Cubic.Out, true, 2100);

            this.game.add.tween(this.adversaryNameLabel)
                .to({ alpha: 1 }, 300, Phaser.Easing.Cubic.Out, true, 2100);
        }

        private populateBallSetNonSOLO(sidesInverted: boolean): void {

            this.sidesAssigned = true;

            let imageId = sidesInverted ? 9 : 1;

            for (let i = 0; i < 14; i++) {

                this.ballsSet[i].frameName = "ball_icon_" + imageId + ".png";

                // skip black ball number or reset to ball 1 if sides inverted
                if (i === 6) {
                    if (sidesInverted) {
                        imageId = 0;
                    } else { imageId++; }

                }

                imageId++;
            }
        }

        private populateBallSetSolo(): void {

            let imageId = 1;

            for (let i = 0; i < 15; i++) {

                this.ballsSet[i].frameName = "ball_icon_" + imageId + ".png";
                imageId++;
            }
        }
    }
}
