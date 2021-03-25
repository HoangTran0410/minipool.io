declare interface OfflineBall {
    id: number;
    active: boolean;
}

declare interface OfflineState {
    currentTurn: string;
    changeTurn: boolean;
    numberShots: number;
    ballInHand: boolean;
    pocketSelected: number;
    human: Player;
    bot: Player;
    fault: string;
    balls: OfflineBall[];
    playerLeft: boolean;
    winnerSessionId: string;
}

namespace MiniBillar {

    export class RulesManager {

        private static offlineState: OfflineState;

        public static init(playerData: Player, botData: Player) {

            RulesManager.offlineState = ({
                human: null,
                bot: null,
                currentTurn: null,
                changeTurn: false,
                numberShots: 0,
                balls: [],
                ballInHand: true,
                pocketSelected: -1,
                fault: GameConstants.NOTIFICATION_NONE,
                playerLeft: false,
                winnerSessionId: null
            });

            for (let i = 0; i < 16; i++) {
                let ball: OfflineBall = { id: i, active: true };
                RulesManager.offlineState.balls.push(ball);
            }

            RulesManager.setupPlayerAndBot(playerData, botData);
        }

        public static sendMessage(message: Message): void {

            RulesManager.onMessage(message);
        }

        public static onMessage(message: any): void {

            switch (message.type) {

                case GameConstants.MESSAGE_TYPE_BALLS_STOPPED:

                    RulesManager.offlineState.human.ballsMoving = false;

                    RulesManager.updateState(message.data);

                    RulesManager.decideTurn();

                    if (!RulesManager.offlineState.winnerSessionId) { GameManager.onPVBotTurnChange(RulesManager.offlineState); }
                    else { MatchManagerPVBot.matchFinished(this.offlineState.winnerSessionId); }

                    break;

                case GameConstants.MESSAGE_TYPE_POCKET_SELECTED:

                    RulesManager.offlineState.pocketSelected = message.data;

                    MatchManagerPVBot.showPocketSelected(message.data);

                    break;

                case GameConstants.MESSAGE_TYPE_CUE_ROTATION:

                    MatchManagerPVBot.adversaryRotatedCue(message.data);

                    break;

                case GameConstants.MESSAGE_TYPE_CUE_BALL:

                    MatchManagerPVBot.adversaryCueBallPosition(message.data);

                    break;

                case GameConstants.MESSAGE_TYPE_SHOT:

                    RulesManager.offlineState.human.ballsMoving = true;
                    RulesManager.offlineState.bot.ballsMoving = true;
                    MatchManagerPVBot.shotDataReceived(message.data);

                    break;

                case GameConstants.MESSAGE_TYPE_BALL_8_POCKETED:

                    if (!RulesManager.offlineState.human.canPocketBlackBall && !RulesManager.offlineState.bot.canPocketBlackBall) {

                        // acabar la partida inmediatamente
                        if (RulesManager.offlineState.currentTurn === RulesManager.offlineState.human.sessionId) {
                            RulesManager.offlineState.winnerSessionId = RulesManager.offlineState.bot.sessionId;
                        } else {
                            RulesManager.offlineState.winnerSessionId = RulesManager.offlineState.human.sessionId;
                        }

                        MatchManagerPVBot.matchFinished(RulesManager.offlineState.winnerSessionId, 2);
                        
                        // para no declarar el ganador 2 veces
                        RulesManager.offlineState.winnerSessionId = null;
                    }

                    break;

                default:
            }
        }

        public static timeOut(): void {

            RulesManager.offlineState.changeTurn = true;
            RulesManager.offlineState.ballInHand = true;

            RulesManager.offlineState.fault = GameConstants.NOTIFICATION_TIMEOUT;
            RulesManager.offlineState.pocketSelected = -1;

            RulesManager.decideTurn();

            GameManager.onPVBotTurnChange(RulesManager.offlineState);
        }

