namespace MiniBillar {

    export class MatchManagerPVP extends MatchManager {

        private static doWriteGameData: boolean;

        private static firstTouchedBall: string;
        private static pocketedBalls: number[];
        private static sidesAlreadyAssigned: boolean;

        public static init(game: Phaser.Game, currentTurnPlayer_SessionId: string): void {

            super.init(game);

            MatchManagerPVP.game = game;
            MatchManagerPVP.doWriteGameData = false;
            MatchManagerPVP.sidesAlreadyAssigned = false;

            if (!GameVars.gameData.playerData) { console.error("playerData corrupt"); }
            if (!GameVars.adversaryData) { console.error("adversaryData corrupt"); }

            GameManager.validatePocketedBalls();

            if (GameVars.gameData.playerData.sessionId === currentTurnPlayer_SessionId) {

                GameVars.currentTurn = GameConstants.PLAYER;

            } else {

                GameVars.currentTurn = GameConstants.ADVERSARY;
            }

            this.game.state.start("PoolState", true, false);
        }

        public static startGame(): void {

            MatchManager.rackBalls(Communication.CommunicationManager.room.id);

            if (GameVars.firstShot && GameVars.currentTurn === GameConstants.PLAYER) {

                StageContainer.currentInstance.showSetCueBall("Game start and local player's turn");
                PoolState.currentInstance.showNotificationLayer(GameConstants.NOTIFICATION_NONE, true, false);
            }
            else { PoolState.currentInstance.showNotificationLayer(GameConstants.NOTIFICATION_NONE, false, false); }

            PoolState.currentInstance.hud.focusOnActivePortrait(true);

            StageContainer.currentInstance.setGuideProhibitedBalls([8], true);

            MatchManagerPVP.firstTouchedBall = GameConstants.BALL_TYPE_NONE;
            MatchManagerPVP.pocketedBalls = [];
        }

        public static update(): void {

            if (GameVars.gameOver) { return; }

            if (!GameVars.shotRunning && !GameVars.turnSet) {

                GameVars.turnSet = true;

                MatchManagerPVP.ballsStoppedMoving(MatchManagerPVP.pocketedBalls, MatchManagerPVP.firstTouchedBall, GameVars.pocketIdWhereBlackFell);
            }
        }

        public static ballPocketed(ball: BallObject): void {

            if (ball.id === 8) {
                Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_BALL_8_POCKETED, data: null});
            }

            PoolState.currentInstance.ballPocketed(ball.id);

            MatchManagerPVP.pocketedBalls.push(ball.id);

