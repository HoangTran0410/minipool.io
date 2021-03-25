namespace MiniBillar {

    export class SpinCircleLayer extends Phaser.Group {

        public static currentInstance: SpinCircleLayer = null;
        public static discardClick: boolean = false;

        public static SPIN_CIRCLE_RADIUS = 160;

        private redDot: Phaser.Graphics;
        private canMove: boolean;

        constructor(game: Phaser.Game) {

            super(game, null, "spin-circle");

            SpinCircleLayer.currentInstance = this;
            SpinCircleLayer.discardClick = false;

            this.canMove = false;

            let transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .8;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputUp.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const ballContainer = new Phaser.Group(this.game);
            ballContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            ballContainer.x = GameVars.gameWidth / 2;
            ballContainer.y = GameVars.gameHeight / 2;
            this.add(ballContainer);

            const circle = new Phaser.Image(this.game, 0, 0, "texture_atlas_1", "cue_ball.png");
            circle.anchor.set(.5);
            circle.inputEnabled = true;
            circle.input.pixelPerfectClick = true;
            circle.input.pixelPerfectAlpha = 0.5;
            circle.events.onInputDown.add(this.onDownCircle, this);
            circle.events.onInputUp.add(this.onUpCircle, this);
            circle.events.onInputOut.add(this.onUpCircle, this);
            ballContainer.add(circle);

            this.redDot = new Phaser.Graphics(this.game, GameVars.english, GameVars.verticalSpin);
            this.redDot.beginFill(0xf1004f);
            this.redDot.drawCircle(0, 0, 40);
            ballContainer.add(this.redDot);

            this.alpha = 0;
            this.visible = false;
            this.game.add.tween(this)
                .to({ alpha: 1 }, 400, Phaser.Easing.Cubic.Out, true);
        }

        public show(): void {

            this.visible = true;
            this.game.add.tween(this)
                .to({ alpha: 1 }, 400, Phaser.Easing.Cubic.Out, true);
        }

        public hide(): void {

            SpinCircleLayer.discardClick = false;

            this.visible = false;
            this.alpha = 0;
        }

        public reset(): void {

            this.redDot.scale.set(1, 1);
            this.redDot.position.set(0, 0);
        }

        public destroy(): void {

            SpinCircleLayer.currentInstance = null;
            SpinCircleLayer.discardClick = false;

            super.destroy();
        }

        public update(): void {

            super.update();

            if (this.canMove) {

                this.redDot.scale.set(3, 3);
                const x = (this.game.input.activePointer.x - GameVars.gameWidth / 2) * GameVars.scaleXMultInverse;
                const y = (this.game.input.activePointer.y - GameVars.gameHeight / 2) * GameVars.scaleYMultInverse;

                const d = Math.sqrt(x * x + y * y);

                if (d < SpinCircleLayer.SPIN_CIRCLE_RADIUS) {

                    this.redDot.position.set(x , y);
                }
            }
        }

        public onDownTransparentLayer(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            const english = Math.floor(1000 * this.redDot.x / SpinCircleLayer.SPIN_CIRCLE_RADIUS) / 1000;
            const verticalSpin = -Math.floor(1000 * this.redDot.y / SpinCircleLayer.SPIN_CIRCLE_RADIUS) / 1000;

            MatchManager.hideSpinCircleLayer(english, verticalSpin);
        }

        private onDownCircle(): void {

            this.canMove = true;
        }

        private onUpCircle(): void {

            this.canMove = false;
            this.redDot.scale.set(1, 1);
        }
    }
}
