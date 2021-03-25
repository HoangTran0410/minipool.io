namespace MiniBillar {

    export class Ball extends Phaser.Group {

        public ballImage: Phaser.Image;

        public ballRotation: number[];
        public ballType: string;
        public pocketTween: boolean;
        public shade: Phaser.Image;

        private spotHolder: Phaser.Group;
        private spot: Phaser.Sprite;
        private circRad: number;
        private ballObject: BallObject;
        private n: number;

        constructor(game: Phaser.Game, ballRadius: number, n: number, ballObject: BallObject) {

            super(game, null, "ball");

            this.n = n;

            this.ballObject = ballObject;
            this.pocketTween = false;
            this.ballRotation = [1, 0, 0, 0];
            this.circRad = ballRadius;

            let spriteSheetPrefix: string;

            if (this.n <= 8) {
                this.ballType = GameConstants.BALL_TYPE_SOLID;
                spriteSheetPrefix = "solid_";
            } else {
                this.ballType = GameConstants.BALL_TYPE_STRIPED;
                spriteSheetPrefix = "stripes_";
            }

            this.ballImage = new Phaser.Image(game, 0, 0, "texture_atlas_1", "solid_0.png");
            this.ballImage.anchor.set(.5);
            this.ballImage.width = 2 * this.circRad;
            this.ballImage.height = 2 * this.circRad;
            this.addChild(this.ballImage);

            if (this.ballType === GameConstants.BALL_TYPE_SOLID) {
                this.ballImage.frameName = spriteSheetPrefix + this.n.toString() + ".png";
            } else {
                this.ballImage.frameName = spriteSheetPrefix + this.n.toString() + "_0.png";
            }

            this.spotHolder = new Phaser.Group(game);
            this.add(this.spotHolder);

            this.spot = new Phaser.Sprite(game, 0, 0, "texture_atlas_1");
            this.spot.anchor.set(.5);
            this.spot.frameName = "spot_" + n + ".png";
            this.spotHolder.addChild(this.spot);

            this.shade = new Phaser.Image(game, 0, 0, "texture_atlas_1", "shade.png");
            this.shade.anchor.set(.5);
            this.shade.width = 2.2 * this.circRad;
            this.shade.height = 2.2 * this.circRad;
            this.addChild(this.shade);

            this.updateRotation(10 * Math.random() - 5, 10 * Math.random() - 5, 10 * Math.random() - 5);
        }

        public update(): void {

            if (PoolState.currentInstance.victoryLayer || PoolState.currentInstance.loseLayer) {

                if (this.pocketTween) {
                    StageContainer.currentInstance.pauseGame();
                    this.pocketTween = false;
                }

                return;
            }

            if (this.pocketTween) { this.updateRotation(this.ballObject.velocity.x, this.ballObject.velocity.y, 0); }

            super.update();
        }

        public updateRotation(t: number, s: number, h: number): void {

            let r = Math.sqrt(t * t + h * h + s * s);

            if (r > 0.1) {

                this.ballRotation = this.rotateQuat(this.ballRotation, h / r, -t / r, s / r, r / this.circRad);
                this.ballRotation = this.normalize(this.ballRotation);
                this.renderBall(this.ballRotation);
            }
        }

        private rotateQuat(t: number[], s: number, h: number, i: number, a: number): number[] {

            let o = Math.sqrt(s * s + h * h + i * i);
            let r = s / o;
            let e = h / o;
            let l = i / o;
            let p = Math.sin(.5 * a);
            let n = r * p;
            let d = e * p;
            let c = l * p;
            let M = Math.cos(.5 * a);
            let P = t[0];
            let y = t[1];
            let H = t[2];
            let R = t[3];
            let g = P * M + y * c - H * d + R * n;
            let b = -P * c + y * M + H * n + R * d;
            let u = P * d - y * n + H * M + R * c;
            let m = -P * n - y * d - H * c + R * M;

            return [g, b, u, m];
        }

        private renderBall(q: number[]): void {

            const qy = q[0];
            const qx = q[1];
            const qz = q[2];
            const qw = q[3];

            const rotationY = Math.atan2(2 * qy * qw - 2 * qx * qz, 1 - 2 * qy * qy - 2 * qz * qz) + Math.PI;
            const rotationX = Math.asin(2 * qx * qy + 2 * qz * qw) + Math.PI;

            const test = qx * qy + qz * qw;

            if (!(test > .499 || test < -.499)) {

                this.angle = Billiard.Maths._180_DIV_PI * rotationY;
                this.shade.angle = -this.angle;

                if (this.ballType === GameConstants.BALL_TYPE_STRIPED) {

                    const v = (rotationX - Billiard.Maths.PI_2) / Math.PI;

                    const rotationIndex = 41 - Math.round(41 * v);

                    this.ballImage.frameName = "stripes_" + (this.n) + "_" + rotationIndex.toString() + ".png";
                }

                if (this.spotHolder) {

                    const rotationZ = Math.atan2(2 * qx * qw - 2 * qy * qz, 1 - 2 * qx * qx - 2 * qz * qz) + Math.PI;

                    if (rotationX < Billiard.Maths.PI_2 || rotationX > 3 * Billiard.Maths.PI_2) {

                        if (rotationZ > Billiard.Maths.PI_2 && rotationZ < 3 * Billiard.Maths.PI_2) {

                            this.spotHolder.y = this.circRad * Math.cos(rotationZ) * Math.sin(rotationX);
                            this.spotHolder.x = this.circRad * Math.sin(rotationZ);
                        } else {
                            this.spotHolder.y = -this.circRad * Math.cos(rotationZ) * Math.sin(rotationX);
                            this.spotHolder.x = -this.circRad * Math.sin(rotationZ);
                        }

                    } else {

                        if (rotationZ > Billiard.Maths.PI_2 && rotationZ < 3 * Billiard.Maths.PI_2) {
                            this.spotHolder.y = -this.circRad * Math.cos(rotationZ) * Math.sin(rotationX);
                            this.spotHolder.x = -this.circRad * Math.sin(rotationZ);
                        } else {
                            this.spotHolder.y = this.circRad * Math.cos(rotationZ) * Math.sin(rotationX);
                            this.spotHolder.x = this.circRad * Math.sin(rotationZ);
                        }
                    }

                    const dist = Math.sqrt(this.spotHolder.x * this.spotHolder.x + this.spotHolder.y * this.spotHolder.y);
                    const distRatio = dist / this.circRad;
                    const scaleY = Math.cos(distRatio * Billiard.Maths.PI_2);
                    const spotDir = Math.atan2(this.spotHolder.y, this.spotHolder.x);

                    if (scaleY < 0.1) {
                        this.spotHolder.visible = false;
                    } else {
                        const spotScale = 0.8;
                        this.spotHolder.visible = true;
                        this.spotHolder.scale.set(.8, scaleY * spotScale);
                    }
                    this.spotHolder.angle = Billiard.Maths._180_DIV_PI * spotDir + 90;
                    this.spot.angle = -this.spotHolder.angle;
                }
            }
        }

        private normalize(t: number[]): number[] {

            let s = Math.sqrt(t[0] * t[0] + t[1] * t[1] + t[2] * t[2] + t[3] * t[3]);

            return [t[0] / s, t[1] / s, t[2] / s, t[3] / s];
        }
    }
}
