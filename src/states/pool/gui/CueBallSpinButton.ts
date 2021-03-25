module MiniBillar {

    export class CueBallSpinButton extends Phaser.Group {

        private cueBallButton: Phaser.Button;
        private redDot: Phaser.Graphics;

        constructor(game: Phaser.Game) {

            super(game, null, "cue-ball-spin-button");

            this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            this.cueBallButton = new Phaser.Button(this.game, 0, 0, "texture_atlas_1", this.onUpCueBallButton, this);
            this.cueBallButton.forceOut = true;
            this.cueBallButton.setFrames("btn_spin_pressed.png", "btn_spin.png", "btn_spin_pressed.png", "btn_spin.png");
            if (this.game.device.touch) {
                this.cueBallButton.onInputDown.add(function () {
                    GameVars.GUIButtonDown = true;
                    this.cueBallButton.scale.set(this.cueBallButton.scale.x * 1.1, this.cueBallButton.scale.y * 1.1);
                }, this, 5);
            }
            this.cueBallButton.onInputOver.add(function () { this.cueBallButton.scale.set(this.cueBallButton.scale.x * 1.1, this.cueBallButton.scale.y * 1.1); }, this);
            this.cueBallButton.onInputOut.add(function () { this.cueBallButton.scale.set(1, 1); }, this);
            this.cueBallButton.anchor.set(.5);
            this.add(this.cueBallButton);

            this.redDot = new Phaser.Graphics(this.game, 0, 0);
            this.redDot.beginFill(0xFA2E63);
            this.redDot.drawCircle(0, 0, 7);
            this.add(this.redDot);
        }

        public disable(): void {

            this.cueBallButton.alpha = .6;
            this.cueBallButton.inputEnabled = false;

            this.redDot.x = 0;
            this.redDot.y = 0;
        }

        public enable(): void {

            this.cueBallButton.alpha = 1;
            this.cueBallButton.inputEnabled = true;

            this.redDot.x = 0;
            this.redDot.y = 0;
        }

        public setRedPointPosition(english?: number, verticalSpin?: number): void {

            if (english && verticalSpin) {

                const x = GUI.CUE_BALL_BUTTON_SCALE * SpinCircleLayer.SPIN_CIRCLE_RADIUS * english;
                const y = -GUI.CUE_BALL_BUTTON_SCALE * SpinCircleLayer.SPIN_CIRCLE_RADIUS * verticalSpin;

                this.game.add.tween(this.cueBallButton.scale)
                    .to({ x: 1.125, y: 1.125 }, 175, Phaser.Easing.Cubic.Out, true, 0, 0, true);

                this.game.add.tween(this.redDot)
                    .to({ x: x, y: y }, 350, Phaser.Easing.Cubic.Out, true, 400);

            } else {

                this.redDot.x = GUI.CUE_BALL_BUTTON_SCALE * SpinCircleLayer.SPIN_CIRCLE_RADIUS * GameVars.english;
                this.redDot.y = -GUI.CUE_BALL_BUTTON_SCALE * SpinCircleLayer.SPIN_CIRCLE_RADIUS * GameVars.verticalSpin;
            }
        }

        private onUpCueBallButton(): void {

            this.cueBallButton.scale.set(1, 1);

            if (GameVars.shotRunning || (GameVars.gameMode !== GameConstants.SOLO_MODE && GameVars.currentTurn !== GameConstants.PLAYER)) {
                return;
            }

            MatchManager.showSpinCircleLayer();
            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }
    }
}
