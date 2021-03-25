namespace MiniBillar {

    export class BallsContainer extends Phaser.Group {

        public static currentInstance: BallsContainer;

        private shadowsContainer: Phaser.Group;
       
        constructor(game: Phaser.Game) {

            super(game, null, "balls-container");

            BallsContainer.currentInstance = this;

            this.shadowsContainer = new Phaser.Group(this.game);
            this.add(this.shadowsContainer);
        }

        public destroy(destroyChildren?: boolean, soft?: boolean): void {

            BallsContainer.currentInstance = null;

            super.destroy(destroyChildren, soft);
        }

        public update(): void {

            if (!GameVars.startMatch || !GameVars.ballArray) {
                return;
            }

            super.update();

            let cueBall = <CueBallObject>GameVars.ballArray[0];
            if (GameVars.draggingCueBall) {
                cueBall.update();
            }

            if (GameConstants.DEBUG) {
                StageContainer.currentInstance.debugObjectContainer.drawCueBallTrajectoryPoint(cueBall.position, DebugObjectsContainer.RED);
            }
        }

        public startGame(): void {

            for (let i = 0; i < GameVars.ballArray.length; i++) {
                if (GameVars.ballArray[i].active) {
                    this.add(GameVars.ballArray[i].mc);
                    this.shadowsContainer.add(GameVars.ballArray[i].shadow);
                }
            }

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                this.alpha = 0;
                this.game.add.tween(this)
                    .to({ alpha: 1 }, 500, Phaser.Easing.Cubic.Out, true);
            }
        }

        public newTurn(): void {
            const cueBall = GameVars.ballArray[0];
            cueBall.firstContact = false;
        }

        public ballHasBeenShot(): void {
            if (GameConstants.DEBUG) {
                StageContainer.currentInstance.debugObjectContainer.clearCueBallGraphics();
            }
        }

        public removeBalls(): void {

            for (let i = 0; i < GameVars.ballArray.length; i++) {
                this.remove(GameVars.ballArray[i].mc);
                this.shadowsContainer.remove(GameVars.ballArray[i].shadow);
            }
        }

        public resetBalls(): void {

            for (let i = 0; i < GameVars.ballArray.length; i++) {
                this.add(GameVars.ballArray[i].mc);
                this.shadowsContainer.add(GameVars.ballArray[i].shadow);
            }
        }

        public setCueBall(): void {

            let cueBall = <CueBallObject>GameVars.ballArray[0];

            if (!cueBall.active) {
                cueBall.active = true;
                cueBall.mc.pocketTween = false;
                cueBall.velocity = new Billiard.Vector2D(0, 0); // esto ya se hizo antes pero como no molesta lo dejamos asi
                cueBall.grip = 1;
                cueBall.ySpin = 0;
                cueBall.screw = 0;
                cueBall.english = 0;
                cueBall.deltaScrew = new Billiard.Vector2D(0, 0);

                let x = GameConstants.BALLS_INITIAL_POSITIONS[0][0];
                let y = GameConstants.BALLS_INITIAL_POSITIONS[0][1];

                let exceptionalPosition = false;

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    if (GameVars.currentTurn !== GameConstants.ADVERSARY) {
                        while (!CueBallObject.isValidPosition(x, y)) {

                            x = this.game.rnd.realInRange(-38000, 38000);
                            y = this.game.rnd.realInRange(-19000, 19000);
                            exceptionalPosition = true;
                        }
                    }
                }

                cueBall.position = new Billiard.Vector2D(x, y);
                cueBall.mc.scale.set(1);

                cueBall.mc.x = cueBall.position.x * GameConstants.PHYS_SCALE;
                cueBall.mc.y = cueBall.position.y * GameConstants.PHYS_SCALE;

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    if (exceptionalPosition) {
                        if (GameVars.gameMode === GameConstants.PVP_MODE) {
                            MatchManagerPVP.sendCueBallPosition(cueBall.mc.x, cueBall.mc.y);
                        }
                    }
                }

                cueBall.shadow.visible = true;
                cueBall.shadow.x = cueBall.mc.x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (cueBall.mc.x / 300);
                cueBall.shadow.y = cueBall.mc.y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (cueBall.mc.y / 150);

                this.add(cueBall.mc);

                cueBall.mc.alpha = 0;
                this.game.add.tween(cueBall.mc)
                    .to({ alpha: 1 }, 300, Phaser.Easing.Cubic.Out, true);
            }

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                if (GameVars.currentTurn !== GameConstants.ADVERSARY) {

                    GameVars.draggingCueBall = true;
                    cueBall.addHandIcon();
                }
            }
        }
    }
}
