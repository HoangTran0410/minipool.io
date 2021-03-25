namespace MiniBillar {

    export class ForceSettingContainer extends Phaser.Group {

        private forceBar: Phaser.Sprite;
        private powerBarEmpty: Phaser.Sprite;
        private powerMask: Phaser.Graphics;
        private cue: Phaser.Sprite;

        private canMove: boolean;
        private initialY: number;
        private maskHeight: number;

        constructor(game: Phaser.Game) {

            super(game, null, "force-setting-container");

            this.x = GameVars.gameData.powerBarSide === GameConstants.LEFT ? 0 : GameVars.gameWidth;
            this.y = GameVars.gameHeight / 2 + 40;

            this.canMove = true;
            this.initialY = 0;

            this.powerBarEmpty = new Phaser.Sprite(this.game, 0, 0, "texture_atlas_1", "power_bar_empty.png");
            this.powerBarEmpty.anchor.set(0, .5);
            this.powerBarEmpty.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.powerBarEmpty.inputEnabled = true;
            this.powerBarEmpty.events.onInputDown.add(this.onDownPowerBarEmpty, this);
            this.powerBarEmpty.events.onInputUp.add(this.onUpPowerBarEmpty, this);
            this.add(this.powerBarEmpty);

            this.maskHeight = 505 * GameVars.scaleYMult;

            this.powerMask = new Phaser.Graphics(this.game, 0, - this.maskHeight * 0.5);
            this.powerMask.beginFill(0xffffff);
            this.powerMask.drawRect(0, 0, this.powerBarEmpty.width, this.maskHeight);
            this.add(this.powerMask);

            this.forceBar = new Phaser.Sprite(this.game, 0, 0, "texture_atlas_1", "power_bar_full.png");
            this.forceBar.anchor.set(0, .5);
            this.forceBar.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.forceBar.mask = this.powerMask;
            this.add(this.forceBar);

            this.cue = new Phaser.Sprite(this.game, this.powerBarEmpty.x + this.powerBarEmpty.width * 0.5 - 8, 0, "texture_atlas_1", "cue_power.png");
            this.cue.anchor.set(.5);
            this.cue.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(this.cue);

            if (GameVars.gameData.powerBarSide === GameConstants.RIGHT) {
                this.powerBarEmpty.scale.x *= -1;
                this.forceBar.scale.x *= -1;
                this.powerMask.scale.x *= -1;
                this.cue.scale.x *= -1;
                this.cue.x *= -1;
            }

            this.visible = false;
        }

        public update(): void {

            if (CueContainer.currentInstance.settingPower && this.canMove) {

                // mover la barra
                let localY = this.game.input.activePointer.y - this.y - this.initialY;
                localY += 230;
                localY = Phaser.Math.clamp(localY, 0, 430);

                CueContainer.currentInstance.impulseFactor = Billiard.Maths.fixNumber(localY / 430);

                this.cue.y = localY;

                this.powerMask.scale.y = 1 - (localY / 430);

                if (this.powerMask.scale.y === 0) {
                    this.powerMask.scale.y = .001;
                }
            }
        }

        public changeSide(): void {

            this.powerBarEmpty.scale.x *= -1;
            this.forceBar.scale.x *= -1;
            this.powerMask.scale.x *= -1;
            this.cue.scale.x *= -1;
            this.cue.x *= -1;

            if (GameVars.gameData.powerBarSide === GameConstants.LEFT) {
                if (this.canMove) {
                    this.x = 0;
                } else {
                    this.x = -100;
                }
            } else {
                if (this.canMove) {
                    this.x = GameVars.gameWidth;
                } else {
                    this.x = GameVars.gameWidth + 100;
                }
            }
        }

        public show(): void {
            
            this.visible = true;
        }

        public hide() {

            this.canMove = false;

            this.game.add.tween(this.cue)
                .to({ y: 0 }, 150, Phaser.Easing.Cubic.Out, true);
            this.game.add.tween(this)
                .to({ x: this.x - (100 * (GameVars.gameData.powerBarSide === GameConstants.LEFT ? 1 : -1)) }, 200, Phaser.Easing.Cubic.In, true, 100);
            this.game.add.tween(this.powerMask.scale)
                .to({ y: 1 }, 150, Phaser.Easing.Cubic.Out, true);
        }

        public disable() {

            CueContainer.currentInstance.settingPower = false;
            CueContainer.currentInstance.impulseFactor = 0;
        }

        public reset(): void {

            this.canMove = true;

            this.powerMask.scale.y = 1;
            this.cue.y = 0;

            this.game.add.tween(this)
                .to({ x: GameVars.gameData.powerBarSide === GameConstants.LEFT ? 0 : GameVars.gameWidth }, 200, Phaser.Easing.Cubic.Out, true);

            this.disable();
        }

        private onDownPowerBarEmpty(): void {

            if (StageContainer.currentInstance.selectPockets.canSelect) { return; }

            this.initialY = this.game.input.activePointer.y - 110;
            CueContainer.currentInstance.settingPower = true;
        }

        private onUpPowerBarEmpty(): void {

            if (StageContainer.currentInstance.selectPockets.canSelect) { return; }

            CueContainer.currentInstance.settingPower = false;

            if (CueContainer.currentInstance.impulseFactor > 0) {

                this.hide();

                CueContainer.currentInstance.shoot();
            }
        }

    }
}
