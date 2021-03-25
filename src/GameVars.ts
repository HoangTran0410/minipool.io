module MiniBillar {

    export class GameVars {

        // general
        public static gameData: GameData;
        public static emoticonsAmount: number;
        public static gameWidth = GameConstants.GAME_WIDTH;
        public static gameHeight = GameConstants.GAME_HEIGHT;

        // display
        public static scaleX_DO_NOT_USE_OUTSIDE_BOOT: number; // use scaleXMult or scaleXMultInverse instead
        public static correctionScale_DO_NOT_USE_OUTSIDE_BOOT: number; // use scaleYMult or scaleYMultInverse instead
        public static scaleXMult: number;
        public static scaleYMult: number;
        public static scaleXMultInverse: number;
        public static scaleYMultInverse: number;

        // pool
        public static shotRunning: boolean;
        public static turnSet: boolean;
        public static skipShowingPocketAndCue: boolean;
        public static canStart: boolean;
        public static english: number;
        public static verticalSpin: number;
        public static wallCollisions: number[];
        public static paused: boolean;
        public static ballArray: BallObject[];
        public static pocketArray: Billiard.Pocket[];
        public static vertexArray: Billiard.Vertex[];
        public static lineArray: Billiard.Line[];
        public static pocketIdWhereBlackFell: number;
        public static draggingCueBall: boolean;
        public static resetScoreAndTime: boolean;
        public static GUIButtonDown: boolean;

        // match data
        public static gameOver: boolean;
        public static shotCount: number;
        public static firstShot: boolean;
        public static gameMode: string;
        public static timerSolo: number;
        public static timerPVP: number;
        public static pocketedBalls: number[];
        public static ballsData: BallData[];
        public static playerPoints: number;
        public static startMatch: boolean;
        public static gameEnded: string;
        public static currentTurn: string;
        public static rematch: boolean;
        public static timeMatch: number;
      
        // dev cheats
        public static laserGuideActive: boolean;
        public static sabotageBot: boolean;

        // multiplayer
        public static adversaryData: Player;
        public static playersSetForPVP: boolean;
        public static goDirectlyToLobby: boolean;

        // bot
        public static playersSetForPVBot: boolean;

        // bot helper functions
        public static extractLineArrayString(): string {

            const lineArray = [];

            for (let i = 0; i < GameVars.lineArray.length; i++) {

                lineArray.push({
                    name: GameVars.lineArray[i].name,
                    direction: { x: GameVars.lineArray[i].direction.x, y: GameVars.lineArray[i].direction.y },
                    normal: { x: GameVars.lineArray[i].normal.x, y: GameVars.lineArray[i].normal.y },
                    p1: { x: GameVars.lineArray[i].p1.x, y: GameVars.lineArray[i].p1.y },
                    p2: { x: GameVars.lineArray[i].p2.x, y: GameVars.lineArray[i].p2.y },
                    p3: { x: GameVars.lineArray[i].p3.x, y: GameVars.lineArray[i].p3.y },
                    p4: { x: GameVars.lineArray[i].p4.x, y: GameVars.lineArray[i].p4.y },
                    p5: { x: GameVars.lineArray[i].p5.x, y: GameVars.lineArray[i].p5.y },
                    p6: { x: GameVars.lineArray[i].p6.x, y: GameVars.lineArray[i].p6.y }
                });
            }

            return JSON.stringify(lineArray);
        }

        public static extractVertexArrayString(): string {

            const vertexArray = [];

            for (let i = 0; i < GameVars.vertexArray.length; i++) {

                vertexArray.push({
                    name: GameVars.vertexArray[i].name,
                    position: { x: GameVars.vertexArray[i].position.x, y: GameVars.vertexArray[i].position.y }
                });
            }

            return JSON.stringify(vertexArray);
        }

        public static extractPocketArrayString(): string {

            const pocketArray = [];

            for (let i = 0; i < GameVars.pocketArray.length; i++) {

                pocketArray.push({
                    id: GameVars.pocketArray[i].id,
                    position: { x: GameVars.pocketArray[i].position.x, y: GameVars.pocketArray[i].position.y },
                    dropPosition: { x: GameVars.pocketArray[i].dropPosition.x, y: GameVars.pocketArray[i].dropPosition.y },
                });
            }

            return JSON.stringify(pocketArray);
        }

        public static extractBallsArrayString(): string {

            const ballsArray = [];

            for (let i = 0; i < GameVars.ballArray.length; i++) {

                ballsArray.push(
                    {
                        id: GameVars.ballArray[i].id,
                        active: GameVars.ballArray[i].active,
                        position: { x: GameVars.ballArray[i].position.x, y: GameVars.ballArray[i].position.y },
                    }
                );
            }

            return JSON.stringify(ballsArray);
        }
    }
}
