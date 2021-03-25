namespace MiniBillar {

    export class GameManager {

        private static game: Phaser.Game;

        public static init(game: Phaser.Game): void {

            GameManager.game = game;

            Communication.CommunicationManager.init();

            GameManager.communicationFunctionsPVP();

            GameManager.setBilliardConstants();

            GameManager.readGameData();
        }

        public static resetNonSOLOVars(): void {

            if (GameConstants.LOG_SERVER_INFO || GameConstants.LOG_BOT_SERVER_INFO) { console.error("resetNonSOLOVars"); }

            LobbyState.currentInstance = null;

            GameVars.adversaryData = null;

            GameVars.gameData.playerData.ballsMoving = false;
            GameVars.gameData.playerData.canPocketBlackBall = false;
            GameVars.gameData.playerData.id = "";
            GameVars.gameData.playerData.sessionId = "";
            GameVars.gameData.playerData.set = false;
            GameVars.gameData.playerData.typeBalls = GameConstants.BALL_TYPE_NONE;

            GameVars.playersSetForPVP = false;
            GameVars.playersSetForPVBot = false;
        }

        public static communicationFunctionsPVP(): void {

            Communication.CommunicationManager.onPlayerJoined = (players: any, isPlayerA: boolean) => GameManager.onPlayerJoinedPVP(players, isPlayerA);

            Communication.CommunicationManager.startMatch = () => GameManager.startPVPMatch();

            Communication.CommunicationManager.onTurnChange = (state: any) => GameManager.onPVPTurnChange(state);

            Communication.CommunicationManager.matchFinished = (winnerSessionId: string) => MatchManagerPVP.matchFinished(winnerSessionId);

            Communication.CommunicationManager.adversaryLeftRoom = () => MatchManagerPVP.adversaryLeftRoomPVP();

            Communication.CommunicationManager.matchOverDueToResignation = (data: any) => MatchManagerPVP.matchOverDueToResignation(data);

            Communication.CommunicationManager.showPocketSelected = (data: any) => MatchManagerPVP.showPocketSelected(data);

            Communication.CommunicationManager.adversaryRotatedCue = (data: any) => MatchManagerPVP.adversaryRotatedCue(data);

            Communication.CommunicationManager.adversaryCueBallPosition = (data: any) => MatchManagerPVP.adversaryCueBallPosition(data);

            Communication.CommunicationManager.shotDataReceived = (data: any) => MatchManagerPVP.shotDataReceived(data);

            Communication.CommunicationManager.waitingPlayerEnd = () => GameManager.waitingPlayerEndPVP();

            Communication.CommunicationManager.showEmoticon = (data: any) => MatchManager.showAdversaryEmoticon(data);

            Communication.CommunicationManager.cueBallSpinSet = (data: any) => MatchManager.cueBallSpinSet(data);
        }

        public static readGameData(): void {

            GameManager.getGameStorageData(
                GameConstants.SAVED_GAME_DATA_KEY,
                function (gameData: string): void {

                    if (gameData) {
                        GameVars.gameData = JSON.parse(gameData);
                    } else {
                        GameManager.resetGameVars();
                    }

                    GameManager.startGame();
                },
                function (error: Error): void {
                    GameManager.log("error retriving saved game data.", error);
                }
            );
        }

        public static onGameAssetsLoaded(): void {

            AudioManager.init(GameManager.game);

            RewardsManager.init(GameManager.game);
            RewardsManager.loadAndVerifyCards();

            GameVars.goDirectlyToLobby = false;

            // TODO: MOVER TODO A OTRA FUNCION MAS ADELANTE QUE COMPRUEBE CUANTOS PALOS HAY TAMBIEN
            // AVERIGUAR CUANTOS EMOTICONOS HAY

            let cache = <any>this.game.cache;
            let frameNames = cache._cache.image.texture_atlas_5.frameData._frameNames;

            let i = 0;
            while (typeof frameNames["emoticon_" + (i + 1) + ".png"] !== "undefined") {
                i++;
            }

            GameVars.emoticonsAmount = i;

            GameManager.enterSplash();
            // GameManager.enterSoloGame(false);
            // GameManager.enterEquipment();
            // GameManager.enterPortaitSelectionScreen();
        }

        public static exitLobby(): void {

            Communication.CommunicationManager.sendMessage({ type: GameConstants.MESSAGE_TYPE_PLAYER_QUIT_LOBBY, data: null });

            GameManager.enterSplash();
        }

        public static enterSoloGame(enteringFromSplash?: boolean): void {

            enteringFromSplash = enteringFromSplash || false;

            if (enteringFromSplash) {

                lechuck.ads.showInterlevelAd("https://ext.minijuegos.com/video/tags.php?id=mini-pool-io&type=desktop", function () {
                    GameManager.game.paused = true;
                }, function (): void {

                    GameManager.game.paused = false;

                    GameManager.fullscreenFilter(function (): void {

                        GameManager.resetMatchVars();
                        GameVars.gameMode = GameConstants.SOLO_MODE;
                        GameManager.game.state.start("PoolState", true, false);
                    });

                }, function (): void {

                    GameManager.game.paused = false;

                    GameManager.fullscreenFilter(function (): void {

                        GameManager.resetMatchVars();
                        GameVars.gameMode = GameConstants.SOLO_MODE;
                        GameManager.game.state.start("PoolState", true, false);
                    });
                });
            } else {

                GameManager.resetMatchVars();
                GameVars.gameMode = GameConstants.SOLO_MODE;
                GameManager.game.state.start("PoolState", true, false);
            }
        }

        public static enterPVBotGame(): void {

            GameManager.fullscreenFilter(function (): void {

                GameManager.resetMatchVars();
                RulesManager.init(GameVars.gameData.playerData, GameVars.adversaryData);
                GameManager.onPVBotTurnChange(null);
            });
        }

        public static enterPVPGame(): void {

            lechuck.ads.showInterlevelAd("https://ext.minijuegos.com/video/tags.php?id=mini-pool-io&type=desktop", function () {
                GameManager.game.paused = true;
            }, function (): void {

                GameManager.game.paused = false;

                GameManager.fullscreenFilter(function (): void {

                    GameManager.resetMatchVars();

                    const roomCreated = Communication.CommunicationManager.joinRoom(GameVars.gameData.playerData);
                    if (roomCreated) {
                        GameManager.game.state.start("LobbyState", true, false);
                    }
                });

            }, function (): void {

                GameManager.game.paused = false;

                GameManager.fullscreenFilter(function (): void {

                    GameManager.resetMatchVars();

                    const roomCreated = Communication.CommunicationManager.joinRoom(GameVars.gameData.playerData);

                    if (roomCreated) {
                        GameManager.game.state.start("LobbyState", true, false);
                    }
                });
            });
        }

        public static enterEquipment(): void {

            GameManager.game.state.start("EquipmentState", true, false);
        }

        public static enterSplash(): void {

            GameManager.resetNonSOLOVars();

            GameManager.game.state.start("SplashState", true, false);
        }

        public static enterPortraitSelectionScreen(): void {

            GameManager.fullscreenFilter(function (): void {
                GameManager.game.state.start("PlayerRegisteringState", true, false);
            });
        }

        public static writeGameData(): void {

            GameManager.setGameStorageData(

                GameConstants.SAVED_GAME_DATA_KEY,
                GameVars.gameData,
                function (): void {

                    GameManager.log("game data successfully saved");
                },
                function (error: Error): void {

                    GameManager.log("error saving game data", error);
                }
            );
        }

        public static log(text: any, error?: Error, color?: string): void {

            if (!GameConstants.VERBOSE) {
                return;
            }

            if (error) {
                console.error(text + ":", error);
            } else {
                console.log("%c " + text, "color:" + color);
            }
        }

        public static changePowerBar(): void {

            if (GameVars.gameData.powerBarSide === GameConstants.LEFT) {
                GameVars.gameData.powerBarSide = GameConstants.RIGHT;
            } else {
                GameVars.gameData.powerBarSide = GameConstants.LEFT;
            }

            if (PoolState.currentInstance) {
                PoolState.currentInstance.changePowerBar();
            }

            GameManager.writeGameData();
        }

        public static validatePocketedBalls(): void {

            // si la bola esta activa sacarla del array de pocketed balls 
            let ballsToRemoveFromPocketedBalls: number[] = [];

            for (let i = 0; i < GameVars.pocketedBalls.length; i++) {
                let ballId = GameVars.pocketedBalls[i];
                for (let j = 0; j < GameVars.ballsData.length; j++) {
                    let ballData = GameVars.ballsData[j];
                    if (ballData.id === ballId && ballData.active) {
                        ballsToRemoveFromPocketedBalls.push(ballId);
                    }
                }
            }

            if (ballsToRemoveFromPocketedBalls.length > 0) {

                for (let i = ballsToRemoveFromPocketedBalls.length - 1; i >= 0; i--) {

                    let index = GameVars.pocketedBalls.indexOf(ballsToRemoveFromPocketedBalls[i]);
                    GameVars.pocketedBalls.splice(index, 1);
                }
            }

            let ballsToAddToPocketedBalls: number[] = [];

            for (let i = 0; i < GameVars.ballsData.length; i++) {

                let ballData = GameVars.ballsData[i];
                if (!ballData.active) {
                    let needAdd = false;
                    for (let j = 0; j < GameVars.pocketedBalls.length; j++) {

                        let ballId = GameVars.pocketedBalls[j];
                        if (ballId === ballData.id) {
                            needAdd = true;
                            break;
                        }
                    }

                    if (needAdd) { ballsToAddToPocketedBalls.push(ballData.id); }
                }
            }

            if (ballsToAddToPocketedBalls.length > 0) {

                for (let i = ballsToAddToPocketedBalls.length - 1; i >= 0; i--) {

                    GameVars.pocketedBalls.push(ballsToAddToPocketedBalls[i]);
                }
            }
        }

        public static exitFullscreen(): void {

            if (GameManager.game.device.touch && GameManager.game.scale.compatibility.supportsFullScreen) {

                GameManager.game.scale.stopFullScreen();
            }
        }

        public static fullscreenFilter(onSuccess: Function): void {

            const isYabrowser = navigator.userAgent.indexOf("YaBrowser") > -1;
            const isIosOrSafari = GameManager.game.device.iOS && GameManager.game.device.mobileSafari;
            const goAheadWithFullscreen = isYabrowser || (!isYabrowser && !isIosOrSafari);

            // en safari e iOS no activamos el full screen 
            if (GameManager.game.device.touch && GameManager.game.scale.compatibility.supportsFullScreen && goAheadWithFullscreen) {

                const root: any = document.documentElement;
                GameManager.game.scale.fullScreenTarget = root;
                GameManager.game.scale.startFullScreen();

                GameManager.game.time.events.add(0.15 * Phaser.Timer.SECOND, function (): void {

                    GameManager.game.scale.setMinMax(window.innerWidth, window.innerHeight);
                    Boot.onFullScreenChange();
                    onSuccess();

                }, this);
            }
            else {
                onSuccess();
            }
        }

        public static waitingPlayerEndPVP(): void {

            if (GameConstants.LOG_SERVER_INFO) { console.error("waitingPlayerEndPVP()"); }

            if (LobbyState.currentInstance) {

                GameManager.setupBotMatchData();

                LobbyState.currentInstance.fakePlayerFound();
            }
        }

        public static onPVPTurnChange(state: any): void {

            if (GameConstants.LOG_SERVER_INFO) { console.error("onPVPTurnChange()"); }

            if (GameVars.playersSetForPVP) {

                MatchManagerPVP.newTurn(state);
                PoolState.currentInstance.hud.newTurn();
            }
            else {
                GameManager.setPlayer(state.currentTurn);
            }
        }

        public static setupBotMatchData(): void {

            GameVars.adversaryData = {
                nick: this.game.rnd.pick(Utils.getRandomUsernameList()),
                avatar: this.game.rnd.pick(Utils.getRandomAvatarImageList()),
                equipedCue: this.game.rnd.pick(RewardsManager.getCuesList()),
                sessionId: "bot",
                id: "",
                set: false,
                ballsMoving: false,
                typeBalls: GameConstants.BALL_TYPE_NONE,
                canPocketBlackBall: false
            };

            GameVars.gameData.playerData.sessionId = "player";
        }

        public static onPVBotTurnChange(state: any): void {

            if (GameConstants.LOG_BOT_SERVER_INFO) { console.error("onPVBotTurnChange()"); }

            if (GameVars.playersSetForPVBot) {

                MatchManagerPVBot.newTurn(state);
                PoolState.currentInstance.hud.newTurn();
            } else {
                GameVars.playersSetForPVBot = true;
                GameVars.gameMode = GameConstants.PVBOT_MODE;
                MatchManagerPVBot.init(GameManager.game);
            }
        }

        public static setPlayer(currentTurn: string): void {

            GameVars.playersSetForPVP = true;

            GameManager.game.time.events.add(Phaser.Timer.SECOND, function (): void {

                if (LobbyState.currentInstance) {
                    LobbyState.currentInstance.setPlayers();
                }

            }, GameManager);

            GameManager.game.time.events.add(2 * Phaser.Timer.SECOND, function (): void {

                GameVars.gameMode = GameConstants.PVP_MODE;
                MatchManagerPVP.init(GameManager.game, currentTurn);

            }, GameManager);
        }

        public static onPlayerJoinedPVP(players: { playerA: Player, playerB: Player }, isPlayerA: boolean): void {

            if (GameConstants.LOG_SERVER_INFO) { console.error("onPlayerJoinedPVP()"); }

            if (!players.playerB) {

                if (isPlayerA) {
                    GameVars.gameData.playerData.sessionId = players.playerA.sessionId;
                    GameVars.gameData.playerData.id = players.playerA.id;
                }
                else { GameVars.adversaryData = players.playerA; }

            } else {

                if (isPlayerA) { GameVars.adversaryData = players.playerB; } else {
                    GameVars.gameData.playerData.sessionId = players.playerB.sessionId;
                    GameVars.gameData.playerData.id = players.playerB.id;
                }
            }

            // se usa un timer pq con server local el mensaje llega antes de que se haya instanciado el LobbyState
            if (LobbyState.currentInstance) {
                GameManager.game.time.events.add(150, LobbyState.currentInstance.onPlayerJoined, LobbyState.currentInstance);
            } else {
                if (GameConstants.LOG_SERVER_INFO) { console.error("Lobby not ready"); }
            }
        }

        public static avatarSelected(avatarName: string): void {

            GameVars.gameData.playerData.avatar = avatarName;

            PlayerRegisteringState.currentInstance.avatarSelected();

            GameManager.writeGameData();
        }

        public static onItemEquiChange(cardType: string, cardId: string): void {

            if (cardType === "cue") {

                GameVars.gameData.playerData.equipedCue = cardId;
                // LOS LOGROS DE MINIJUEGOS
                miniplaySend2API("cues", parseInt(cardId[cardId.length - 1]));
            } else {

                GameVars.gameData.equippedTable = cardId;
                // LOS LOGROS DE MINIJUEGOS
                miniplaySend2API("tables", parseInt(cardId[cardId.length - 1]));
            }

            GameManager.writeGameData();
        }

        private static startPVPMatch(): void {

            // this method redundant for minibillar. kept for possible future use
            if (GameConstants.LOG_SERVER_INFO) { console.error("startPVPMatch()"); }
        }

        private static startGame(): void {

            GameManager.game.state.start("PreLoader", true, false);
        }

        private static resetGameVars(): void {

            let nonSolo: MultiplayerData = { gamesPlayed: 0, gamesWon: 0, gamesLost: 0 };
            let solo: SoloData = { highScore: 0 };

            // cards set to empty here and populated in loadCards().
            // This was done because resetGameVars() runs before loadCards().
            // loadCards doesn't function until game assets are loaded
            // because the card_data.json must be ready
            let rewards: RewardsData = { starProgress: 0, cards: [], allUnlocked: false };
            let statistics = { nonSolo: nonSolo, solo: solo, rewards: rewards };

            GameVars.gameData = {
                playerData: {
                    nick: "Player",
                    avatar: GameManager.game.rnd.pick(Utils.getRandomAvatarImageList()),
                    equipedCue: "NO_CUE_SELECTED",
                    sessionId: "player",
                    id: "",
                    set: false,
                    ballsMoving: false,
                    typeBalls: GameConstants.BALL_TYPE_NONE,
                    canPocketBlackBall: false
                },
                equippedTable: "NO_TABLE_SELECTED",
                musicMuted: false,
                effectsMuted: false,
                powerBarSide: GameConstants.LEFT,
                statistics: statistics,
                soloTutorial: true,
                multiplayerTutorial: true,
            };

            if (GameConstants.DEVELOPMENT) {
                GameVars.gameData = {
                    playerData: {
                        nick: "Player",
                        avatar: GameManager.game.rnd.pick(Utils.getRandomAvatarImageList()),
                        equipedCue: "NO_CUE_SELECTED",
                        sessionId: "player",
                        id: "",
                        set: false,
                        ballsMoving: false,
                        typeBalls: GameConstants.BALL_TYPE_NONE,
                        canPocketBlackBall: false
                    },
                    equippedTable: "NO_TABLE_SELECTED",
                    musicMuted: false,
                    effectsMuted: false,
                    powerBarSide: GameConstants.RIGHT,
                    statistics: statistics,
                    soloTutorial: true,
                    multiplayerTutorial: true,
                };
            }
        }

        private static resetMatchVars(): void {

            GameVars.gameMode = GameConstants.NO_GAME;
            GameVars.pocketedBalls = [];
            GameVars.ballsData = [];

            this.resetSoloMatchScoreAndTime();

            GameVars.shotCount = 0;
            GameVars.timerPVP = 30;
            GameVars.startMatch = false;
            GameVars.gameEnded = GameConstants.GAME_UNDECIDED;
            GameVars.currentTurn = null;
            GameVars.firstShot = true;
            GameVars.rematch = false;
            GameVars.timeMatch = 0;

            GameVars.paused = false;

            GameVars.shotRunning = false;
            GameVars.turnSet = true;
            GameVars.wallCollisions = [];

            GameVars.english = 0;
            GameVars.verticalSpin = 0;

            GameVars.GUIButtonDown = false;
            GameVars.draggingCueBall = false;
            GameVars.skipShowingPocketAndCue = false;

            GameVars.pocketIdWhereBlackFell = -1;

            GameVars.canStart = false;

            if (GameConstants.DEVELOPMENT) {

                // de manera temporal para testear los iconos de las bolas q faltan por meter
                GameVars.gameMode = GameConstants.NO_GAME;
                GameVars.pocketedBalls = [];
                GameVars.ballsData = [];
                GameVars.startMatch = false;
                GameVars.gameEnded = GameConstants.GAME_UNDECIDED;
                GameVars.currentTurn = null;
                GameVars.firstShot = true;
                GameVars.rematch = false;
                GameVars.timeMatch = 0;
            }
        }

        private static resetSoloMatchScoreAndTime(): void {

            if (GameVars.resetScoreAndTime || (!GameVars.playerPoints && !GameVars.timerSolo)) {
                if (GameConstants.DEVELOPMENT) {
                    GameVars.playerPoints = 0;
                    GameVars.timerSolo = 50;
                } else {
                    GameVars.playerPoints = 0;
                    GameVars.timerSolo = GameConstants.TIME_SOLO_MATCH;
                }
            }

            GameVars.resetScoreAndTime = true;
        }

        private static setBilliardConstants(): void {

            GameVars.pocketArray = [];

            let pocket = { id: 0, position: new Billiard.Vector2D(-42e3 - GameConstants.POCKET_RADIUS / 4, -21e3 - GameConstants.POCKET_RADIUS / 4), dropPosition: new Billiard.Vector2D(-42840 - GameConstants.POCKET_RADIUS / 2, -21840 - GameConstants.POCKET_RADIUS / 4) };
            GameVars.pocketArray.push(pocket);

            pocket = { id: 1, position: new Billiard.Vector2D(0, -21e3 - GameConstants.POCKET_RADIUS), dropPosition: new Billiard.Vector2D(0, -21420 - GameConstants.POCKET_RADIUS) };
            GameVars.pocketArray.push(pocket);

            pocket = { id: 2, position: new Billiard.Vector2D(42e3 + GameConstants.POCKET_RADIUS / 4, -21e3 - GameConstants.POCKET_RADIUS / 4), dropPosition: new Billiard.Vector2D(42840 + GameConstants.POCKET_RADIUS / 2, -21840 - GameConstants.POCKET_RADIUS / 4) };
            GameVars.pocketArray.push(pocket);

            pocket = { id: 3, position: new Billiard.Vector2D(-42e3 - GameConstants.POCKET_RADIUS / 4, 21e3 + GameConstants.POCKET_RADIUS / 4), dropPosition: new Billiard.Vector2D(-42840 - GameConstants.POCKET_RADIUS / 2, 21840 + GameConstants.POCKET_RADIUS / 4) };
            GameVars.pocketArray.push(pocket);

            pocket = { id: 4, position: new Billiard.Vector2D(0, 21e3 + GameConstants.POCKET_RADIUS), dropPosition: new Billiard.Vector2D(0, 21420 + GameConstants.POCKET_RADIUS) };
            GameVars.pocketArray.push(pocket);

            pocket = { id: 5, position: new Billiard.Vector2D(42e3 + GameConstants.POCKET_RADIUS / 4, 21e3 + GameConstants.POCKET_RADIUS / 4), dropPosition: new Billiard.Vector2D(42840 + GameConstants.POCKET_RADIUS / 2, 21840 + GameConstants.POCKET_RADIUS / 4) };
            GameVars.pocketArray.push(pocket);

            GameVars.lineArray = [];
            GameVars.vertexArray = [];

            let line: Billiard.Line = { name: "AB", direction: null, normal: null, p1: new Billiard.Vector2D(-42e3, -24360), p2: new Billiard.Vector2D(-38640, -21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            let vertex = { name: "B", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "BC", direction: null, normal: null, p1: new Billiard.Vector2D(-38640, -21e3), p2: new Billiard.Vector2D(-3360, -21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "C", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "CD", direction: null, normal: null, p1: new Billiard.Vector2D(-3360, -21e3), p2: new Billiard.Vector2D(-1680, -24360), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            line = { name: "EF", direction: null, normal: null, p1: new Billiard.Vector2D(1680, -24360), p2: new Billiard.Vector2D(3360, -21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "F", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "FG", direction: null, normal: null, p1: new Billiard.Vector2D(3360, -21e3), p2: new Billiard.Vector2D(38640, -21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "G", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "GH", direction: null, normal: null, p1: new Billiard.Vector2D(38640, -21e3), p2: new Billiard.Vector2D(42e3, -24360), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            line = { name: "IJ", direction: null, normal: null, p1: new Billiard.Vector2D(45360, -21e3), p2: new Billiard.Vector2D(42e3, -17640), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "J", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "JK", direction: null, normal: null, p1: new Billiard.Vector2D(42e3, -17640), p2: new Billiard.Vector2D(42e3, 17640), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "K", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "KL", direction: null, normal: null, p1: new Billiard.Vector2D(42e3, 17640), p2: new Billiard.Vector2D(45360, 21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            line = { name: "MN", direction: null, normal: null, p1: new Billiard.Vector2D(42e3, 24360), p2: new Billiard.Vector2D(38640, 21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "N", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "NO", direction: null, normal: null, p1: new Billiard.Vector2D(38640, 21e3), p2: new Billiard.Vector2D(3360, 21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "O", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "OP", direction: null, normal: null, p1: new Billiard.Vector2D(3360, 21e3), p2: new Billiard.Vector2D(1680, 24360), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            line = { name: "QR", direction: null, normal: null, p1: new Billiard.Vector2D(-1680, 24360), p2: new Billiard.Vector2D(-3360, 21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "R", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "RS", direction: null, normal: null, p1: new Billiard.Vector2D(-3360, 21e3), p2: new Billiard.Vector2D(-38640, 21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "S", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "ST", direction: null, normal: null, p1: new Billiard.Vector2D(-38640, 21e3), p2: new Billiard.Vector2D(-42e3, 24360), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            line = { name: "UV", direction: null, normal: null, p1: new Billiard.Vector2D(-45360, 21e3), p2: new Billiard.Vector2D(-42e3, 17640), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "V", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "VW", direction: null, normal: null, p1: new Billiard.Vector2D(-42e3, 17640), p2: new Billiard.Vector2D(-42e3, -17640), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            vertex = { name: "W", position: new Billiard.Vector2D(line.p2.x, line.p2.y) };
            GameVars.vertexArray.push(vertex);

            line = { name: "WX", direction: null, normal: null, p1: new Billiard.Vector2D(-42e3, -17640), p2: new Billiard.Vector2D(-45360, -21e3), p3: null, p4: null, p5: null, p6: null };
            GameVars.lineArray.push(line);

            for (let i = 0; i < GameVars.lineArray.length; i++) {

                let line = GameVars.lineArray[i];

                line.direction = new Billiard.Vector2D(line.p2.x - line.p1.x, line.p2.y - line.p1.y).normalize();
                line.normal = line.direction.getLeftNormal();

                let r = line.normal.times(GameConstants.BALL_RADIUS);
                line.p3 = line.p1.plus(r);
                line.p4 = line.p2.plus(r);

                let s = line.normal.times(.525 * GameConstants.BALL_RADIUS); // era .8
                line.p5 = line.p1.plus(s);
                line.p6 = line.p2.plus(s);
            }
        }

        private static getGameStorageData(key: string, successCb: Function, failureCb: Function): void {

            const gameDataStr = localStorage.getItem(key);
            successCb(gameDataStr);
        }

        private static setGameStorageData(key: string, value: any, successCb: Function, failureCb: Function): void {

            localStorage.setItem(key, JSON.stringify(value));
            successCb();
        }
    }
}
