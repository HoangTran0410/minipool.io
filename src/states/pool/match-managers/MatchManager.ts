namespace MiniBillar {

    export class MatchManager {

        public static game: Phaser.Game;
        public static gameOver: boolean;

        public static init(game: Phaser.Game, sessionId?: string): void {

            MatchManager.game = game;

            GameVars.gameOver = false;

            GameVars.english = 0;
            GameVars.verticalSpin = 0;
            GameVars.turnSet = true;
            GameVars.draggingCueBall = false;
            GameVars.pocketIdWhereBlackFell = -1;
        }

        public static update(): void {

            if (!GameVars.startMatch || !GameVars.ballArray) { 
                return; 
            }

            GameVars.shotRunning = false;

            for (let i = 0, ln = GameVars.ballArray.length; i < ln; i++) {

                let ball = GameVars.ballArray[i];

                if (ball.active && ball.velocity.magnitudeSquared > 0) {

                    GameVars.shotRunning = true;
                    break;
                }
            }

            const cueBall = GameVars.ballArray[0];

            if (cueBall.mc.pocketTween) {
                GameVars.shotRunning = true;
            }

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                MatchManagerSolo.update();
            } else if (GameVars.gameMode === GameConstants.PVP_MODE) {
                MatchManagerPVP.update();
            } else if (GameVars.gameMode === GameConstants.PVBOT_MODE) {
                MatchManagerPVBot.update();
            }
        }

        public static showPauseLayer(): void {

            PoolState.currentInstance.pauseGame();
        }

        public static hideNotificationLayer(): void {

            PoolState.currentInstance.hideNotificationLayer();
        }

        public static hidePauseLayer(): void {

            PoolState.currentInstance.resumeGame();
        }

        public static showSoloRetryLayer(): void {

            PoolState.currentInstance.showSoloRetryLayer();
        }

        public static hideRetryLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.hideRetryLayer();
            }
        }

        public static showVictoryLayer(victoryData?: VictoryData): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.showVictoryLayer(victoryData);
            }
        }

        public static hideVictoryLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.hideVictoryLayer();
            }
        }

        public static showLoseLayer(victoryData?: VictoryData): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.showLoseLayer();
            }
        }

        public static hideLoseLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.hideLoseLayer();
            }
        }

        public static showAdversaryLeftLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.showAdversaryLeftLayer();
            }
        }

        public static hideAdversaryLeftLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.hideAdversaryLeftLayer();
            }
        }
        
        public static ballHasBeenShot(shotData?: ShotData): void {

            GameVars.shotRunning = true;
            GameVars.turnSet = false;
            GameVars.shotCount++;
            PoolState.currentInstance.gui.disableSpinButton();

            StageContainer.currentInstance.ballHasBeenShot();

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                PoolState.currentInstance.hideNonSOLOTimers();

                if (GameVars.currentTurn !== GameConstants.ADVERSARY) {
                    if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.ballHasBeenShot(shotData); }
                    else if (GameVars.gameMode === GameConstants.PVBOT_MODE) { MatchManagerPVBot.ballHasBeenShot(shotData); }
                }
            }
        }

        public static reset(): void {

            GameVars.paused = false;
            GameVars.rematch = true;

            if (GameVars.gameMode === GameConstants.SOLO_MODE) { 
                GameManager.enterSoloGame(); 
            }
        }

        public static showSpinCircleLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.showSpinCircleLayer();
            }
        }

        public static hideSpinCircleLayer(english: number, verticalSpin: number): void {

            GameVars.english = english;
            GameVars.verticalSpin = verticalSpin;

            PoolState.currentInstance.hideSpinCircleLayer();

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                Communication.CommunicationManager.sendMessage({type: GameConstants.MESSAGE_TYPE_CUE_BALL_SPIN_SET, data: {english: GameVars.english, verticalSpin: GameVars.verticalSpin}});
            }
        }

        public static resetSpinCircleLayer(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.resetSpinCircleLayer();
            }
        }

        public static ballPocketed(ball: BallObject): void {

            const id = ball.id;

            if (GameVars.gameMode === GameConstants.SOLO_MODE) { 
                PoolState.currentInstance.hud.ballPocketed(id); 
            }

            if (id !== 0) {

                StageContainer.currentInstance.addBallToTrail(ball);
                GameVars.pocketedBalls.push(id);
            }
        }

        public static setRedPointPosition(): void {

            if (PoolState.currentInstance) {
                PoolState.currentInstance.gui.setRedPointPosition();
            }
        }

        public static setCueAimDirection(): void {

            CueContainer.currentInstance.aimDirectionVector = new Billiard.Vector2D(-Math.cos(CueContainer.currentInstance.rotation), -Math.sin(CueContainer.currentInstance.rotation));
        }

        public static forceCueToShoot(shotData: any): void {

            CueContainer.currentInstance.shootReceived(shotData.vector, shotData.deltaScrew, shotData.english);
        }

        public static savePosition(velocity?: Billiard.Vector2D, deltaScrew?: Billiard.Vector2D, english?: number): void {

            GameVars.ballsData.length = 0;

            for (let i = 0; i < GameVars.ballArray.length; i++) {

                let ballData: BallData = { id: GameVars.ballArray[i].id, active: GameVars.ballArray[i].active, x: GameVars.ballArray[i].position.x, y: GameVars.ballArray[i].position.y };
                GameVars.ballsData.push(ballData);
            }

            let ballsData: BallData[] = [];

            for (let i = 0; i < GameVars.ballsData.length; i++) {

                let ball = GameVars.ballsData[i];
                let newBall: BallData = { id: ball.id, x: ball.x, y: ball.y, active: ball.active };

                if (ball.id === 0 && ball.active === false) {

                    newBall.x = GameConstants.BALLS_INITIAL_POSITIONS[0][0];
                    newBall.y = GameConstants.BALLS_INITIAL_POSITIONS[0][1];
                }

                ballsData.push(newBall);
            }
        }

        public static cueBallSet(x: number, y: number): void {

            if (GameVars.gameMode === GameConstants.PVP_MODE) { 
                MatchManagerPVP.sendCueBallPosition(x, y); 
            }

            StageContainer.currentInstance.newTurn();
        }

        public static pocketSelected(pocketId: number): void {

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                if (GameVars.gameMode === GameConstants.PVP_MODE) { 
                    MatchManagerPVP.sendSelectedPocket(pocketId); 
                }
                else if (GameVars.gameMode === GameConstants.PVBOT_MODE) { 
                    MatchManagerPVBot.sendSelectedPocket(pocketId); 
                }
            }
        }

        public static rackBalls(rndSeed?: string): void {

            let seed = rndSeed || Billiard.Maths.fixNumber(Math.random()).toString();

            const prng = new Phaser.RandomDataGenerator([(seed).toString()]);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                // si es una nueva partida usar el seed que pasa el servidor

                GameVars.ballArray = [];

                let ballIndexes = [2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];

                // la 0, 1 y la 8
                let cueBallObject: CueBallObject;
                cueBallObject = new CueBallObject(this.game, 0, GameConstants.BALLS_INITIAL_POSITIONS_SOLO[0][0], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[0][1]);
                GameVars.ballArray.push(cueBallObject);

                let ballObject: BallObject;
                ballObject = new BallObject(this.game, 1, GameConstants.BALLS_INITIAL_POSITIONS_SOLO[1][0], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[1][1], true);
                GameVars.ballArray.push(ballObject);

                ballObject = new BallObject(this.game, 8, GameConstants.BALLS_INITIAL_POSITIONS_SOLO[8][0], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[8][1], true);
                GameVars.ballArray.push(ballObject);

                // las de las esquinas, una rayada y otra solida
                // primero la de la esquina superior
                let i = prng.pick(ballIndexes);

                let ballIndexesAux = ballIndexes.slice();

                if (i <= 7) { 
                    ballIndexesAux = ballIndexesAux.splice(6, 7); 
                } else {
                    ballIndexesAux = ballIndexesAux.splice(0, 6);
                }

                let j = prng.pick(ballIndexesAux);

                ballObject = new BallObject(this.game, i, GameConstants.BALLS_INITIAL_POSITIONS_SOLO[3][0], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[3][1], true);
                GameVars.ballArray.push(ballObject);

                ballObject = new BallObject(this.game, j, GameConstants.BALLS_INITIAL_POSITIONS_SOLO[14][0], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[14][1], true);
                GameVars.ballArray.push(ballObject);

                // quitamos a los elementos con indices i y j del array ballIndexes
                let index = ballIndexes.indexOf(i);
                ballIndexes.splice(index, 1);
                index = ballIndexes.indexOf(j);
                ballIndexes.splice(index, 1);

                ballIndexes = Utils.shuffle(ballIndexes, prng);

                index = 0;

                for (let i = 0; i < GameConstants.BALLS_INITIAL_POSITIONS_SOLO.length; i++) {

                    if (i !== 0 && i !== 1 && i !== 8 && i !== 3 && i !== 14) {

                        ballObject = new BallObject(this.game, ballIndexes[index], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[i][0], GameConstants.BALLS_INITIAL_POSITIONS_SOLO[i][1], true);
                        GameVars.ballArray.push(ballObject);
                        index++;
                    }
                }

                for (let i = 0; i < GameVars.ballArray.length; i++) {

                    ballObject = GameVars.ballArray[i];
                    let x = ballObject.position.x + 0.05 * Billiard.Maths.fixNumber(prng.frac());
                    let y = ballObject.position.y + 0.05 * Billiard.Maths.fixNumber(prng.frac());
                    ballObject.position = new Billiard.Vector2D(x, y);
                }

                for (let i = 0; i < GameVars.ballArray.length; i++) {

                    let ballData: BallData = { id: GameVars.ballArray[i].id, active: true, x: GameVars.ballArray[i].position.x, y: GameVars.ballArray[i].position.y };
                    GameVars.ballsData.push(ballData);
                }
            } else {

                GameVars.ballArray = [];

                for (let i = 0; i < GameConstants.BALLS_INITIAL_POSITIONS.length; i++) {

                    if (i === 0) {

                        let cueBallObject: CueBallObject;
                        cueBallObject = new CueBallObject(this.game, i, GameConstants.BALLS_INITIAL_POSITIONS[i][0], GameConstants.BALLS_INITIAL_POSITIONS[i][1]);
                        GameVars.ballArray.push(cueBallObject);
                    } else {

                        let ballObject = new BallObject(this.game, i, GameConstants.BALLS_INITIAL_POSITIONS[i][0], GameConstants.BALLS_INITIAL_POSITIONS[i][1], true);
                        let x = ballObject.position.x + 0.05 * Billiard.Maths.fixNumber(prng.frac());
                        let y = ballObject.position.y + 0.05 * Billiard.Maths.fixNumber(prng.frac());
                        ballObject.position = new Billiard.Vector2D(x, y);
                        GameVars.ballArray.push(ballObject);
                    }
                }
            }
        }

        public static showAdversaryEmoticon(emoticonID: number): void {
            
            PoolState.currentInstance.showAdversaryEmoticon(emoticonID);
        }

        public static emoticonSelected(emoticonID: number): void {

            if (!GameVars.playersSetForPVBot) {
                Communication.CommunicationManager.sendMessage({type: GameConstants.MESSAGE_TYPE_EMOTICON_SELECTED, data: emoticonID});
            }
           
            PoolState.currentInstance.emoticonSelected(emoticonID);
        }

        public static cueBallSpinSet(data: {english: number, verticalSpin: any}): void {

            const english = data.english;
            const verticalSpin = data.verticalSpin;

            PoolState.currentInstance.gui.cueBallSpinButton.setRedPointPosition(english, verticalSpin);
        }
    }
}
