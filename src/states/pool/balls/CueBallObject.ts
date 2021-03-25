namespace MiniBillar {

    export class CueBallObject extends BallObject {

        public handIcon: Phaser.Image;

        private cueBallBig: Phaser.Image;

        public static changePosition(x: number, y: number): { x: number, y: number } {

            let newX = x;
            let newY = y;

            // contra las paredes
            let upperLeftCushionPoint = StageContainer.CUSHION_VERTEXES[0];
            let lowerRightCushionPoint = StageContainer.CUSHION_VERTEXES[2];

            if (x < upperLeftCushionPoint.x) {
                newX = upperLeftCushionPoint.x * .999;
            } else if (x > lowerRightCushionPoint.x) {
                newX = lowerRightCushionPoint.x * .999;
            }

            if (y < upperLeftCushionPoint.y) {
                newY = upperLeftCushionPoint.y * .999;
            } else if (y > lowerRightCushionPoint.y) {
                newY = lowerRightCushionPoint.y * .999;
            }

            if (GameVars.firstShot && x > -21000) {
                newX = -21000;
            }

            // contra las otras bolas
            for (let i = 1, ln = GameVars.ballArray.length; i < ln; i++) {

                if (GameVars.ballArray[i].active) {

                    let dx = GameVars.ballArray[i].position.x - newX;
                    let dy = GameVars.ballArray[i].position.y - newY;
                    let d = Math.sqrt(dx * dx + dy * dy);

                    if (d < GameConstants.BALL_RADIUS * 2) {
                        return null;
                    }
                }
            }

            return { x: newX * GameConstants.PHYS_SCALE, y: newY * GameConstants.PHYS_SCALE };
        }

        public static isValidPosition(x: number, y: number, id?: number): boolean {

            let isValid = true;

            // contra las paredes
            let upperLeftCushionPoint = StageContainer.CUSHION_VERTEXES[0];
            let lowerRightCushionPoint = StageContainer.CUSHION_VERTEXES[2];

            if (GameVars.firstShot) {
                if (x < upperLeftCushionPoint.x || y < upperLeftCushionPoint.y || x > -21000 || y > lowerRightCushionPoint.y) {
                    isValid = false;
                }
            } else {
                if (x < upperLeftCushionPoint.x || y < upperLeftCushionPoint.y || x > lowerRightCushionPoint.x || y > lowerRightCushionPoint.y) {
                    isValid = false;
                }
            }

            // contra las otras bolas
            if (isValid) {

                for (let i = 1, ln = GameVars.ballArray.length; i < ln; i++) {

                    if (GameVars.ballArray[i].active) {

                        if (id && id === GameVars.ballArray[i].id) {
                            continue;
                        }

                        let dx = GameVars.ballArray[i].position.x - x;
                        let dy = GameVars.ballArray[i].position.y - y;
                        let d = Math.sqrt(dx * dx + dy * dy);

                        if (d < GameConstants.BALL_RADIUS * 2) {
                            isValid = false;
                            break;
                        }
                    }
                }
            }

            return isValid;
        }

        constructor(game: Phaser.Game, n: number, x: number, y: number) {

            super(game, n, x, y, true);

            this.cueBallBig = null;
            this.handIcon = null;
        }

        public update(): void {

            if (GameVars.draggingCueBall && this.cueBallBig && this.cueBallBig.alpha > 0) {

                let x = (this.game.input.activePointer.x - StageContainer.currentInstance.x) * GameVars.scaleXMultInverse;
                let y = (this.game.input.activePointer.y - StageContainer.currentInstance.y) * GameVars.scaleYMultInverse;

                let point = { x: x, y: y };

                point = CueBallObject.changePosition(x / GameConstants.PHYS_SCALE, y / GameConstants.PHYS_SCALE);

                if (point) {
                    this.cueBallBig.x = point.x;
                    this.cueBallBig.y = point.y;

                    this.mc.x = point.x;
                    this.mc.y = point.y;

                    this.shadow.x = this.mc.x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.x / 300);
                    this.shadow.y = this.mc.y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.y / 150);
                }
            }

            if (this.handIcon) {
                this.handIcon.x = this.mc.x + 30;
                this.handIcon.y = this.mc.y;
            }
        }

        public setPositionReceived(x: number, y: number): void {

            this.game.add.tween(this.mc)
                .to({ x: x, y: y }, 200, Phaser.Easing.Linear.None, true);

            this.game.add.tween(this.shadow)
                .to({
                    x: x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (x / 300),
                    y: y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (y / 150)
                },
                    200, Phaser.Easing.Linear.None, true)
                .onComplete.add(function (): void {

                    CueContainer.currentInstance.showCueAndUpdatePos();
                    MatchManager.cueBallSet(x, y);

                }, this);

            this.position.x = x / GameConstants.PHYS_SCALE;
            this.position.y = y / GameConstants.PHYS_SCALE;
        }

        public setPositioOnShoot(x: number, y: number): void {

            this.mc.x = x;
            this.mc.y = y;

            this.shadow.x = x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (x / 300);
            this.shadow.y = y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (y / 150);

            this.position.x = x / GameConstants.PHYS_SCALE;
            this.position.y = y / GameConstants.PHYS_SCALE;
        }

        public addHandIcon(): void {

            if (this.handIcon) {

                this.handIcon.destroy();
                this.handIcon = null;
            }

            this.handIcon = new Phaser.Image(this.game, this.mc.x, this.mc.y, "texture_atlas_1", "hand-icon.png");
            this.handIcon.anchor.set(.5);
            this.handIcon.scale.set(.8);
            StageContainer.currentInstance.add(this.handIcon);

            if (this.cueBallBig) {

                this.cueBallBig.destroy();
                this.cueBallBig = null;
            }

            this.cueBallBig = new Phaser.Image(this.game, this.mc.x, this.mc.y, "texture_atlas_1", "cue_ball.png");
            this.cueBallBig.anchor.set(.5);
            this.cueBallBig.scale.set(0.5);
            this.cueBallBig.alpha = 0;
            
            if (this.game.device.desktop) {

                const scaleDiff = this.mc.width * this.mc.scale.x / this.cueBallBig.width * this.cueBallBig.scale.x;
                this.cueBallBig.scale.set(scaleDiff);
            }

            this.cueBallBig.inputEnabled = true;
            this.cueBallBig.events.onInputDown.add(this.onDown, this);
            this.cueBallBig.events.onInputUp.add(this.onUp, this);
            StageContainer.currentInstance.add(this.cueBallBig);

            this.handIcon.alpha = 0;

            this.game.add.tween(this.handIcon)
                .to({ alpha: 1 }, 300, Phaser.Easing.Cubic.Out, true);

            this.game.add.tween(this.handIcon.scale)
                .to({ x: 0.9, y: 0.9 }, 500, Phaser.Easing.Cubic.InOut, true, 0, -1, true);
        }

        public hideHandIcon(): void {

            if (!GameVars.draggingCueBall) {
                return;
            }

            GameVars.draggingCueBall = false;

            this.handIcon.destroy();
            this.handIcon = null;

            this.cueBallBig.destroy();
            this.cueBallBig = null;
        }

        public onDown(): void {

            if (this.game.device.desktop) {

                const scaleDiff = this.mc.width * this.mc.scale.x / this.cueBallBig.width * this.cueBallBig.scale.x;
                this.cueBallBig.scale.set(scaleDiff);
                this.mc.alpha = 0;
            }

            BallsContainer.currentInstance.bringToTop(this.mc);

            StageContainer.currentInstance.hideCue("Moving cue ball");
            StageContainer.currentInstance.hideGuide("Moving cue ball");

            this.handIcon.destroy();
            this.handIcon = null;

            this.cueBallBig.alpha = .65;
        }

        public onUp(): void {

            if (!GameVars.draggingCueBall) {
                return;
            }

            StageContainer.currentInstance.showCue("Just placed white ball");

            this.cueBallBig.destroy();
            this.cueBallBig = null;

            this.addHandIcon();

            this.position.x = this.mc.x / GameConstants.PHYS_SCALE;
            this.position.y = this.mc.y / GameConstants.PHYS_SCALE;

            this.mc.alpha = 1;

            MatchManager.cueBallSet(this.mc.x, this.mc.y);
        }

        public onUpTimeOut(): void {

            if (!GameVars.draggingCueBall) {
                return;
            }

            GameVars.draggingCueBall = false;

            this.cueBallBig.destroy();
            this.cueBallBig = null;

            if (this.handIcon) {
                this.handIcon.destroy();
                this.handIcon = null;
            }

            this.mc.x = this.position.x * GameConstants.PHYS_SCALE;
            this.mc.y = this.position.y * GameConstants.PHYS_SCALE;

            this.shadow.x = this.mc.x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.x / 300);
            this.shadow.y = this.mc.y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.y / 150);

            this.mc.alpha = 1;

            MatchManager.cueBallSet(this.mc.x, this.mc.y);
        }
    }
}
