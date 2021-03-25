namespace MiniBillar {

    export class AdversaryLeftLayer extends Phaser.Group {

        private showButtonsTimer: number;
        private buttonsCreated: boolean;

        constructor(game: Phaser.Game) {

            super(game, null, "adversary-left-layer");

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .75;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const text = new Phaser.Text(this.game, GameVars.gameWidth * .5, 350, "ADVERSARY CONNECTION LOST", { font: "60px Oswald-DemiBold", fontWeight: "600", fill: "#EB3359"});
            text.stroke = "#673952";
            text.strokeThickness = 5;
            text.anchor.set(.5);
            this.add(text);

            this.showButtonsTimer = 1;
        }

        public update(): void {

            if (!this.buttonsCreated) {

                if (this.showButtonsTimer < 0) {

                    this.buttonsCreated = true;

                    const buttonHome = new Phaser.Button(this.game, GameVars.gameWidth / 2 - 120 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickHome, this);
                    buttonHome.setFrames("btn_close_pressed.png", "btn_close.png", "btn_close_pressed.png", "btn_close.png");
                    buttonHome.anchor.set(.5);
                    if (this.game.device.touch) {
                        buttonHome.onInputDown.add(function () { buttonHome.scale.set(buttonHome.scale.x * 1.1, buttonHome.scale.y * 1.1); }, this);
                    }
                    buttonHome.onInputOver.add(function () { buttonHome.scale.set(buttonHome.scale.x * 1.1, buttonHome.scale.y * 1.1); }, this);
                    buttonHome.onInputOut.add(function () { buttonHome.scale.set(1, 1); }, this);
                    buttonHome.forceOut = true;
                    buttonHome.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                    this.add(buttonHome);

                    const buttonNewRival = new Phaser.Button(this.game, GameVars.gameWidth / 2 + 50 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickNewRival, this);
                    buttonNewRival.setFrames("btn_new_rival_pressed.png", "btn_new_rival.png", "btn_new_rival_pressed.png", "btn_new_rival.png");
                    buttonNewRival.anchor.set(.5);
                    if (this.game.device.touch) {
                        buttonNewRival.onInputDown.add(function () { buttonNewRival.scale.set(buttonNewRival.scale.x * 1.1, buttonNewRival.scale.y * 1.1); }, this);
                    }
                    buttonNewRival.onInputOver.add(function () { buttonNewRival.scale.set(buttonNewRival.scale.x * 1.1, buttonNewRival.scale.y * 1.1); }, this);
                    buttonNewRival.onInputOut.add(function () { buttonNewRival.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
                    buttonNewRival.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                    this.add(buttonNewRival);
              
                } else { 
                    this.showButtonsTimer -= this.game.time.physicsElapsed; 
                }
            }
        }

        private onClickHome(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hideAdversaryLeftLayer();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickNewRival(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hideAdversaryLeftLayer();
            GameVars.goDirectlyToLobby = true;

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onDownTransparentLayer(): void {
            // 
        }
    }
}
