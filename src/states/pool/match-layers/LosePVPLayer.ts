namespace MiniBillar {

    export class LosePVPLayer extends Phaser.Group {

        private animStarBox: AnimatedStarBox;

        constructor(game: Phaser.Game) {

            super(game, null, "lose-pvp-layer");

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .6;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const endGamePortraitContainer = new EndGamePortraitContainer(game, "you_lose.png", false);
            this.add(endGamePortraitContainer);

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

            AudioManager.playMusic(AudioManager.LOSE);
        }

        private onClickHome(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hideLoseLayer();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onClickNewRival(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hideLoseLayer();
            GameVars.goDirectlyToLobby = true;

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onDownTransparentLayer(): void {
            // 
        }
    }
}
