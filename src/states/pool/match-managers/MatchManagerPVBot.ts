namespace MiniBillar {

    export class MatchManagerPVBot extends MatchManager {

        private static doWriteGameData: boolean;

        private static firstTouchedBall: string;
        private static pocketedBalls: number[];
        private static sidesAlreadyAssigned: boolean;

        public static init(game: Phaser.Game): void {

            super.init(game);

            MatchManagerPVBot.game = game;
            MatchManagerPVBot.doWriteGameData = false;
            MatchManagerPVBot.sidesAlreadyAssigned = false;

            GameManager.validatePocketedBalls();

            GameVars.currentTurn = GameConstants.PLAYER;

            this.game.state.start("PoolState", true, false);
        }

        public static startGame(): void {

            MatchManager.rackBalls();

            if (GameVars.firstShot && GameVars.currentTurn === GameConstants.PLAYER) {

                StageContainer.currentInstance.showSetCueBall("Game start and local player's turn");
                PoolState.currentInstance.showNotificationLayer(GameConstants.NOTIFICATION_NONE, true, false);
            }
            else { PoolState.currentInstance.showNotificationLayer(GameConstants.NOTIFICATION_NONE, false, false); }

            PoolState.currentInstance.hud.focusOnActivePortrait(true);

            StageContainer.currentInstance.setGuideProhibitedBalls([8], true);

            MatchManagerPVBot.firstTouchedBall = GameConstants.BALL_TYPE_NONE;
            MatchManagerPVBot.pocketedBalls = [];

            Billiard.Bot.init(GameConstants.FRICTION,
                GameConstants.BALL_RADIUS,
                GameConstants.POCKET_RADIUS,
                GameConstants.PHYS_SCALE,
                GameConstants.MIN_VELOCITY,
                GameConstants.CUSHION_RESTITUTION,
                GameConstants.BALL_RESTITUTION,
                GameVars.extractLineArrayString(),
                GameVars.extractVertexArrayString(),
                GameVars.extractPocketArrayString(),
                MatchManagerPVBot.calculateBotDifficulty());
        }

        public static update(): void {

            if (GameVars.gameOver) { return; }

            if (!GameVars.shotRunning && !GameVars.turnSet) {

                GameVars.turnSet = true;

                MatchManagerPVBot.ballsStoppedMoving(MatchManagerPVBot.pocketedBalls, MatchManagerPVBot.firstTouchedBall, GameVars.pocketIdWhereBlackFell);
            }
        }

        public static ballPocketed(ball: BallObject): void {

            if (ball.id === 8) {
                RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_BALL_8_POCKETED, data: null });
            }

            PoolState.currentInstance.ballPocketed(ball.id);

            MatchManagerPVBot.pocketedBalls.push(ball.id);

            super.ballPocketed(ball);
        }

        public static newTurn(state: OfflineState): void {

            if (GameVars.gameOver) { return; }

            MatchManagerPVBot.implementStateMessages(state);

            GameVars.firstShot = false;
            GameVars.shotRunning = false;
            GameVars.english = 0;
            GameVars.verticalSpin = 0;

            MatchManagerPVBot.firstTouchedBall = GameConstants.BALL_TYPE_NONE;
            MatchManagerPVBot.pocketedBalls = [];

            MatchManager.setCueAimDirection();

            PoolState.currentInstance.newTurn();
        }

        public static endPVBotGame(reason: string): void {

            GameVars.gameOver = true;
            GameVars.gameEnded = reason;
            GameVars.paused = true;

            if (reason === GameConstants.PLAYER_LOSE) {

                GameVars.gameData.statistics.nonSolo.gamesPlayed++;
                MatchManagerPVBot.doWriteGameData = true;

                super.showLoseLayer();
            }
            else if (reason === GameConstants.PLAYER_WIN) {

                GameVars.gameData.statistics.nonSolo.gamesPlayed++;
                GameVars.gameData.statistics.nonSolo.gamesWon++;
                MatchManagerPVBot.doWriteGameData = true;

                 // API DE MINIJUEGOS
                 miniplaySend2API("wins", 1);

                let victoryData: VictoryData = RewardsManager.prepareRewardStats();
                super.showVictoryLayer(victoryData);
            }
            else if (reason === GameConstants.PLAYER_RESIGNS) { PoolState.currentInstance.endGame(); }

            if (MatchManagerPVBot.doWriteGameData) { GameManager.writeGameData(); }

            // API DE MINIJUEGOS, REGISTRAR CADA PARTIDA JUGADA
            miniplaySend2API("plays", 1);
        }

        public static matchOverDueToResignation(playerResigned: boolean): void {

            if (GameConstants.LOG_BOT_SERVER_INFO) { console.error("matchOverDueToResignation()"); }

            if (playerResigned) { MatchManagerPVBot.endPVBotGame(GameConstants.PLAYER_RESIGNS); }
            else { MatchManagerPVBot.endPVBotGame(GameConstants.PLAYER_WIN); }
        }

        public static setTouchedBall(ballId: number): void {

            if (ballId === 0) { return; }

            if (MatchManagerPVBot.firstTouchedBall === GameConstants.BALL_TYPE_NONE) {

                if (ballId < 8) { MatchManagerPVBot.firstTouchedBall = GameConstants.BALL_TYPE_SOLID; }
                else if (ballId > 8) { MatchManagerPVBot.firstTouchedBall = GameConstants.BALL_TYPE_STRIPED; }
                else { MatchManagerPVBot.firstTouchedBall = GameConstants.BALL_TYPE_BLACK; }
            }
            else { return; }
        }

        public static sendSelectedPocket(pocketId: number): void {

            if (GameVars.currentTurn !== GameConstants.ADVERSARY) {

                RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_POCKET_SELECTED, data: pocketId });

                GameVars.skipShowingPocketAndCue = false;
            }
        }

        public static adversaryCueBallPosition(position: { x: number, y: number }): void {

            if (GameVars.currentTurn === GameConstants.ADVERSARY) {

                let cueBall = <CueBallObject>GameVars.ballArray[0];
                cueBall.setPositionReceived(position.x * GameConstants.PHYS_SCALE, position.y * GameConstants.PHYS_SCALE);
            }
        }

        public static adversaryRotatedCue(cueRotation: number): void {

            if (GameVars.currentTurn === GameConstants.ADVERSARY) {
                CueContainer.currentInstance.moveCue(cueRotation);
            }
        }

        public static showPocketSelected(num: number): void {

            if (GameVars.currentTurn === GameConstants.ADVERSARY) {

                StageContainer.currentInstance.showSelectPocket("Setting pocket rival chose");
                StageContainer.currentInstance.setRivalPocket(num);
                StageContainer.currentInstance.showCue("adversary selected pocket set");
                GameVars.skipShowingPocketAndCue = false;
            }
        }

        public static shotDataReceived(shotData: ShotData): void {

            if (GameVars.currentTurn === GameConstants.ADVERSARY) {

                let shotDataFinal = {

                    vector: new Billiard.Vector2D(shotData.cueSpeed.vx, shotData.cueSpeed.vy),
                    deltaScrew: new Billiard.Vector2D(shotData.deltaScrew.x, shotData.deltaScrew.y),
                    english: shotData.english
                };

                super.forceCueToShoot(shotDataFinal);
            }
        }

        public static ballsStoppedMoving(balls: number[], firstBall: string, blackBallPocket: number): void {

            let data = {
                playerTurn: GameVars.currentTurn === GameConstants.PLAYER,
                balls: balls,
                firstBall: firstBall,
                blackBallPocket: blackBallPocket
            };

            RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_BALLS_STOPPED, data: data });
            if (GameConstants.LOG_BOT_SERVER_INFO) { console.error("sending GameConstants.MESSAGE_TYPE_BALLS_STOPPED"); }
        }

        public static ballHasBeenShot(shotData: ShotData): void {

            RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_SHOT, data: shotData });
            if (GameConstants.LOG_BOT_SERVER_INFO) { console.error("sending GameConstants.MESSAGE_TYPE_SHOT"); }
        }

        public static matchFinished(winnerId: string, delay: number = 0): void {

            if (delay > 0) {

                MatchManagerPVBot.game.time.events.add(Phaser.Timer.SECOND, function (): void {

                    if (GameConstants.LOG_BOT_SERVER_INFO) { console.error("matchFinished()"); }

                    if (GameVars.gameData.playerData.sessionId === winnerId) {

                        MatchManagerPVBot.endPVBotGame(GameConstants.PLAYER_WIN);

                    } else {

                        MatchManagerPVBot.endPVBotGame(GameConstants.PLAYER_LOSE);
                    }

                }, this);
            }
            else {
                if (GameConstants.LOG_BOT_SERVER_INFO) { console.error("matchFinished()"); }

                if (GameVars.gameData.playerData.sessionId === winnerId) {

                    MatchManagerPVBot.endPVBotGame(GameConstants.PLAYER_WIN);

                } else {

                    MatchManagerPVBot.endPVBotGame(GameConstants.PLAYER_LOSE);
                }
            }
        }

        public static cueRotated(cueRotation: number): void {

            RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_CUE_ROTATION, data: cueRotation });
        }

        private static calculateBotDifficulty(): number {

            let base = 3;
            let maximum = 5;

            const played = GameVars.gameData.statistics.nonSolo.gamesPlayed;
            const won = GameVars.gameData.statistics.nonSolo.gamesWon;

            if (played < 3) { return 3; }
            if (played < 7) { maximum = 5; }
            else if (played < 15) { maximum = 7; }
            else { maximum = 9; }

            let additionalDifficulty = (maximum - base) * (won / played);
            let skill = base + additionalDifficulty;

            return skill;
        }

        private static startBotFiringSequence(
            canMoveCueBall: boolean,
            canPocketBlackBall: boolean,
            botBallsType: string,
            botWakeTime: number,
            selectPocketTimeAfterWake: number,
            shootTimeAfterWake: number): void {

            MatchManagerPVBot.game.time.events.add(Phaser.Timer.SECOND * botWakeTime, function (): void {

                if (canMoveCueBall) {
                    let cueBallPos = Billiard.Bot.getCueBallPosition(GameVars.extractBallsArrayString(), botBallsType);
                    RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_CUE_BALL, data: { x: cueBallPos.x, y: cueBallPos.y } });
                }

                const shotData: Billiard.ShotData = Billiard.Bot.getShot(GameVars.extractBallsArrayString(), GameVars.shotCount, botBallsType === GameConstants.BALL_TYPE_NONE ? "" : botBallsType, 20000);
                const deltaScrew = CueContainer.currentInstance.aimDirectionVector.times(
                    new Billiard.Vector2D(shotData.velocity.x, shotData.velocity.y).magnitude *
                    shotData.screw *
                    shotData.verticalSpin);

                if (GameVars.sabotageBot) { shotData.velocity.x = 0; shotData.velocity.y = 0; }

                let shotDataForRulesManager: ShotData = {
                    cueSpeed: { vx: shotData.velocity.x, vy: shotData.velocity.y },
                    deltaScrew: { x: deltaScrew.x, y: deltaScrew.y },
                    english: shotData.english
                };

                MatchManagerPVBot.game.time.events.add(Phaser.Timer.SECOND * selectPocketTimeAfterWake, function (): void {

                    if (canPocketBlackBall) {

                        RulesManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_POCKET_SELECTED, data: shotData.pocket8Ball });
                    }

                    const v = new Billiard.Vector2D(shotData.velocity.x, shotData.velocity.y).normalize();
                    let cueAngle = Math.atan2(-v.y, -v.x);
                    MatchManagerPVBot.cueRotated(cueAngle);

                }, GameManager);

                MatchManagerPVBot.game.time.events.add(Phaser.Timer.SECOND * shootTimeAfterWake, function (): void {

                    MatchManagerPVBot.ballHasBeenShot(shotDataForRulesManager);

                }, GameManager);

            }, GameManager);
        }

        private static implementStateMessages(state: any): void {

            GameVars.skipShowingPocketAndCue = false;

            const isPlayerTurn = GameVars.gameData.playerData.sessionId === state.currentTurn;

            if (state.fault === GameConstants.NOTIFICATION_TIMEOUT) {

                let cueBall = <CueBallObject>GameVars.ballArray[0];
                cueBall.onUpTimeOut();
                CueContainer.currentInstance.onUpTimeOut();
                PoolState.currentInstance.onNonSoloTimeOut(isPlayerTurn);
            }

            let player = GameVars.gameData.playerData.sessionId === state.human.sessionId ? state.human : state.bot;
            let adversary = GameVars.gameData.playerData.sessionId === state.bot.sessionId ? state.human : state.bot;

            if (isPlayerTurn) { GameVars.currentTurn = GameConstants.PLAYER; }
            else { GameVars.currentTurn = GameConstants.ADVERSARY; }

            if (!MatchManagerPVBot.sidesAlreadyAssigned) {

                if (player.typeBalls === GameConstants.BALL_TYPE_SOLID) {

                    PoolState.currentInstance.hud.assignSidesForNonSOLO(GameConstants.BALL_TYPE_SOLID);
                    StageContainer.currentInstance.setGuideProhibitedBalls(
                        [9, 10, 11, 12, 13, 14, 15], true);
                    MatchManagerPVBot.sidesAlreadyAssigned = true;

                } else if (player.typeBalls === GameConstants.BALL_TYPE_STRIPED) {

                    PoolState.currentInstance.hud.assignSidesForNonSOLO(GameConstants.BALL_TYPE_STRIPED);
                    StageContainer.currentInstance.setGuideProhibitedBalls(
                        [1, 2, 3, 4, 5, 6, 7], true);
                    MatchManagerPVBot.sidesAlreadyAssigned = true;
                }
            }

            if (state.ballInHand) { StageContainer.currentInstance.showSetCueBall("Foul commited by non local player"); }

            StageContainer.currentInstance.hideSelectPocket("Not local player's turn or not time to choose pocket");
            PoolState.currentInstance.hud.focusOnActivePortrait(false);

            let opponentChoosingPocket = false;

            if (!isPlayerTurn && adversary.canPocketBlackBall) {

                opponentChoosingPocket = true;
                GameVars.skipShowingPocketAndCue = true;
            }

            PoolState.currentInstance.showNotificationLayer(state.fault, isPlayerTurn, opponentChoosingPocket);

            if (isPlayerTurn && player.canPocketBlackBall) {

                StageContainer.currentInstance.setGuideProhibitedBalls([8], false);
                StageContainer.currentInstance.showSelectPocket("It's time to choose pocket");
                GameVars.skipShowingPocketAndCue = true;
            }

            if (!isPlayerTurn) {

                MatchManagerPVBot.startBotFiringSequence(
                    state.ballInHand, adversary.canPocketBlackBall, adversary.typeBalls,
                    3.6, 1, 2);
            }
        }
    }
}
