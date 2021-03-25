namespace MiniBillar {

    export class RetrySoloLayer extends Phaser.Group {

        private animStarBox: AnimatedStarBox;

        constructor(game: Phaser.Game) {

            super(game, null, "retry-solo-layer");

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .6;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const endGamePortraitContainer = new EndGamePortraitContainer(game, "game_over.png", false);
            this.add(endGamePortraitContainer);

            const buttonRestart = new Phaser.Button(this.game, GameVars.gameWidth / 2 + 50 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickReset, this);
            buttonRestart.setFrames("btn_restart_pressed.png", "btn_restart.png", "btn_restart_pressed.png");
            buttonRestart.anchor.set(.5);
            if (this.game.device.touch) {
                buttonRestart.onInputDown.add(function () { buttonRestart.scale.set(buttonRestart.scale.x * 1.1, buttonRestart.scale.y * 1.1); }, this);
            }
            buttonRestart.onInputOver.add(function () { buttonRestart.scale.set(buttonRestart.scale.x * 1.1, buttonRestart.scale.y * 1.1); }, this);
            buttonRestart.onInputOut.add(function () { buttonRestart.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            buttonRestart.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(buttonRestart);

            const buttonHome = new Phaser.Button(this.game, GameVars.gameWidth / 2 - 120 * GameVars.scaleXMult, GameVars.gameHeight / 2 + 275, "texture_atlas_1", this.onClickHome, this);
            buttonHome.setFrames("btn_close_pressed.png", "btn_close.png", "btn_close_pressed.png");
            buttonHome.anchor.set(.5);
            if (this.game.device.touch) {
                buttonHome.onInputDown.add(function () { buttonHome.scale.set(buttonHome.scale.x * 1.1, buttonHome.scale.y * 1.1); }, this);
            }
            buttonHome.onInputOver.add(function () { buttonHome.scale.set(buttonHome.scale.x * 1.1, buttonHome.scale.y * 1.1); }, this);
            buttonHome.onInputOut.add(function () { buttonHome.scale.set(1, 1); }, this);
            buttonHome.forceOut = true;
            buttonHome.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(buttonHome);
          
            AudioManager.playMusic(AudioManager.LOSE);
        }

        private onClickHome(b: Phaser.Button): void {

            b.clearFrames();

            MatchManager.hidePauseLayer();
            MatchManager.hideRetryLayer();
            MatchManagerSolo.endSoloGame(GameConstants.PLAYER_RESIGNS);

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
            
        }

        private onClickReset(b: Phaser.Button): void {

            b.clearFrames();
            GameVars.paused = false;
            GameVars.rematch = true;

            GameManager.enterSoloGame();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        private onDownTransparentLayer(): void {
            // 
        }
    }
}
