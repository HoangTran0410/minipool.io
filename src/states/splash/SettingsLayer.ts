namespace MiniBillar {

    export class SettingsLayer extends Phaser.Group {

        public static currentInstance: SettingsLayer;

        private powerLabel: Phaser.Text;

        constructor(game: Phaser.Game) {

            super(game, null, "settings-layer");

            SettingsLayer.currentInstance = this;

            const transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .96;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputDown.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            const buttonBack = new Phaser.Button(this.game, 38 * GameVars.scaleXMult, 38 * GameVars.scaleYMult, "texture_atlas_1", this.onClickExit, this);
            buttonBack.setFrames("btn_back_on.png", "btn_back_off.png", "btn_back_on.png");
            buttonBack.anchor.set(.5);
            buttonBack.forceOut = true;
            if (this.game.device.touch) {
                buttonBack.onInputDown.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            }
            buttonBack.onInputOver.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            buttonBack.onInputOut.add(function () { buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(buttonBack);

            const titleLabel = new Phaser.Text(this.game, GameVars.gameWidth / 2, 40, "SETTINGS", { font: "56px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8" });
            titleLabel.anchor.x = .5;
            titleLabel.stroke = "#2f3237";
            titleLabel.strokeThickness = 5;
            titleLabel.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(titleLabel);

            const scaledItemsContainer = new Phaser.Group(this.game);
            scaledItemsContainer.x = GameVars.gameWidth / 2;
            scaledItemsContainer.y = GameVars.gameHeight / 2;
            scaledItemsContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(scaledItemsContainer);

            const audioSwitchButton = new SwitchButton(this.game, !GameVars.gameData.musicMuted, SwitchButton.MUSIC);
            audioSwitchButton.x = 30;
            audioSwitchButton.y = -100;
            scaledItemsContainer.add(audioSwitchButton);

            const audioLabel = new Phaser.Text(this.game, -24, audioSwitchButton.y + 2, "AUDIO", { font: "24px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center", stroke: "#2f3237", strokeThickness: 3 });
            audioLabel.anchor.set(1, .5);
            scaledItemsContainer.add(audioLabel);

            if (this.game.device.touch) {

                const switchStartingState = GameVars.gameData.powerBarSide === GameConstants.RIGHT;
                const powerSwitchButton = new SwitchButton(this.game, switchStartingState, SwitchButton.POWER);
                powerSwitchButton.x = 30;
                powerSwitchButton.y = -160;
                scaledItemsContainer.add(powerSwitchButton);

                const powerTextLeft = "POWER BAR: LEFT";
                const powerTextRight = "POWER BAR: RIGHT";
                this.powerLabel = new Phaser.Text(this.game, -24, powerSwitchButton.y + 2, powerTextLeft, { font: "24px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center", stroke: "#2f3237", strokeThickness: 3 });
                this.powerLabel.anchor.set(1, .5);
                scaledItemsContainer.add(this.powerLabel);
                if (GameVars.gameData.powerBarSide === GameConstants.RIGHT) { this.powerLabel.text = powerTextRight; }

                if (GameVars.gameMode !== GameConstants.SOLO_MODE) {
                    scaledItemsContainer.y += 100;
                }
            }

            if (GameConstants.DEVELOPMENT) {
                const buttonBot = new Phaser.Button(this.game, 10 * GameVars.scaleXMult, GameVars.gameHeight - 10 * GameVars.scaleYMult, "texture_atlas_0", this.onClickBot, this);
                buttonBot.anchor.set(0, 1);
                buttonBot.setFrames("btn_bot_pressed.png", "btn_bot.png", "btn_bot_pressed.png", "btn_bot.png");
                buttonBot.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.add(buttonBot);
            }

            const copyrightLabel = new Phaser.Text(this.game, GameVars.gameWidth * 0.5, GameVars.gameHeight - 46, "developed by RavalMatic", { font: "28px Oswald-DemiBold", fill: "#E5FFFF" });
            copyrightLabel.anchor.x = .5;
            copyrightLabel.alpha = .75;
            copyrightLabel.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(copyrightLabel);

            const versionLabel = new Phaser.Text(this.game, 30, GameVars.gameHeight - 26, "v" + GameConstants.VERSION, { font: "16px Arial", fill: "#E5FFFF" });
            versionLabel.anchor.x = .5;
            versionLabel.alpha = .75;
            versionLabel.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add(versionLabel);

            this.alpha = 0;
            this.game.add.tween(this)
                .to({ alpha: 1 }, 400, Phaser.Easing.Cubic.Out, true);
        }

        public changePower(): void {

            const powerTextLeft = "POWER BAR: LEFT";
            const powerTextRight = "POWER BAR: RIGHT";

            if (GameVars.gameData.powerBarSide === GameConstants.LEFT) {
                this.powerLabel.text = powerTextLeft;
            } else {
                this.powerLabel.text = powerTextRight;
            }
        }

        public destroy(): void {

            PauseLayer.currentInstance = null;
            super.destroy();
        }

        private onClickExit(b: Phaser.Button): void {

            b.clearFrames();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            SplashState.currentInstance.hideSettingsLayer();
        }

        private onClickBot(b: Phaser.Button): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

             b.clearFrames();

            GameManager.setupBotMatchData();
                       
            GameManager.enterPVBotGame();
        }

        private onDownTransparentLayer(): void {
            // 
        }
    }
}
