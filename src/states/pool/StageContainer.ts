namespace MiniBillar {

    export class StageContainer extends Phaser.Group {

        public static currentInstance: StageContainer;

        public static CUSHION_VERTEXES: Billiard.Point[] = [
            new Billiard.Point(-42e3 + GameConstants.BALL_RADIUS, -21e3 + GameConstants.BALL_RADIUS),
            new Billiard.Point(42e3 - GameConstants.BALL_RADIUS, -21e3 + GameConstants.BALL_RADIUS),
            new Billiard.Point(42e3 - GameConstants.BALL_RADIUS, 21e3 - GameConstants.BALL_RADIUS),
            new Billiard.Point(-42e3 + GameConstants.BALL_RADIUS, 21e3 - GameConstants.BALL_RADIUS),
            new Billiard.Point(-42e3 + GameConstants.BALL_RADIUS, -21e3 + GameConstants.BALL_RADIUS)
        ];

        public ballsContainer: BallsContainer;
        public billiardEngine: Billiard.Engine;
        public debugObjectContainer: DebugObjectsContainer;
        public pocketedBallsTrail: PocketedBallsTrail;
        public selectPockets: SelectPockets;

        private tunnelContainer: Phaser.Group;
        private cueContainer: CueContainer;
        private guideContainer: GuideContainer;

        public static onContact(contactEvent: Billiard.ContactEvent): void {

            let ball = contactEvent.ball;

            let contact: Billiard.Contact = {

                collisionType: contactEvent.collisionType,
                type: null,
                target: null,
                targetVelocity: null,
                position: ball.position,
                targetPosition: contactEvent.target.position,
                velocity: null,
                screw: ball.screw,
                deltaScrew: null,
            };

            if (contactEvent.collisionType === Billiard.Engine.BALL) {

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.setTouchedBall(ball.id); }
                    else if (GameVars.gameMode === GameConstants.PVBOT_MODE) { MatchManagerPVBot.setTouchedBall(ball.id); }
                }

                contact.target = contactEvent.target;
                contact.targetVelocity = contactEvent.targetVelocity;
                contact.deltaScrew = contactEvent.deltaScrew;
                contact.type = contactEvent.collisionType;

                ball.contactArray.push(contact);

                const relativeVelocity = contactEvent.ballVelocity.minus(contactEvent.targetVelocity).magnitude;
                let volumeEffect = relativeVelocity / 6e3;
                volumeEffect = volumeEffect > 1 ? 1 : volumeEffect;
                AudioManager.playEffect(AudioManager.BALL_HIT, volumeEffect);

            } else if (contactEvent.collisionType === Billiard.Engine.VERTEX || contactEvent.collisionType === Billiard.Engine.LINE) {

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.setTouchedCushion(true); }
                }

                ball.contactArray.push(contact);

                GameVars.wallCollisions.push(ball.id);

                GameVars.wallCollisions = StageContainer.currentInstance.removeDuplicates(GameVars.wallCollisions);

                const normalVelocity = contactEvent.normalVelocity.magnitude;
                let volumeEffect = normalVelocity / 6e3;
                volumeEffect = volumeEffect > 1 ? 1 : volumeEffect;
                AudioManager.playEffect(AudioManager.CUSHION_HIT, volumeEffect);

            } else if (contactEvent.collisionType === Billiard.Engine.POCKET) {

                ball.active = false;
                ball.contactArray.push(contact);

                const speed = contactEvent.speed;

                if (GameVars.gameMode !== GameConstants.SOLO_MODE || ball.id === 0) {

                    AudioManager.playEffect(AudioManager.POCKET);

                    if (GameVars.gameMode === GameConstants.SOLO_MODE && ball.id === 0) {
                        AudioManager.playEffect(AudioManager.LOSE_POINTS);
                    }

                } else {
                    AudioManager.playEffect(AudioManager.POCKET_ADD_TIME);
                }
                StageContainer.currentInstance.playPocketAnimation(contactEvent);
            }
        }

        constructor(game: Phaser.Game) {

            super(game, null, "stage-container");

            StageContainer.currentInstance = this;

            this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.position.set(GameVars.gameWidth / 2, 365);

            this.pocketedBallsTrail = new PocketedBallsTrail(this.game);
            this.add(this.pocketedBallsTrail);

            this.tunnelContainer = new Phaser.Group(this.game);
            if (GameConstants.DEBUG) {

                this.tunnelContainer.visible = false;
            }
            this.add(this.tunnelContainer);

            const bgName = GameVars.gameData.equippedTable + "_surface.png";

            let tableLayer2 = new Phaser.Image(this.game, 0, 0, "texture_atlas_4", bgName);
            tableLayer2.anchor.set(.5);
            if (GameConstants.DEBUG) { tableLayer2.visible = false; }
            this.add(tableLayer2);

            let tableLayer1 = new Phaser.Graphics(this.game, 0, 0);
            tableLayer1.beginFill(RewardsManager.getTableTunnelColour(GameVars.gameData.equippedTable));
            tableLayer1.drawRect(-tableLayer2.width * 0.446, -tableLayer2.height * 0.426, tableLayer2.width * 0.892, tableLayer2.height * 0.852);
            this.tunnelContainer.add(tableLayer1);

            this.ballsContainer = new BallsContainer(this.game);
            this.add(this.ballsContainer);

            this.guideContainer = new GuideContainer(this.game);
            this.add(this.guideContainer);

            const fgName = GameVars.gameData.equippedTable + "_cushions.png";

            let tableLayer3 = new Phaser.Image(this.game, 0, 0, "texture_atlas_3", fgName);
            tableLayer3.anchor.set(.5);
            if (GameConstants.DEBUG) { tableLayer3.visible = false; }
            this.add(tableLayer3);

            this.selectPockets = new SelectPockets(this.game);
            this.add(this.selectPockets);

            this.cueContainer = new CueContainer(this.game);
            this.add(this.cueContainer);

            if (GameConstants.DEBUG) {

                this.addDebugObjectsContainer();
            } else {

                this.debugObjectContainer = null;
            }
        }

        public update(): void {

            if ((GameVars.paused && GameVars.gameMode === GameConstants.SOLO_MODE) || !GameVars.startMatch) { return; }

            if (GameVars.shotRunning) {

                this.billiardEngine.update();

                for (let i = 0, ln = GameVars.ballArray.length; i < ln; i++) {

                    let ball = GameVars.ballArray[i];

                    if (ball.active && ball.velocity.magnitudeSquared !== 0) {

                        ball.mc.x = ball.position.x * GameConstants.PHYS_SCALE;
                        ball.mc.y = ball.position.y * GameConstants.PHYS_SCALE;

                        ball.shadow.x = ball.mc.x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (ball.mc.x / 300);
                        ball.shadow.y = ball.mc.y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (ball.mc.y / 150);
                        ball.mc.updateRotation(ball.velocity.x * GameConstants.PHYS_SCALE * ball.grip, ball.velocity.y * GameConstants.PHYS_SCALE * ball.grip, ball.ySpin);
                    }
                }
            }

            super.update();
        }

        public start(): void {

            this.billiardEngine = new Billiard.Engine(StageContainer.onContact
                , GameVars.ballArray, GameVars.lineArray, GameVars.vertexArray, GameVars.pocketArray);

            this.billiardEngine.friction = GameConstants.FRICTION;
            this.billiardEngine.ballRadius = GameConstants.BALL_RADIUS;
            this.billiardEngine.pocketRadius = GameConstants.POCKET_RADIUS;
            this.billiardEngine.physScale = GameConstants.PHYS_SCALE;
            this.billiardEngine.minVelocity = GameConstants.MIN_VELOCITY;
            this.billiardEngine.cushionRestitution = GameConstants.CUSHION_RESTITUTION;
            this.billiardEngine.ballRestitution = GameConstants.BALL_RESTITUTION;

            this.ballsContainer.startGame();
            this.pocketedBallsTrail.setPocketedBalls();

            this.showCue("starting match");

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                this.showGuide("your turn");
            } else {

                if (GameVars.currentTurn === GameConstants.PLAYER) {
                    this.showGuide("your turn");

                } else {
                    this.hideGuide("not your turn");
                }
            }
        }

        public pauseGame(): void {

            GameVars.paused = true;

            AudioManager.stopEffect(AudioManager.TIME_RUNNING_OUT);

            this.pocketedBallsTrail.pauseGame();
        }

        public resumeGame(): void {

            GameVars.paused = false;

            this.pocketedBallsTrail.resumeGame();
        }

        public removeDuplicates(arr: number[]) {

            let unique_array = [];
            for (let i = 0; i < arr.length; i++) {

                if (unique_array.indexOf(arr[i]) === -1) {

                    unique_array.push(arr[i]);
                }
            }
            return unique_array;
        }

        public newTurn(): void {

            this.updateCueSprite();
            this.showCue("Stage container new turn");
            this.cueContainer.aimHelper();

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                if (GameVars.currentTurn === GameConstants.PLAYER) { this.showGuide("Stage container new turn and your turn"); }
                else { this.hideGuide("Stage container new turn and not your turn"); }

                if (GameVars.skipShowingPocketAndCue) {
                    this.hideGuide("skipShowingPocket");
                    this.hideCue("skipShowingPocket");
                }

            } else { this.showGuide("Stage container new turn"); }

            this.ballsContainer.newTurn();
        }

        public ballHasBeenShot(): void {

            this.hideCue("Stage container ball has been shot");
            this.hideGuide("Stage container ball has been shot");

            this.ballsContainer.ballHasBeenShot();
            this.selectPockets.resetSelectedPocket();
        }

        public showSetCueBall(reason: string): void {

            if (reason) { GameManager.log("Showing setCueBall because " + reason, null, "purple"); }
            this.ballsContainer.setCueBall();
        }

        public hideGuide(reason: string): void {

            if (reason) { GameManager.log("Hiding guide because " + reason, null, "blue"); }
            this.guideContainer.visible = false;
        }

        public showGuide(reason: string): void {

            if (reason) { GameManager.log("Showing guide because " + reason, null, "orange"); }
            this.guideContainer.visible = true;
        }

        public setGuideProhibitedBalls(ballIds: number[], prohibited: boolean): void {

            this.guideContainer.setGuideProhibitedBalls(ballIds, prohibited);
        }

        public hideCue(reason: string): void {

            if (reason) { GameManager.log("Hiding cue because " + reason, null, "darkblue"); }

            this.cueContainer.hideCue();
        }

        public updateCueSprite(): void {

            this.cueContainer.updateCueSprite();
        }

        public showCue(reason: string): void {

            if (reason) { GameManager.log("Showing cue because " + reason, null, "darkorange"); }

            this.cueContainer.showCueAndUpdatePos();
        }

        public showSelectPocket(reason: string): void {

            if (reason) { GameManager.log("Showing pocket selector because " + reason, null, "green"); }

            this.selectPockets.showSelectPockets();
        }

        public setRivalPocket(pocketId: number) {

            this.selectPockets.setRivalPocket(pocketId);
        }

        public hideSelectPocket(reason: string): void {

            if (reason) { GameManager.log("Hiding pocket selector because " + reason, null, "darkorange"); }

            this.selectPockets.hideSelectPockets();
        }

        public addBallToTrail(ball: BallObject): void {

            this.pocketedBallsTrail.addBall(ball);
        }

        private playPocketAnimation(contactEvent: Billiard.ContactEvent): void {

            let ball = <MiniBillar.BallObject>contactEvent.ball;
            let pocket: Billiard.Pocket = contactEvent.target;
            let speed = contactEvent.speed;

            if (GameVars.gameMode === GameConstants.SOLO_MODE) { MatchManagerSolo.ballPocketed(ball); }
            else {

                if (ball.id === 8) { GameVars.pocketIdWhereBlackFell = pocket.id; }


                if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.ballPocketed(ball); }
                else if (GameVars.gameMode === GameConstants.PVBOT_MODE) { MatchManagerPVBot.ballPocketed(ball); }
            }

            ball.mc.pocketTween = true;

            if (ball.id === 0) { ball.shadow.visible = false; } else {

                ball.shadow.parent.removeChild(ball.shadow);
            }

            let t: number;

            if (speed < 1e3) {
                t = 150;
            } else if (speed < 2e3) {
                t = 120;
            } else if (speed < 3e3) {
                t = 90;
            } else if (speed < 5e3) {
                t = 60;
            } else {
                t = 30;
            }

            this.game.add.tween(ball.mc.scale)
                .to({ x: .925, y: .925 }, t, Phaser.Easing.Cubic.Out, true);

            // para que siga girando dentro del tunel
            ball.velocity = new Billiard.Vector2D((pocket.dropPosition.x - ball.mc.x) / t, (pocket.dropPosition.y - ball.mc.y) / t);

            this.game.add.tween(ball.mc)
                .to({
                    x: pocket.dropPosition.x * GameConstants.PHYS_SCALE,
                    y: pocket.dropPosition.y * GameConstants.PHYS_SCALE
                }, t, Phaser.Easing.Cubic.Out, true)
                .onComplete.add(function (): void {

                    ball.mc.parent.removeChild(ball.mc);
                    this.tunnelContainer.add(ball.mc);

                    this.game.add.tween(ball.mc.scale)
                        .to({ x: .65, y: .65 }, 1.75 * t, Phaser.Easing.Linear.None, true);

                    ball.velocity = new Billiard.Vector2D((.7 * pocket.dropPosition.x - ball.mc.x) / t, (.7 * pocket.dropPosition.y - ball.mc.y) / t);

                    let pocketTween = this.game.add.tween(ball.mc)
                        .to({
                            x: 0.7 * pocket.dropPosition.x * GameConstants.PHYS_SCALE,
                            y: 0.7 * pocket.dropPosition.y * GameConstants.PHYS_SCALE
                        }, 1.75 * t, Phaser.Easing.Linear.None, true);

                    if (ball.id === 0) {

                        if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                            pocketTween.onComplete.add(this.releaseCueBall, this, 0, [contactEvent]);
                        }
                        else {

                            pocketTween.onComplete.add(function (): void {
                                this.tunnelContainer.removeChild(ball.mc);
                                ball.mc.pocketTween = false;
                                ball.velocity = new Billiard.Vector2D(0, 0);
                            }, this);
                        }
                    } else {

                        pocketTween.onComplete.add(function (): void {
                            this.tunnelContainer.removeChild(ball.mc);
                            ball.mc.pocketTween = false;
                            ball.velocity = new Billiard.Vector2D(0, 0);
                        }, this);
                    }

                }, this);
        }

        private releaseCueBall(ball: Ball, tween: Phaser.Tween, args: any): void {

            const cueBall = GameVars.ballArray[0];
            const contactEvent: Billiard.ContactEvent = args[0];
            const pocket: Billiard.Pocket = contactEvent.target;

            let outPocketId: number;
            let outVelocity: Billiard.Vector2D;

            GameManager.log(pocket.id);

            switch (pocket.id) {
                case 0:
                    outPocketId = 5;
                    outVelocity = new Billiard.Vector2D(-1, -1).normalize().times(200);
                    break;
                case 1:
                    outPocketId = 4;
                    outVelocity = new Billiard.Vector2D(0, -1).normalize().times(200);
                    break;
                case 2:
                    outPocketId = 3;
                    outVelocity = new Billiard.Vector2D(1, -1).normalize().times(200);
                    break;
                case 3:
                    outPocketId = 2;
                    outVelocity = new Billiard.Vector2D(-1, 1).normalize().times(200);
                    break;
                case 4:
                    outPocketId = 1;
                    outVelocity = new Billiard.Vector2D(0, 1).normalize().times(200);
                    break;
                case 5:
                    outPocketId = 0;
                    outVelocity = new Billiard.Vector2D(1, 1).normalize().times(200);
                    break;
                default:
            }

            const outPocket = GameVars.pocketArray[outPocketId];

            const tweenTime = 200;

            this.game.add.tween(cueBall.mc.scale)
                .to({ x: 1, y: 1 }, tweenTime, Phaser.Easing.Linear.None, true);

            this.game.add.tween(cueBall.mc)
                .to({

                    x: outPocket.position.x * GameConstants.PHYS_SCALE,
                    y: outPocket.position.y * GameConstants.PHYS_SCALE
                }, tweenTime, Phaser.Easing.Linear.None, true)
                .onComplete.add(function (): void {

                    const x = cueBall.mc.x;
                    const y = cueBall.mc.y;
                    this.tunnelContainer.removeChild(cueBall.mc);
                    this.ballsContainer.add(cueBall.mc);
                    cueBall.position.x = x / GameConstants.PHYS_SCALE;
                    cueBall.position.y = y / GameConstants.PHYS_SCALE;
                    cueBall.velocity = outVelocity;
                    cueBall.active = true;

                    // TODO: es lo unico que se me ocurre para evitar que entre de nuevo por
                    // el agujero del que sale
                    this.game.time.events.add(200, function (): void {
                        cueBall.mc.pocketTween = false;
                        cueBall.shadow.visible = true;
                    }, this);

                }, this);
        }

        private addDebugObjectsContainer(): void {

            this.debugObjectContainer = new DebugObjectsContainer(this.game);
            this.add(this.debugObjectContainer);

            // los pockets
            for (let i = 0; i < GameVars.pocketArray.length; i++) {

                this.debugObjectContainer.drawPoint(GameVars.pocketArray[i].position, DebugObjectsContainer.RED);
                this.debugObjectContainer.drawPoint(GameVars.pocketArray[i].dropPosition, DebugObjectsContainer.GREEN);
                this.debugObjectContainer.drawCircle(GameVars.pocketArray[i].position, GameConstants.POCKET_RADIUS, DebugObjectsContainer.WHITE);
            }

            // las lines
            for (let i = 0; i < GameVars.lineArray.length; i++) {
                this.debugObjectContainer.drawLine(GameVars.lineArray[i].p1, GameVars.lineArray[i].p2, DebugObjectsContainer.GREEN);
                this.debugObjectContainer.drawLine(GameVars.lineArray[i].p3, GameVars.lineArray[i].p4, DebugObjectsContainer.YELLOW);
                this.debugObjectContainer.drawLine(GameVars.lineArray[i].p5, GameVars.lineArray[i].p6, DebugObjectsContainer.BLUE);
            }
        }
    }
}
