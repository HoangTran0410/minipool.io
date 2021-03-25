namespace MiniBillar {

    export class AvatarBubble extends Phaser.Group {

        private avatarImage: Phaser.Image;
        private timerSprite: Phaser.Sprite;
        private useTimer: boolean;

        constructor(game: Phaser.Game, imageName: string, x: number, y: number, useTimer: boolean) {

            super(game, null, "avatar-bubble");

            this.game = game;
            this.x = x;
            this.y = y;

            this.useTimer = useTimer;

            const bubbleRadiusOuter = 81;
            const bubbleRadiusInner = 74;

            const bubbleBorder = new Phaser.Graphics(this.game);
            bubbleBorder.beginFill(0xd3f1f7);
            bubbleBorder.drawCircle(0, 0, bubbleRadiusOuter);
            this.add(bubbleBorder);

            if (this.useTimer) {
                this.timerSprite = new Phaser.Sprite(this.game, 0, 0, "texture_atlas_1", "timer_60.png");
                this.timerSprite.scale.set(bubbleRadiusOuter / this.timerSprite.width);
                this.timerSprite.anchor.set(.5);
                this.add(this.timerSprite);
            }

            this.avatarImage = new Phaser.Image(this.game, 0, 0, "texture_atlas_5", imageName + ".png");
            this.avatarImage.scale.set(bubbleRadiusInner / this.avatarImage.width);
            this.avatarImage.anchor.set(.5, .325);
            this.avatarImage.scale.set(.425);
            this.add(this.avatarImage);

            const mask = new Phaser.Graphics(this.game);
            mask.beginFill(0xffffff);
            mask.drawCircle(0, 0, bubbleRadiusInner);
            this.add(mask);

            this.avatarImage.mask = mask;
        }

        public hideTimer(skipTween: boolean = false, timeout: boolean): void {

            if (!this.useTimer || !this.timerSprite.visible) {
                return;
            }

            if (skipTween) {
                this.timerSprite.visible = false;
            } else {

                if (timeout) {
                    this.timerSprite.frameName = "timer_1.png";
                }

                this.game.add.tween(this.timerSprite.scale).to(
                    { x: 1.2, y: 1.2 }, 150, Phaser.Easing.Quadratic.Out, true)
                    .onComplete.add(function (): void {
                        this.game.add.tween(this.timerSprite.scale).to(
                            { x: .5, y: .5 }, 750, Phaser.Easing.Quadratic.In, true)
                            .onComplete.add(function (): void {

                                this.timerSprite.visible = false;
                            }, this);
                    }, this);
            }
        }

        public showTimer(): void {

            if (!this.useTimer) {
                return;
            }

            this.timerSprite.scale.set(1);
            this.timerSprite.visible = true;
        }

        public setTimerProgress(frame: number): void {

            if (!this.useTimer) {
                return;
            }

            frame = Phaser.Math.clamp(frame, 1, 60);
            this.timerSprite.frameName = "timer_" + frame + ".png";
        }

        public setFrameName(frameName: string) {

            this.avatarImage.frameName = frameName;
        }

        public setAlpha(alpha: number): void {

            this.avatarImage.alpha = alpha;
        }
    }
}