        private static setupPlayerAndBot(playerData: any, botData: any): void {

            RulesManager.offlineState.human = playerData;
            RulesManager.offlineState.bot = botData;

            RulesManager.offlineState.currentTurn = RulesManager.offlineState.human.sessionId;
            RulesManager.offlineState.numberShots += 1;
        }

        private static updateState(data: any): void {

            let balls = data.balls;
            let firstBallTouch = data.firstBall;
            let blackBallPocket = data.blackBallPocket;

            let player;

            if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                player = this.offlineState.human;
            } else {
                player = this.offlineState.bot;
            }

            let fault = false;
            let typeFault = GameConstants.NOTIFICATION_NONE;

            // NO TOUCH BALL
            if (firstBallTouch === GameConstants.BALL_TYPE_NONE) {
                fault = true;
                typeFault = GameConstants.NOTIFICATION_NO_BALL_TOUCHED;
            }

            // TOUCH BLACK BALL
            if (firstBallTouch === GameConstants.BALL_TYPE_BLACK && !player.canPocketBlackBall) {
                fault = true;
                typeFault = GameConstants.NOTIFICATION_WRONG_BALL_TOUCHED;
            }

            // TOUCH WRONG BALL
            if (firstBallTouch === GameConstants.BALL_TYPE_SOLID && player.typeBalls === GameConstants.BALL_TYPE_STRIPED) {
                fault = true;
                typeFault = GameConstants.NOTIFICATION_WRONG_BALL_TOUCHED;
            }

            if (firstBallTouch === GameConstants.BALL_TYPE_STRIPED && player.typeBalls === GameConstants.BALL_TYPE_SOLID) {
                fault = true;
                typeFault = GameConstants.NOTIFICATION_WRONG_BALL_TOUCHED;
            }

            // POCKET WRONG BALL
            for (let i = 0; i < balls.length; i++) {
                if (balls[i] === 0) {
                    fault = true;
                    typeFault = GameConstants.NOTIFICATION_CUE_BALL_POTTED;
                } else if (balls[i] === 8 && !player.canPocketBlackBall) {
                    fault = true;
                    typeFault = GameConstants.NOTIFICATION_WRONG_BALL_POTTED;
                } else if (balls[i] < 8 && player.typeBalls === GameConstants.BALL_TYPE_STRIPED) {
                    fault = true;
                    typeFault = GameConstants.NOTIFICATION_WRONG_BALL_POTTED;
                } else if (balls[i] > 8 && player.typeBalls === GameConstants.BALL_TYPE_SOLID) {
                    fault = true;
                    typeFault = GameConstants.NOTIFICATION_WRONG_BALL_POTTED;
                }
            }

            // POCKET BALL

            let pocketBall = false;
            let win = -1;

            for (let i = 0; i < balls.length; i++) {
                if (balls[i] === 0) {
                    continue;
                } else if (balls[i] < 8 && player.typeBalls === GameConstants.BALL_TYPE_SOLID) {
                    pocketBall = true;
                } else if (balls[i] > 8 && player.typeBalls === GameConstants.BALL_TYPE_STRIPED) {
                    pocketBall = true;
                } else if (balls[i] !== 8 && player.typeBalls === GameConstants.BALL_TYPE_NONE) {
                    pocketBall = true;
                } else if (balls[i] === 8) {
                    if (player.canPocketBlackBall) {
                        if (fault) {
                            win = 0;
                        } else {
                            if (this.offlineState.pocketSelected === blackBallPocket) {
                                win = 1;
                            } else {
                                win = 0;
                            }

                        }
                    } else {
                        win = 0;
                    }
                }
            }