            super.ballPocketed(ball);
        }

        public static newTurn(state: any): void {

            if (GameVars.gameOver) { return; }

            MatchManagerPVP.implementStateMessages(state);

            GameVars.firstShot = false;
            GameVars.shotRunning = false;
            GameVars.english = 0;
            GameVars.verticalSpin = 0;

            MatchManagerPVP.firstTouchedBall = GameConstants.BALL_TYPE_NONE;
            MatchManagerPVP.pocketedBalls = [];

            GameVars.timerSolo = 20;

            MatchManager.setCueAimDirection();

            PoolState.currentInstance.newTurn();
        }

        public static endPVPGame(reason: string): void {

            GameVars.gameOver = true;
            GameVars.gameEnded = reason;
            GameVars.paused = true;

            if (reason === GameConstants.PLAYER_LOSE) {

                GameVars.gameData.statistics.nonSolo.gamesPlayed++;
                MatchManagerPVP.doWriteGameData = true;

                super.showLoseLayer();

            } else if (reason === GameConstants.PLAYER_WIN) {

                GameVars.gameData.statistics.nonSolo.gamesPlayed++;
                GameVars.gameData.statistics.nonSolo.gamesWon++;
                MatchManagerPVP.doWriteGameData = true;

                // API DE MINIJUEGOS
                miniplaySend2API("wins", 1);

                let victoryData: VictoryData = RewardsManager.prepareRewardStats();
                super.showVictoryLayer(victoryData);
            }
            else if (reason === GameConstants.PLAYER_RESIGNS) { PoolState.currentInstance.endGame(); }
            else if (reason === GameConstants.ADVERSARY_LEFT_ROOM) { super.showAdversaryLeftLayer(); }

            if (MatchManagerPVP.doWriteGameData) { GameManager.writeGameData(); }

            // API DE MINIJUEGOS, REGISTRAR CADA PARTIDA JUGADA
            miniplaySend2API("plays", 1);
        }

        public static matchOverDueToResignation(resigningPlayerSessionId: string): void {

            Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_RESIGN, data: GameVars.gameData.playerData.sessionId });

            Communication.CommunicationManager.leaveRoom();

            if (GameConstants.LOG_SERVER_INFO) { 
                console.error("matchOverDueToResignation()"); 
            }

            if (GameVars.gameData.playerData.sessionId === resigningPlayerSessionId) {
                MatchManagerPVP.endPVPGame(GameConstants.PLAYER_RESIGNS);
            } else {
                MatchManagerPVP.endPVPGame(GameConstants.PLAYER_WIN);
            }
        }

        public static adversaryLeftRoomPVP(): void {

            GameManager.log("ADVERSARY LEFT ROOM");

            if (GameVars.gameOver || GameVars.gameMode === GameConstants.PVBOT_MODE) {
                return;
            }

            if (LobbyState.currentInstance) {
                GameManager.enterSplash();
            }

            if (GameConstants.LOG_SERVER_INFO) { console.error("adversaryLeftRoomPVP()"); }

            MatchManagerPVP.endPVPGame(GameConstants.ADVERSARY_LEFT_ROOM);
        }

        public static setTouchedBall(ballId: number): void {

            if (ballId === 0) { return; }

            if (MatchManagerPVP.firstTouchedBall === GameConstants.BALL_TYPE_NONE) {

                if (ballId < 8) { MatchManagerPVP.firstTouchedBall = GameConstants.BALL_TYPE_SOLID; }
                else if (ballId > 8) { MatchManagerPVP.firstTouchedBall = GameConstants.BALL_TYPE_STRIPED; }
                else { MatchManagerPVP.firstTouchedBall = GameConstants.BALL_TYPE_BLACK; }
            }
            else { return; }
        }

        public static setTouchedCushion(touchedCushion: boolean): void {

            /*  MatchManagerPVP.rulesPacket.addEvent(MatchEvent.ANY_CUSHION_TOUCHED);*/
        }

        public static sendCueBallPosition(x: number, y: number): void {

            if (GameVars.currentTurn !== GameConstants.ADVERSARY) {

                Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_CUE_BALL, data: { x: x, y: y } });
            }
        }

        public static sendSelectedPocket(pocketId: number): void {

            if (GameVars.currentTurn !== GameConstants.ADVERSARY) {

                Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_POCKET_SELECTED, data: pocketId });

                GameVars.skipShowingPocketAndCue = false;
            }
        }

        public static adversaryCueBallPosition(position: { x: number, y: number }): void {

            if (GameVars.currentTurn === GameConstants.ADVERSARY) {

                let cueBall = <CueBallObject>GameVars.ballArray[0];
                cueBall.setPositionReceived(position.x, position.y);
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

        public static cueRotated(cueRotation: number): void {

            Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_CUE_ROTATION, data: cueRotation });
        }

        public static ballsStoppedMoving(balls: number[], firstBall: string, blackBallPocket: number): void {

            let data = {
                playerTurn: GameVars.currentTurn === GameConstants.PLAYER,
                balls: balls,
                firstBall: firstBall,
                blackBallPocket: blackBallPocket
            };

            Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_BALLS_STOPPED, data: data });
            if (GameConstants.LOG_SERVER_INFO) { console.error("sending GameConstants.MESSAGE_TYPE_BALLS_STOPPED"); }
        }

        public static ballHasBeenShot(shotData: ShotData): void {

            Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_SHOT, data: shotData });
            if (GameConstants.LOG_SERVER_INFO) { console.error("sending GameConstants.MESSAGE_TYPE_SHOT"); }
        }

        public static matchFinished(winnerId: string): void {

            this.game.time.events.add(650, Communication.CommunicationManager.leaveRoom, Communication.CommunicationManager);

            if (GameConstants.LOG_SERVER_INFO) { console.error("matchFinished()"); }

            if (GameVars.gameData.playerData.sessionId === winnerId) {

                MatchManagerPVP.endPVPGame(GameConstants.PLAYER_WIN);

            } else {

                MatchManagerPVP.endPVPGame(GameConstants.PLAYER_LOSE);
            }
        }

        public static playerSet(): void {

            Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_PLAYER_SET, data: null });
            if (GameConstants.LOG_SERVER_INFO) { console.error("sending GameConstants.MESSAGE_TYPE_PLAYER_SET"); }
        }

        private static implementStateMessages(state: any): void {

            if (!state.playerA || !state.playerB) {
                return;
            }

            GameVars.skipShowingPocketAndCue = false;

            const isPlayerTurn = GameVars.gameData.playerData.sessionId === state.currentTurn;

            if (state.fault === GameConstants.NOTIFICATION_TIMEOUT) {

                let cueBall = <CueBallObject>GameVars.ballArray[0];
                cueBall.onUpTimeOut();
                CueContainer.currentInstance.onUpTimeOut();
                PoolState.currentInstance.onNonSoloTimeOut(isPlayerTurn);
            }

            let player = GameVars.gameData.playerData.sessionId === state.playerA.sessionId ? state.playerA : state.playerB;
            let adversary = GameVars.gameData.playerData.sessionId === state.playerB.sessionId ? state.playerA : state.playerB;

            if (isPlayerTurn) { GameVars.currentTurn = GameConstants.PLAYER; }
            else { GameVars.currentTurn = GameConstants.ADVERSARY; }

            if (!MatchManagerPVP.sidesAlreadyAssigned) {

                if (player.typeBalls === GameConstants.BALL_TYPE_SOLID) {

                    PoolState.currentInstance.hud.assignSidesForNonSOLO(GameConstants.BALL_TYPE_SOLID);
                    StageContainer.currentInstance.setGuideProhibitedBalls(
                        [9, 10, 11, 12, 13, 14, 15], true);
                    MatchManagerPVP.sidesAlreadyAssigned = true;

                } else if (player.typeBalls === GameConstants.BALL_TYPE_STRIPED) {

                    PoolState.currentInstance.hud.assignSidesForNonSOLO(GameConstants.BALL_TYPE_STRIPED);
                    StageContainer.currentInstance.setGuideProhibitedBalls(
                        [1, 2, 3, 4, 5, 6, 7], true);
                    MatchManagerPVP.sidesAlreadyAssigned = true;
                }
            }

            if (state.ballInHand && StageContainer.currentInstance) {

                StageContainer.currentInstance.showSetCueBall("Foul commited by non local player"); 
            }

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
        }
    }
}
