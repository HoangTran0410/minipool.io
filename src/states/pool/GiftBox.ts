namespace MiniBillar {

    export class GiftBox extends Phaser.Group {

        private static readonly GIFTBOX_OPENING_DURATION = 700;

        public boxOpeningTween: Phaser.Tween;

        private boxImage: Phaser.Image;
        private lidImage: Phaser.Image;
        private sparkleSprite1: Phaser.Sprite;
        private sparkleSprite2: Phaser.Sprite;

        constructor(game: Phaser.Game, x: number, y: number) {

            super(game, null, "giftbox");

            this.scale.set(.5);

            this.position.set(x, y);

            const sparkleFrames = Utils.createAnimFramesArr("sparkle_effect", 14, false, 0, 15);
            const sparkleUpscale = 1.5;

            this.sparkleSprite1 = new Phaser.Sprite(this.game, -50, - 100, "texture_atlas_1");
            this.sparkleSprite1.anchor.set(0.5);
            this.sparkleSprite1.animations.add("sparkle", sparkleFrames);
            this.sparkleSprite1.visible = false;
            this.sparkleSprite1.scale.x *= sparkleUpscale;
            this.sparkleSprite1.scale.y *= sparkleUpscale;
            this.add(this.sparkleSprite1);

            this.sparkleSprite2 = new Phaser.Sprite(this.game, 50, - 100, "texture_atlas_1");
            this.sparkleSprite2.anchor.set(0.5);
            this.sparkleSprite2.animations.add("sparkle", sparkleFrames);
            this.sparkleSprite2.visible = false;
            this.sparkleSprite2.scale.x *= sparkleUpscale;
            this.sparkleSprite2.scale.y *= sparkleUpscale;
            this.add(this.sparkleSprite2);

            this.boxImage = new Phaser.Image(game, 0, -50, "texture_atlas_1", "gift_box.png");
            this.boxImage.anchor.set(.5);
            this.add(this.boxImage);

            this.lidImage = new Phaser.Image(game, 0, -50, "texture_atlas_1", "gift_lid.png");
            this.lidImage.anchor.set(.5);
            this.add(this.lidImage);

            this.boxOpeningTween = this.boxOpeningTween = this.game.add.tween(this.lidImage)
                .to({ x: this.lidImage.x - 160 }, GiftBox.GIFTBOX_OPENING_DURATION, Phaser.Easing.Cubic.InOut);
        }

        public openGiftBox(): void {

            AudioManager.playEffect(AudioManager.GIFT_OPENS);

            this.boxOpeningTween.start();

            this.sparkleSprite1.visible = true;
            this.sparkleSprite2.visible = true;
            this.sparkleSprite1.play("sparkle", 24, false, true);
            this.sparkleSprite2.play("sparkle", 24, false, true);

            this.game.add.tween(this.lidImage)
                .to({ y: this.lidImage.y - 62 }, GiftBox.GIFTBOX_OPENING_DURATION * .4, Phaser.Easing.Linear.None, true)
                .onComplete.add(function (): void {

                    this.sendToBack(this.lidImage);
                    this.game.add.tween(this.lidImage)
                        .to({ y: this.lidImage.y + 124, alpha: .5 }, GiftBox.GIFTBOX_OPENING_DURATION * .4, Phaser.Easing.Linear.None, true);
                }, this);
        }
    }
}
