namespace MiniBillar {

    export class ChatLayer extends Phaser.Group {

        public static currentInstance: ChatLayer;

        private powerLabel: Phaser.Text;

        constructor(game: Phaser.Game) {

            super(game, null, "chat-layer");

            ChatLayer.currentInstance = this;

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .25;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const menuContainer = new Phaser.Group(this.game);
            menuContainer.x = GameVars.gameWidth / 2;
            menuContainer.y = 85;
            menuContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(menuContainer);

            const rectangleWithRadius = new Phaser.Graphics(this.game);
            menuContainer.add(rectangleWithRadius);

            const rectWidth = 710;
            const rectHeight = 160;
            const radius = 20;
            const px = - rectWidth / 2;
            const py = - rectHeight / 2;

            rectangleWithRadius.beginFill(0x1D2836, .8);
            rectangleWithRadius.drawRoundedRect(px, py, rectWidth, rectHeight, radius);
            rectangleWithRadius.endFill();

            const rows = 3;
            const cols = 14;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {

                    let index = cols * j + i + 1;

                    if (index <= GameVars.emoticonsAmount) {

                        let delta = 50;
                        let x = (i - cols / 2 + .5) * delta;
                        let y = (j - 1) * delta;

                        let emoticonButton = new Phaser.Button(this.game, x, y, "texture_atlas_5", this.onClickEmoticon, this);
                        emoticonButton.setFrames("emoticon_" + index + "_on.png", "emoticon_" + index + ".png", "emoticon_" + index + "_on.png");
                        emoticonButton.name = index.toString();
                        emoticonButton.anchor.set(.5);
                        if (this.game.device.touch) {
                            emoticonButton.onInputDown.add(function () {
                                GameVars.GUIButtonDown = true;
                                emoticonButton.scale.set(emoticonButton.scale.x * 1.1, emoticonButton.scale.y * 1.1);
                            }, this, 5);
                        }
                        emoticonButton.onInputOver.add(function () { emoticonButton.scale.set(emoticonButton.scale.x * 1.1, emoticonButton.scale.y * 1.1); }, this);
                        emoticonButton.onInputOut.add(function () { emoticonButton.scale.set(1); }, this);
                        menuContainer.add(emoticonButton);
                    }
                }
            }
        }

        private onClickEmoticon(b: Phaser.Button): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            b.clearFrames();
            b.scale.set(1);

            MatchManager.emoticonSelected(parseInt(b.name));
        }

        private onDownTransparentLayer(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            PoolState.currentInstance.hideChatLayer();
        }
    }
}
