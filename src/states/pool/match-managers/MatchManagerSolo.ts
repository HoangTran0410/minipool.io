namespace MiniBillar {

    export class MatchManagerSolo extends MatchManager {

        private static doWriteGameData: boolean;
        private static currentTurnStreak: number;
        private static comboTicker: number;

        public static init(game: Phaser.Game): void {

            super.init(game);

            MatchManagerSolo.game = game;
            MatchManagerSolo.doWriteGameData = false;
            MatchManagerSolo.currentTurnStreak = 0;
            MatchManagerSolo.comboTicker = 0;
        }

        public static startGame(): void {

            MatchManager.rackBalls();

            GameManager.validatePocketedBalls();

            if (GameVars.gameData.soloTutorial) {

                PoolState.currentInstance.showNotificationLayer(GameConstants.NOTIFICATION_FIRST_TIME_INSTRUCTIONS);
                GameVars.gameData.soloTutorial = false;
                GameManager.writeGameData();
            }
        }

        public static update(): void {

            if (!GameVars.shotRunning && !GameVars.turnSet) {
                this.newTurn();
                MatchManagerSolo.currentTurnStreak = 0;
                MatchManagerSolo.comboTicker = 0;
            }

            if (MatchManagerSolo.comboTicker > 0) {

                MatchManagerSolo.comboTicker -= this.game.time.physicsElapsed;

            } else if (MatchManagerSolo.currentTurnStreak > 0) {
                MatchManagerSolo.currentTurnStreak = 0;
            }
        }

        public static ballPocketed(ball: BallObject): void {

            const id = ball.id;

            if (id === 0) {

                GameVars.playerPoints -= 20;
            } else {

                GameVars.timerSolo += 10;
                GameVars.playerPoints += 50;

                PoolState.currentInstance.animArrow();

                if (MatchManagerSolo.currentTurnStreak === 1) {
                    GameVars.playerPoints += 50;
                    PoolState.currentInstance.hud.showComboEffect(700);
                } else if (MatchManagerSolo.currentTurnStreak >= 2) {
                    GameVars.playerPoints += 50;
                    PoolState.currentInstance.hud.showSuperComboEffect(500);
                }

                MatchManagerSolo.currentTurnStreak++;
                MatchManagerSolo.comboTicker = 3;
            }

            super.ballPocketed(ball);

            if (GameVars.pocketedBalls.length >= 15) {

                let cueBall = <CueBallObject>GameVars.ballArray[0];

                this.game.add.tween(cueBall.mc).to({ alpha: 0 }, 350, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(function (): void {

                        MatchManagerSolo.resetBalls();
                    }, this);

                this.game.add.tween(cueBall.shadow).to({ alpha: 0 }, 350, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(function (): void {

                        MatchManagerSolo.resetBalls();
                    }, this);
            }
        }

        public static newTurn(): void {

            if (GameVars.gameOver) {
                return;
            }

            GameVars.firstShot = false;

            GameVars.shotRunning = false;
            GameVars.turnSet = true;

            GameVars.english = 0;
            GameVars.verticalSpin = 0;

            if (GameVars.pocketedBalls.length >= 15) {
                MatchManagerSolo.resetBalls();
            }

            MatchManager.setCueAimDirection();

            PoolState.currentInstance.newTurn();

            GameVars.ballsData.length = 0;

            for (let i = 0; i < GameVars.ballArray.length; i++) {
                let ballData: BallData = { id: GameVars.ballArray[i].id, active: GameVars.ballArray[i].active, x: GameVars.ballArray[i].position.x, y: GameVars.ballArray[i].position.y };
                GameVars.ballsData.push(ballData);
            }

            GameManager.log("ballData:" + JSON.stringify(GameVars.ballsData));
        }

        public static resetBalls(): void {

            GameVars.pocketedBalls = [];
            GameVars.ballsData = [];
            GameVars.canStart = false;
            GameVars.firstShot = true;
            GameVars.resetScoreAndTime = false;
            GameManager.enterSoloGame();
        }

        public static computeSoloStats(): void {

            if (GameVars.playerPoints > GameVars.gameData.statistics.solo.highScore) {
                GameVars.gameData.statistics.solo.highScore = GameVars.playerPoints;
                MatchManagerSolo.doWriteGameData = true;
            }
        }

        public static endSoloGame(reason: string): void {

            GameVars.gameOver = true;
            GameVars.gameEnded = reason;
            GameVars.paused = true;

            MatchManagerSolo.computeSoloStats();

            if (reason === GameConstants.PLAYER_LOSE) { super.showSoloRetryLayer(); }
            else if (reason === GameConstants.PLAYER_WIN) {

                MatchManagerSolo.doWriteGameData = true;
                let victoryData: VictoryData = RewardsManager.prepareRewardStats();
                super.showVictoryLayer(victoryData);
            }
            else if (reason === GameConstants.PLAYER_RESIGNS) { PoolState.currentInstance.endGame(); }

            if (MatchManagerSolo.doWriteGameData) {
                GameManager.writeGameData();
            }

            miniplaySend2API("score", GameVars.gameData.statistics.solo.highScore);

            if (GameVars.timerSolo === -1) {
                miniplaySend2API("plays", 1);
            }
        }

        public static startSoloTime(): void {

            this.game.time.events.loop(Phaser.Timer.SECOND, function (): void {

                if (GameVars.paused || !GameVars.startMatch) {
                    return;
                }

                GameVars.timerSolo--;
                PoolState.currentInstance.hud.updateSoloTimer();

                if (GameVars.timerSolo === -1) {

                    const rewardEarned = GameVars.playerPoints >= GameConstants.MIN_PTS_TO_GET_REWARD;

                    if (rewardEarned) {
                        this.endSoloGame(GameConstants.PLAYER_WIN);
                    } else {
                        this.endSoloGame(GameConstants.PLAYER_LOSE);
                    }
                }

            }, this);
        }
    }
}
