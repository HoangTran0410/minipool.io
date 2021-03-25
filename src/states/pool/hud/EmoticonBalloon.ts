// https://emojiisland.com/pages/free-download-emoji-icons-png
// https://emojipedia.org/broken-heart/
namespace MiniBillar {

    export class EmoticonBalloon extends Phaser.Group {

        private emoticon: Phaser.Image;
        private isPlayer: boolean;
        private f: number;

        constructor(game: Phaser.Game, isPlayer: boolean) {

            super(game, null, "emoticon-balloon");

            this.isPlayer = isPlayer;

            this.visible = false;
            this.scale.set(0);

            const balloon = new Phaser.Image(this.game, 0, 0, "texture_atlas_1", "emoticon_balloon.png");
            balloon.anchor.set(.5);
            if (!isPlayer) {
                balloon.scale.x = -1;
            }
            this.add(balloon);

            this.emoticon = new Phaser.Image(this.game, balloon.x, balloon.y + 4, "texture_atlas_5");
            this.emoticon.anchor.set(.5);
            this.add(this.emoticon);
        }

        public update(): void {

            super.update();

            if (this.visible) {

                this.f ++;

                if (this.f === 300) {
                    this.hide();
                }
            }
        }

        public showEmoticon(emoticonID: number): void {

            emoticonID = emoticonID || 1;

            this.f = 0;

            this.emoticon.frameName = "emoticon_" + emoticonID + ".png";

            this.visible = true;
            this.scale.set(0);

            let delay = this.isPlayer ? 250 : 0;

            this.game.add.tween(this.scale)
                .to ({x: 1, y: 1}, 400, Phaser.Easing.Elastic.Out, true, delay);
        }

        private hide(): void {

            this.game.add.tween(this.scale)
                .to ({x: 0, y: 0}, 750, Phaser.Easing.Elastic.In, true)
                .onComplete.add(function(): void {

                    this.visible = false;

                    if (this.isPlayer) {
                        PoolState.currentInstance.onPlayerEmoticonShown();
                    }

                }, this); 
        }
    }
}