            if (win !== -1) {
                if (win === 0) {
                    if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                        this.offlineState.winnerSessionId = this.offlineState.bot.sessionId;
                    } else {
                        this.offlineState.winnerSessionId = this.offlineState.human.sessionId;
                    }
                } else if (win === 1) {
                    if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                        this.offlineState.winnerSessionId = this.offlineState.human.sessionId;
                    } else {
                        this.offlineState.winnerSessionId = this.offlineState.bot.sessionId;
                    }
                }

            }

            // SELECT TYPE BALLS

            if (player.typeBalls === GameConstants.BALL_TYPE_NONE && !fault) {

                let solidBalls = 0;
                let stripedBalls = 0;

                for (let i = 0; i < balls.length; i++) {

                    if (balls[i] === 0 || balls[i] === 8) {
                        continue;
                    } else if (balls[i] < 8) {
                        solidBalls++;
                    } else if (balls[i] > 8) {
                        stripedBalls++;
                    }
                }

                if (solidBalls > 0 && stripedBalls === 0) {
                    if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                        this.offlineState.human.typeBalls = GameConstants.BALL_TYPE_SOLID;
                        this.offlineState.bot.typeBalls = GameConstants.BALL_TYPE_STRIPED;
                    } else {
                        this.offlineState.bot.typeBalls = GameConstants.BALL_TYPE_SOLID;
                        this.offlineState.human.typeBalls = GameConstants.BALL_TYPE_STRIPED;
                    }
                } else if (stripedBalls > 0 && solidBalls === 0) {
                    if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                        this.offlineState.bot.typeBalls = GameConstants.BALL_TYPE_SOLID;
                        this.offlineState.human.typeBalls = GameConstants.BALL_TYPE_STRIPED;
                    } else {
                        this.offlineState.human.typeBalls = GameConstants.BALL_TYPE_SOLID;
                        this.offlineState.bot.typeBalls = GameConstants.BALL_TYPE_STRIPED;
                    }
                }

            }

            // UPDATE STATE

            if (fault) {
                this.offlineState.changeTurn = true;
                this.offlineState.ballInHand = true;
            } else {
                if (pocketBall) {
                    this.offlineState.changeTurn = false;
                } else {
                    this.offlineState.changeTurn = true;
                }
                this.offlineState.ballInHand = false;
            }

            this.offlineState.fault = typeFault;
            this.offlineState.pocketSelected = -1;

            // UPDATE BALLS

            for (let i = 0; i < balls.length; i++) {
                for (let j = 0; j < this.offlineState.balls.length; j++) {
                    if (balls[i] === this.offlineState.balls[j].id) {
                        this.offlineState.balls[j].active = false;

                        if (this.offlineState.balls[j].id === 0) {
                            this.offlineState.balls[j].active = true;
                        }
                    }
                }
            }

            // UPDATE CAN PUT BLACK BALL

            this.offlineState.bot.canPocketBlackBall = RulesManager.canPocketBlackBall(this.offlineState.bot.typeBalls);
            this.offlineState.human.canPocketBlackBall = RulesManager.canPocketBlackBall(this.offlineState.human.typeBalls);
        }

        private static decideTurn(): void {

            if (this.offlineState.changeTurn) {
                if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                    this.offlineState.currentTurn = this.offlineState.bot.sessionId;
                } else {
                    this.offlineState.currentTurn = this.offlineState.human.sessionId;
                }
            } else {
                if (this.offlineState.currentTurn === this.offlineState.human.sessionId) {
                    this.offlineState.currentTurn = this.offlineState.human.sessionId;
                } else {
                    this.offlineState.currentTurn = this.offlineState.bot.sessionId;
                }
            }

            this.offlineState.numberShots += 1;
        }

        private static canPocketBlackBall(typeBalls: string): boolean {

            let result = true;

            for (let i = 0; i < RulesManager.offlineState.balls.length; i++) {

                if (RulesManager.offlineState.balls[i].id === 0 || RulesManager.offlineState.balls[i].id === 8) {
                    continue;
                }

                if (!RulesManager.offlineState.balls[i].active) {
                    continue;
                }

                if (typeBalls === GameConstants.BALL_TYPE_NONE) {
                    result = false;
                } else if (typeBalls === GameConstants.BALL_TYPE_SOLID) {
                    if (RulesManager.offlineState.balls[i].id < 8) {
                        result = false;
                    }
                } else if (typeBalls === GameConstants.BALL_TYPE_STRIPED) {
                    if (RulesManager.offlineState.balls[i].id > 8) {
                        result = false;
                    }
                }
            }

            return result;
        }
    }
}
