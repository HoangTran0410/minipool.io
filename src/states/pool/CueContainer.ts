namespace MiniBillar {

    export class CueContainer extends Phaser.Group {

        public static currentInstance: CueContainer;

        public static MAX_IMPULSE = 2200;
        private static MAX_DELTA_CUE = 150;

        private static DELTA_ROTATIION = 5 / 180 * Math.PI; // para retransmitir cambio de angulo debe haber cambiado 5 grados
        private static DELTA_TIME = 1250;

        public settingPower: boolean;
        public impulseFactor: number;
        public shooting: boolean;
        public aimDirectionVector: Billiard.Vector2D;

        private cue: Phaser.Sprite;
        private down_px: number;
        private down_py: number;
        private startCue: number;
        private startAng: number;
        private startAim: boolean;

        private doIntermittentCueAnim: boolean;
        private doIntermittentCueAnimCounter: number;

        private lastRotationTransmitted: number;
        private timeRotationTransmitted: number;

        private downTimer: number;

        private tweenCue: Phaser.Tween;
        private timer: Phaser.TimerEvent;

        constructor(game: Phaser.Game) {

            super(game, null, "cue-container");

            CueContainer.currentInstance = this;

            this.settingPower = false;
            this.angle = 180;

            this.lastRotationTransmitted = this.rotation;
            this.timeRotationTransmitted = this.game.time.time;

            this.shooting = false;
            this.down_px = 0;
            this.down_py = 0;
            this.impulseFactor = 0;
            this.aimDirectionVector = new Billiard.Vector2D(1, 0);
            this.startAim = false;
            this.downTimer = -0.1;

            this.doIntermittentCueAnim = false;
            this.doIntermittentCueAnimCounter = 1.0;

            this.createCue();

            if (this.game.device.touch) {
                this.game.input.onUp.add(this.onUp, this);
                this.game.input.onDown.add(this.onDownTouch, this);
            } else {
                this.game.input.onDown.add(this.onDownDesktop, this);
                this.game.input.onUp.add(this.shoot, this);
            }

            this.cue.visible = false;
        }

        public update(): void {

            super.update();

            if (this.downTimer >= 0) {
                this.downTimer -= this.game.time.physicsElapsed;
            }

            if (!this.cue.visible || this.shooting || SpinCircleLayer.currentInstance.visible ||
                GameVars.paused || GameVars.GUIButtonDown) {

                return;
            }

            this.animateCue();

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                if (StageContainer.currentInstance.selectPockets.canSelect ||
                    GameVars.currentTurn !== GameConstants.PLAYER) {
                    return;
                }
            }

            const cueBall = <CueBallObject>GameVars.ballArray[0];

            this.position.x = cueBall.mc.x;
            this.position.y = cueBall.mc.y;

            if (this.game.device.touch) {

                if (this.settingPower) {

                    this.cue.x = this.impulseFactor * CueContainer.MAX_DELTA_CUE;

                } else {

                    if (this.game.input.activePointer.isDown && !this.settingPower) {

                        if (this.startAim) {

                            const dx = (this.game.input.activePointer.x - this.parent.x) / GameVars.scaleXMult - cueBall.mc.x;
                            const dy = this.game.input.activePointer.y - this.parent.y - cueBall.mc.y;

                            let pointerAngle = 180 / Math.PI * Math.atan2(dy, dx);
                            let deltaAngle = Billiard.Maths.angleDiff(pointerAngle, this.startAng);

                            this.angle = this.startCue + deltaAngle;

                            this.aimDirectionVector = new Billiard.Vector2D(-Math.cos(this.rotation), -Math.sin(this.rotation));
                            this.transmitCueRotation();

                        } else {

                            this.startCue = this.angle;

                            const dx = (this.game.input.activePointer.x - this.parent.x) / GameVars.scaleXMult - cueBall.mc.x;
                            const dy = this.game.input.activePointer.y - this.parent.y - cueBall.mc.y;

                            this.startAng = 180 / Math.PI * Math.atan2(dy, dx);
                            this.startAim = true;
                        }

                    } else {
                        this.startAim = false;
                    }
                }

            } else {

                if (this.settingPower) {

                    if (cueBall.handIcon) { cueBall.handIcon.visible = false; }

                    const x = this.down_px - this.game.input.activePointer.x;
                    const y = this.down_py - this.game.input.activePointer.y;

                    const transf_x = x * Math.cos(this.rotation) + y * Math.sin(this.rotation);
                    this.impulseFactor = Billiard.Maths.fixNumber(-Phaser.Math.clamp(transf_x, -CueContainer.MAX_DELTA_CUE, 0) / CueContainer.MAX_DELTA_CUE);
                    this.cue.x = this.impulseFactor * CueContainer.MAX_DELTA_CUE;

                } else if (!SpinCircleLayer.discardClick) {

                    let cueBall = GameVars.ballArray[0];

                    const dx = cueBall.mc.x - this.game.input.activePointer.x + this.parent.x;
                    const dy = cueBall.mc.y - this.game.input.activePointer.y + this.parent.y;

                    this.rotation = Math.atan2(dy, dx);

                    this.transmitCueRotation();

                    this.aimDirectionVector = new Billiard.Vector2D(-Math.cos(this.rotation), -Math.sin(this.rotation));
                }
            }
        }

        public showCueAndUpdatePos(): void {

            this.cue.visible = true;
            this.cue.x = 0;

            this.cue.alpha = 0;
            this.game.add.tween(this.cue)
                .to({ alpha: 1 }, 300, Phaser.Easing.Cubic.Out, true);

            let cueBall = GameVars.ballArray[0];

            this.position.x = cueBall.mc.x;
            this.position.y = cueBall.mc.y;

            this.aimDirectionVector = new Billiard.Vector2D(-Math.cos(this.rotation), -Math.sin(this.rotation));
        }

        public moveCue(rotation: number): void {

            let difference = this.rotation - rotation;
            let times = Math.floor((difference - (-Math.PI)) / (Math.PI * 2));

            let shortAngle = (difference - (times * (Math.PI * 2))) * -1;
            let newAngle = this.rotation + shortAngle;

            let cueBall = GameVars.ballArray[0];

            let randTime = Math.random() * 600 + 300;

            this.position.x = cueBall.mc.x;
            this.position.y = cueBall.mc.y;

            this.game.add.tween(this)
                .to({ rotation: newAngle }, randTime, Phaser.Easing.Cubic.Out, true)
                .onComplete.add(function (): void {
                    this.aimDirectionVector = new Billiard.Vector2D(-Math.cos(this.rotation), -Math.sin(this.rotation));
                }, this);
        }

        public moveCueTo(x: number, y: number): void {

            this.game.add.tween(this.position)
                .to({ x: x, y: y }, 200, Phaser.Easing.Linear.None, true);
        }

        public hideCue(): void {
            this.cue.visible = false;
            this.cue.x = 0;
            this.shooting = false;
        }

        public shoot(p?: Phaser.Pointer): void {

            if (p && !p.withinGame) {
                return;
            }

            this.settingPower = false;

            if (this.shooting || !this.cue.visible || SpinCircleLayer.currentInstance.visible || GameVars.shotRunning ||
                StageContainer.currentInstance.selectPockets.canSelect) {
                return;
            }

            if (this.downTimer > 0) {
                this.cancelShot();
                this.downTimer = -0.1;
                return;
            }

            if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.cueRotated(this.rotation); }

            if (this.impulseFactor > 0) {
                this.shooting = true;

                this.game.add.tween(this.cue)
                    .to({ x: -5 }, 75, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(this.applyImpulse, this);
            } else {
                this.impulseFactor = 0;

                const cueBall = <CueBallObject>GameVars.ballArray[0];
                if (cueBall.handIcon) { cueBall.handIcon.visible = true; }
            }
        }

        public shootReceived(vector: Billiard.Vector2D, deltaScrew: Billiard.Vector2D, english: number): void {

            this.shooting = true;

            this.game.add.tween(this.cue)
                .to({ x: 100 }, 400, Phaser.Easing.Cubic.Out, true, 500);

            this.game.add.tween(this.cue)
                .to({ x: -5 }, 200, Phaser.Easing.Cubic.Out, true, 1000)
                .onComplete.add(function () { this.applyReceivedImpulse(vector, deltaScrew, english); }, this);
        }

        public applyReceivedImpulse(velocity: Billiard.Vector2D, deltaScrew: Billiard.Vector2D, english: number, impulseFactor: number): void {

            let cueBall = <CueBallObject>GameVars.ballArray[0];

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                cueBall.hideHandIcon();
            }

            cueBall.velocity = velocity;
            cueBall.deltaScrew = deltaScrew;
            cueBall.english = english;

            let shotData: ShotData = {
                cueSpeed: { vx: cueBall.velocity.x, vy: cueBall.velocity.y },
                deltaScrew: { x: cueBall.deltaScrew.x, y: cueBall.deltaScrew.y },
                english: cueBall.english
            };

            MatchManager.ballHasBeenShot(shotData);

            // GameManager.log("cue impulse:" + JSON.stringify(cueBall.velocity));
            // GameManager.log("cue delta screw:" + JSON.stringify(cueBall.deltaScrew));
            // GameManager.log("cue english:" + JSON.stringify(cueBall.english));

            AudioManager.playEffect(AudioManager.CUE_HIT, cueBall.velocity.magnitude / 1.9e3);
        }

        public onUpTimeOut(): void {

            if (!this.settingPower) { return; }

            this.cancelShot();
        }

        public updateCueSprite(): void {

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                return;
            }
            else {

                let playerCue: string = GameVars.gameData.playerData.equipedCue;
                let adversaryCue: string = GameVars.adversaryData.equipedCue;

                const playerCueHasIntermittentAnim = RewardsManager.getCueSpriteIntermittent(playerCue);
                const adversaryCueHasIntermittentAnim = RewardsManager.getCueSpriteIntermittent(adversaryCue);

                if (GameVars.currentTurn === GameConstants.PLAYER) {

                    if (!playerCueHasIntermittentAnim) {
                        this.doIntermittentCueAnim = false;
                    }
                    else {
                        this.doIntermittentCueAnim = true;
                    }
                    this.cue.play("playerCueLoop");
                }
                else {
                    if (!adversaryCueHasIntermittentAnim) {
                        this.doIntermittentCueAnim = false;
                    }
                    else {
                        this.doIntermittentCueAnim = true;
                    }
                    this.cue.play("adversaryCueLoop");
                }
            }
        }
        public aimHelper(): void {

            if (this.game.device.desktop || (GameVars.gameMode !== GameConstants.SOLO_MODE && GameVars.currentTurn === GameConstants.ADVERSARY)) { return; }

            let cueBall = GameVars.ballArray[0];
            let viableBalls: BallObject[] = [];

            for (let i = 0; i < GameVars.ballArray.length; i++) {

                const ball = GameVars.ballArray[i];

                if (ball.id === 0 || !ball.active) { continue; }

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    if (GuideContainer.currentInstance.isBallProhibited(ball.id)) { continue; }
                }

                if (!this.clearLineOfSight(cueBall.position, ball.position)) { continue; }

                viableBalls.push(ball);
            }

            if (viableBalls.length < 1) { return; }

            viableBalls = this.sortAndPruneViableBalls(viableBalls);

            const dxFinal = viableBalls[0].position.x - cueBall.position.x;
            const dyFinal = viableBalls[0].position.y - cueBall.position.y;

            let angle = Math.atan2(dyFinal, dxFinal) * 180 / Math.PI + 180;

            // se le da algo de random al angulo ya que algunas veces al apuntar directamente al centro sucedía que
            // la bola blanca atravesaba a la otra angle += -.15 + .3 * Math.random();
            if (Math.abs(this.angle - angle) > 180) {
                angle -= 360;
            }

            this.angle = angle + -.15 + .3 * Math.random();
            this.aimDirectionVector = new Billiard.Vector2D(-Math.cos(this.rotation), -Math.sin(this.rotation));
        }

        private sortAndPruneViableBalls(viableBalls: BallObject[]): BallObject[] {

            let list: { index: number, distance: number, pocketIndex: number }[] = [];

            for (let i = 0; i < viableBalls.length; i++) {

                let ball = viableBalls[i];
                let b1Closest = Number.MAX_VALUE;
                let pocketIndex = -1;

                for (let j = 0; j < GameVars.pocketArray.length; j++) {
                    const b1XDiff = ball.position.x - GameVars.pocketArray[j].position.x;
                    const b1YDiff = ball.position.y - GameVars.pocketArray[j].position.y;
                    const b1Dist = b1XDiff * b1XDiff + b1YDiff * b1YDiff;

                    if (b1Dist < b1Closest) {
                        b1Closest = b1Dist;
                        pocketIndex = j;
                    }
                }

                list.push({ index: i, distance: b1Closest, pocketIndex: pocketIndex });
            }

            list = list.sort((n1, n2) => n1.distance - n2.distance);

            let answer: BallObject[] = [];
            let culledBalls: BallObject[] = [];
            for (let i = 0; i < list.length; i++) {

                const ballIndex = list[i].index;
                const pocketIndex = list[i].pocketIndex;

                const ball = viableBalls[ballIndex];
                const pocket = GameVars.pocketArray[pocketIndex];

                if (!this.clearLineOfSight(ball.position, pocket.position, ball.position)) {
                    culledBalls.push(viableBalls[ballIndex]);
                    continue;
                }
                else {
                    answer.push(viableBalls[ballIndex]);
                }
            }

            return answer.length > 0 ? answer : culledBalls;
        }

        private clearLineOfSight(start: Billiard.Vector2D, target: Billiard.Vector2D, excludeBallPos?: Billiard.Vector2D): boolean {

            if (!excludeBallPos) {
                excludeBallPos = target;
            }

            let c = new Billiard.Point(start.x, start.y);
            let p = new Billiard.Point(target.x, target.y);
            let g = 2 * GameConstants.BALL_RADIUS;

            for (let i = 0; i < GameVars.ballArray.length; i++) {

                const ball = GameVars.ballArray[i];

                if (ball.id === 0 || ball.position === excludeBallPos || !ball.active) { continue; }

                let u = new Billiard.Point(ball.position.x, ball.position.y);
                var h = Billiard.Maths.lineIntersectCircle(c, p, u, g);

                if (h.intersects) {
                    return false;
                }
            }

            return true;
        }

        private createCue(): void {

            this.cue = new Phaser.Sprite(this.game, 0, 0, "texture_atlas_5");
            this.cue.anchor.y = .5;
            this.cue.anchor.x = -.027;
            this.add(this.cue);

            if (GameVars.gameMode === GameConstants.SOLO_MODE) {

                let frames = Utils.createAnimFramesArr(GameVars.gameData.playerData.equipedCue + "_sprite",
                    RewardsManager.getCueSpriteFrames(GameVars.gameData.playerData.equipedCue));

                this.cue.frameName = frames[0];

                const intermittentAnim = RewardsManager.getCueSpriteIntermittent(GameVars.gameData.playerData.equipedCue);

                let anim = this.cue.animations.add("cueLoop", frames, 12, !intermittentAnim);

                if (!intermittentAnim) {
                    anim.play();
                } else {
                    this.doIntermittentCueAnim = true;
                }

            } else if (GameVars.adversaryData.equipedCue) {

                let playerCue = GameVars.gameData.playerData.equipedCue;
                let adversaryCue = GameVars.adversaryData.equipedCue;

                const playerCueHasIntermittentAnim = RewardsManager.getCueSpriteIntermittent(playerCue);
                const playerCueframes = Utils.createAnimFramesArr(playerCue + "_sprite",
                    RewardsManager.getCueSpriteFrames(playerCue));
                this.cue.animations.add("playerCueLoop", playerCueframes, 12, !playerCueHasIntermittentAnim);

                const adversaryCueHasIntermittentAnim = RewardsManager.getCueSpriteIntermittent(adversaryCue);
                const adversaryCueframes = Utils.createAnimFramesArr(adversaryCue + "_sprite",
                    GameVars.gameMode === GameConstants.PVBOT_MODE ? 1 : RewardsManager.getCueSpriteFrames(adversaryCue));
                this.cue.animations.add("adversaryCueLoop", adversaryCueframes, 12, !adversaryCueHasIntermittentAnim);

                this.updateCueSprite();
            }
        }

        private applyImpulse(): void {

            let cueBall = <CueBallObject>GameVars.ballArray[0];

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                cueBall.hideHandIcon();
            }

            cueBall.velocity = this.aimDirectionVector.times(this.impulseFactor * CueContainer.MAX_IMPULSE);

            this.impulseFactor = 0;

            let screw: number;

            if (GameVars.verticalSpin > 0) {
                screw = .035;
            } else if (GameVars.verticalSpin < 0) {
                screw = .0425;
            } else {
                screw = 0;
            }

            cueBall.deltaScrew = this.aimDirectionVector.times(cueBall.velocity.magnitude * screw * GameVars.verticalSpin);
            cueBall.english = GameVars.english;

            let shotData: ShotData = {
                cueSpeed: { vx: cueBall.velocity.x, vy: cueBall.velocity.y },
                deltaScrew: { x: cueBall.deltaScrew.x, y: cueBall.deltaScrew.y },
                english: cueBall.english
            };

            MatchManager.ballHasBeenShot(shotData);

            AudioManager.playEffect(AudioManager.CUE_HIT, cueBall.velocity.magnitude / 1.9e3);

            // GameManager.log("cue impulse:" + JSON.stringify(cueBall.velocity));
            // GameManager.log("cue delta screw:" + JSON.stringify(cueBall.deltaScrew));
            // GameManager.log("cue english:" + JSON.stringify(cueBall.english));
        }

        private animateCue() {

            if (this.doIntermittentCueAnim) {

                if (this.doIntermittentCueAnimCounter < 0) {

                    if (GameVars.gameMode === GameConstants.SOLO_MODE) {
                        this.cue.play("cueLoop", 24, false);
                    } else {
                        if (GameVars.currentTurn === GameConstants.PLAYER) { this.cue.play("playerCueLoop", 24, false); }
                        else { this.cue.play("adversaryCueLoop", 24, false); }
                    }

                    this.doIntermittentCueAnimCounter = this.game.rnd.realInRange(2, 8);

                } else {
                    this.doIntermittentCueAnimCounter -= this.game.time.physicsElapsed;
                }
            }
        }

        private onDownDesktop(): void {

            if (!this.cue.visible || GameVars.shotRunning || SpinCircleLayer.currentInstance.visible ||
                StageContainer.currentInstance.selectPockets.canSelect) {
                return;
            }

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                if (GameVars.currentTurn === GameConstants.PLAYER) {
                    if (SpinCircleLayer.discardClick) {
                        SpinCircleLayer.discardClick = false;
                    }
                }
            } else {
                if (SpinCircleLayer.discardClick) {
                    SpinCircleLayer.discardClick = false;
                }
            }

            if (this.downTimer < 0) { this.downTimer = 0.15; }

            this.settingPower = true;

            this.down_px = this.game.input.activePointer.x;
            this.down_py = this.game.input.activePointer.y;
        }

        private cancelShot(): void {

            this.cue.x = 0;
            this.impulseFactor = 0;
            this.settingPower = false;

            const cueBall = <CueBallObject>GameVars.ballArray[0];
            if (cueBall.handIcon) { cueBall.handIcon.visible = true; }
        }

        private onDownTouch(): void {

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                if (GameVars.currentTurn === GameConstants.PLAYER) {
                    if (SpinCircleLayer.discardClick) {
                        SpinCircleLayer.discardClick = false;
                    }
                }
            } else {
                if (SpinCircleLayer.discardClick) {
                    SpinCircleLayer.discardClick = false;
                }
            }
        }

        private onUp(pointer: Phaser.Pointer): void {

            if (GameVars.shotRunning || SpinCircleLayer.currentInstance.visible || SpinCircleLayer.discardClick ||
                this.settingPower || GameVars.paused || StageContainer.currentInstance.selectPockets.canSelect ||
                GameVars.GUIButtonDown) {

                if (GameVars.GUIButtonDown) {
                    GameVars.GUIButtonDown = false;
                }

                return;
            }

            if (GameVars.gameMode !== GameConstants.SOLO_MODE && GameVars.currentTurn !== GameConstants.PLAYER) {
                return;
            }

            if (pointer.timeUp - pointer.timeDown < 300) {

                let cueBall = GameVars.ballArray[0];

                let px = (pointer.x - this.parent.x) / GameConstants.PHYS_SCALE * GameVars.scaleXMultInverse;
                let py = (pointer.y - this.parent.y) / GameConstants.PHYS_SCALE * GameVars.scaleYMultInverse;
                let dx: number;
                let dy: number;

                for (let i = 0; i < GameVars.ballArray.length; i++) {

                    let ball = GameVars.ballArray[i];

                    if (ball.id !== 0) {
                        dx = ball.position.x - px;
                        dy = ball.position.y - py;
                        let d = Math.sqrt(dx * dx + dy * dy);

                        if (d < 2.5 * GameConstants.BALL_RADIUS) {
                            px = ball.position.x;
                            py = ball.position.y;
                            break;
                        }
                    }
                }

                dx = px - cueBall.position.x;
                dy = py - cueBall.position.y;

                let angle = Math.atan2(dy, dx) * 180 / Math.PI + 180;
                angle += -.15 + .3 * Math.random();

                if (Math.abs(this.angle - angle) > 180) { angle -= 360; }

                this.game.add.tween(this)
                    .to({ angle: angle }, 180, Phaser.Easing.Cubic.Out, true)
                    .onUpdateCallback(function (): void {
                        this.aimDirectionVector = new Billiard.Vector2D(-Math.cos(this.rotation), -Math.sin(this.rotation));
                    }, this)
                    .onComplete.add(this.transmitCueRotation, this);
            }
        }

        private transmitCueRotation(): void {

            if (GameVars.gameMode !== GameConstants.SOLO_MODE && GameVars.currentTurn === GameConstants.PLAYER) {
                if (Math.abs(this.rotation - this.lastRotationTransmitted) > CueContainer.DELTA_ROTATIION && this.game.time.time - this.timeRotationTransmitted > CueContainer.DELTA_TIME) {

                    this.timeRotationTransmitted = this.game.time.time;
                    this.lastRotationTransmitted = this.rotation;

                    if (GameVars.gameMode === GameConstants.PVP_MODE) { MatchManagerPVP.cueRotated(this.rotation); }
                }
            }
        }
    }
}
