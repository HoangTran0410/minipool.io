namespace MiniBillar {

    export class EndGamePortraitContainer extends Phaser.Group {

        private rotateRays: boolean;
        private portraitRaysImage: Phaser.Image;
        private avatarBubble: AvatarBubble;
        private messageImage: Phaser.Image;

        constructor(game: Phaser.Game, messageImageFilename: string, isWinner: boolean) {

            super(game, null, "end-game-portrait-container");

            const portraitPackY = 280;

            if (isWinner) {

                this.rotateRays = true;

                const rayContainer = this.game.add.group();
                rayContainer.position.set(GameVars.gameWidth / 2, portraitPackY);
                rayContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(rayContainer);
                this.sendToBack(rayContainer);

                this.portraitRaysImage = new Phaser.Image(game, 0, 0, "texture_atlas_1", "rays_win.png");
                this.portraitRaysImage.anchor.set(0.5);
                rayContainer.add(this.portraitRaysImage);

                this.game.add.tween(this.portraitRaysImage.scale)
                    .from({ x: .1, y: .1 }, 950, Phaser.Easing.Cubic.Out, true);

            } else {

                this.rotateRays = false;
                this.portraitRaysImage = null;
            }

            this.avatarBubble = new AvatarBubble(this.game, GameVars.gameData.playerData.avatar, GameVars.gameWidth / 2, portraitPackY, false);
            this.avatarBubble.scale.set(GameVars.scaleXMult * 1.78, GameVars.scaleYMult * 1.78);
            this.add(this.avatarBubble);

            this.messageImage = new Phaser.Image(game, GameVars.gameWidth / 2, portraitPackY + 64, "texture_atlas_1", messageImageFilename);
            this.messageImage.anchor.set(0.5);
            this.messageImage.scale.set(GameVars.scaleXMult, .001);
            this.add(this.messageImage);

            this.game.add.tween(this.avatarBubble.scale).from({ x: .1, y: .1 }, 800, Phaser.Easing.Elastic.Out, true)
                .onComplete.add(function (): void {

                    this.game.add.tween(this.messageImage.scale)
                        .to({ y: GameVars.scaleYMult }, 800, Phaser.Easing.Elastic.Out, true);
                }, this);
        }

        public update(): void {

            super.update();

            if (this.rotateRays) {

                this.portraitRaysImage.angle += .2;
            }
        }
    }
}
