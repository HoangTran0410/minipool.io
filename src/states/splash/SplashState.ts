module MiniBillar {

    export class SplashState extends Phaser.State {

        public static currentInstance: SplashState;

        private settingsLayer: SettingsLayer;
        private scaledItemsContainer: Phaser.Group;
        private portraitButton: Phaser.Button;
        private settingsButton: Phaser.Button;
        private nameLabel: Phaser.Text;
        private playerAvatarContainer: PlayerAvatarContainer;
        private gameLogoShine: Phaser.Sprite;
        private gameLogoShineCounter: number;
        private gameLogo: Phaser.Image;
        private moreGames: Phaser.Image;

        public init(): void {

            SplashState.currentInstance = this;

            this.portraitButton = null;
            this.nameLabel = null;
            this.settingsLayer = null;
        }

        public create(): void {

            const background = this.add.image(GameVars.gameWidth / 2, GameVars.gameHeight / 2, "texture_atlas_2", "splash.png");
            background.anchor.set(.5);
            background.scale.set(GameVars.scaleXMult, GameVars.gameHeight / background.height);

            this.scaledItemsContainer = this.add.group();
            this.scaledItemsContainer.position.set(GameVars.gameWidth / 2, GameVars.gameHeight / 2);
            this.scaledItemsContainer.scale.x = GameVars.scaleXMult;
            this.scaledItemsContainer.scale.y = GameVars.scaleYMult;

            this.gameLogo = new Phaser.Image(this.game, GameVars.gameWidth / 2, 135, "texture_atlas_1", "game_logo.png");
            this.gameLogo.anchor.set(.5);
            this.gameLogo.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.add.existing(this.gameLogo);

            this.gameLogoShine = new Phaser.Sprite(this.game, this.gameLogo.x - 11, this.gameLogo.y - 18, "texture_atlas_1");
            this.gameLogoShine.visible = false;
            const gameLogoShineFrames = Utils.createAnimFramesArr("game_logo_shine", 19);
            this.gameLogoShine.animations.add("shine", gameLogoShineFrames, 24);
            this.gameLogoShine.frameName = gameLogoShineFrames[0];
            this.gameLogoShine.anchor.set(.5);
            this.gameLogoShine.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.gameLogoShineCounter = this.game.rnd.integerInRange(4, 8);
            this.add.existing(this.gameLogoShine);

            this.playerAvatarContainer = new PlayerAvatarContainer(this.game);
            this.playerAvatarContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.playerAvatarContainer.x = 55;
            this.playerAvatarContainer.y = 55;
            this.add.existing(this.playerAvatarContainer);

            if (!GameVars.gameData.statistics.rewards.allUnlocked) {

                const animStarBox = new AnimatedStarBox(this.game, true);
                animStarBox.x = 120 * GameVars.scaleXMult;
                animStarBox.y = GameVars.gameHeight - 35 * GameVars.scaleYMult;
                for (let i = 0; i < RewardsManager.getCurrentStarProgress(); i++) {
                    animStarBox.setStarActive(i);
                }
                this.add.existing(animStarBox);
            }

            this.settingsButton = this.add.button(GameVars.gameWidth - 45 * GameVars.scaleXMult, 45, "texture_atlas_1", this.showSettingsLayer, this);
            this.settingsButton.setFrames("btn_settings_on.png", "btn_settings_off.png", "btn_settings_on.png", "btn_settings_off.png");
            this.settingsButton.anchor.set(.5);
            if (this.game.device.touch) {
                this.settingsButton.onInputDown.add(function (): void { this.settingsButton.scale.set(this.settingsButton.scale.x * 1.1, this.settingsButton.scale.y * 1.1); }, this);
            }
            this.settingsButton.onInputOver.add(function (): void { this.settingsButton.scale.set(this.settingsButton.scale.x * 1.1, this.settingsButton.scale.y * 1.1); }, this);
            this.settingsButton.onInputOut.add(function (): void { this.settingsButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            this.settingsButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            // LOS BOTONES DE LAS STORES
            if (!this.game.device.cordova && gameConfig.GameVersion !== "yandex" ) {
                const googlePlayButton = this.add.button(GameVars.gameWidth - 45 * GameVars.scaleXMult, 116, "texture_atlas_1", this.onStoreButtonClicked, this);
                googlePlayButton.setFrames("btn_google_on.png", "btn_google_off.png", "btn_google_on.png", "btn_google_off.png");
                googlePlayButton.anchor.set(.5);
                googlePlayButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                googlePlayButton.name = GameConstants.ANDROID;

                const appStoreButton = this.add.button(GameVars.gameWidth - 45 * GameVars.scaleXMult, 192, "texture_atlas_1", this.onStoreButtonClicked, this);
                appStoreButton.setFrames("btn_apple_on.png", "btn_apple_off.png", "btn_apple_on.png", "btn_apple_off.png");
                appStoreButton.anchor.set(.5);
                appStoreButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                appStoreButton.name = GameConstants.APPLE;
            }

            this.moreGames = new Phaser.Image(this.game, 52, -30, "more-games");
            this.moreGames.anchor.set(.5);
            this.moreGames.inputEnabled = true;
            this.moreGames.events.onInputOver.add(function(): void {
                this.moreGames.scale.set(1.05);
            }, this);
            this.moreGames.events.onInputOut.add(function(): void {
                this.moreGames.scale.set(1);
            }, this);
            this.moreGames.events.onInputDown.add(function(): void {
                let targetUrl = "https://mnj.gs/more-pool";
                if (typeof gameConfig.GameVersion !== "undefined" && gameConfig.GameVersion === "yandex") {
                    targetUrl = "https://yandex.ru/games/";
                }
                const win: Window = window.open(targetUrl);
                win.focus();
            }, this);
            this.scaledItemsContainer.add(this.moreGames);

            const pvpButton = new Phaser.Button(this.game, -175, 235 * GameVars.scaleYMultInverse, "texture_atlas_1", this.onClickPVP, this);
            pvpButton.setFrames("btn_pvp_on.png", "btn_pvp_off.png", "btn_pvp_on.png");
            if (this.game.device.touch) {
                pvpButton.onInputDown.add(function (): void { pvpButton.scale.set(pvpButton.scale.x * 1.1, pvpButton.scale.y * 1.1); }, this);
            }
            pvpButton.onInputOver.add(function (): void { pvpButton.scale.set(pvpButton.scale.x * 1.1, pvpButton.scale.y * 1.1); }, this);
            pvpButton.onInputOut.add(function (): void { pvpButton.scale.set(1); }, this);
            pvpButton.anchor.set(.5);
            this.scaledItemsContainer.add(pvpButton);

            const soloButton = new Phaser.Button(this.game, 175, 235 * GameVars.scaleYMultInverse, "texture_atlas_1", this.onClickSolo);
            soloButton.setFrames("btn_solo_on.png", "btn_solo_off.png", "btn_solo_on.png");
            if (this.game.device.touch) {
                soloButton.onInputDown.add(function (): void { soloButton.scale.set(soloButton.scale.x * 1.1, soloButton.scale.y * 1.1); }, this);
            }
            soloButton.onInputOver.add(function (): void { soloButton.scale.set(soloButton.scale.x * 1.1, soloButton.scale.y * 1.1); }, this);
            soloButton.onInputOut.add(function (): void { soloButton.scale.set(1); }, this);
            soloButton.anchor.set(.5);
            this.scaledItemsContainer.add(soloButton);

            const buttonEquipment = this.add.button(GameVars.gameWidth - 61 * GameVars.scaleXMult, GameVars.gameHeight - 74 * GameVars.scaleYMult, "texture_atlas_1", this.onClickEquipment, this);
            buttonEquipment.setFrames("btn_equipment_on.png", "btn_equipment_off.png", "btn_equipment_on.png", "btn_equipment_off.png");
            if (this.game.device.touch) {
                buttonEquipment.onInputDown.add(function (): void { buttonEquipment.scale.set(buttonEquipment.scale.x * 1.1, buttonEquipment.scale.y * 1.1); }, this);
            }
            buttonEquipment.onInputOver.add(function (): void { buttonEquipment.scale.set(buttonEquipment.scale.x * 1.1, buttonEquipment.scale.y * 1.1); }, this);
            buttonEquipment.onInputOut.add(function (): void { buttonEquipment.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            buttonEquipment.anchor.set(0.5);
            buttonEquipment.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            AudioManager.playMusic(AudioManager.MUSIC_MINIBILLARD, true);

            this.game.camera.flash(0x000000, 350, false);
        }

        public shutdown(): void {

            SplashState.currentInstance = null;

            super.shutdown();
        }

        public update(): void {

            if (GameVars.goDirectlyToLobby) {
                GameVars.goDirectlyToLobby = false;
                GameManager.enterPVPGame();
            }

            if (this.gameLogoShineCounter < 0) {

                this.gameLogoShine.visible = true;
                this.gameLogoShine.play("shine");
                this.game.add.tween(this.gameLogoShine.scale).to({ x: this.gameLogoShine.scale.x * 1.05, y: this.gameLogoShine.scale.y * 1.05 }, 250, Phaser.Easing.Cubic.Out, true, 150, 0, true);
                this.game.add.tween(this.gameLogo.scale).to({ x: this.gameLogo.scale.x * 1.05, y: this.gameLogo.scale.y * 1.05 }, 250, Phaser.Easing.Cubic.Out, true, 150, 0, true);

                this.gameLogoShineCounter = this.game.rnd.integerInRange(4, 8);
            } else {
                this.gameLogoShineCounter -= this.game.time.physicsElapsed;
            }
        }

        public refreshPortraitAndName(doWriteGameData: boolean): void {

            this.portraitButton.setFrames(
                GameVars.gameData.playerData.avatar,
                GameVars.gameData.playerData.avatar,
                GameVars.gameData.playerData.avatar,
                GameVars.gameData.playerData.avatar);

            this.nameLabel.text = GameVars.gameData.playerData.nick;

            if (doWriteGameData) { GameManager.writeGameData(); }
        }

        public hideSettingsLayer(): void {

            this.settingsLayer.destroy();
        }

        private showSettingsLayer(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            this.settingsButton.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.settingsLayer = new SettingsLayer(this.game);
            this.add.existing(this.settingsLayer);
        }

        private onClickSolo(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameManager.enterSoloGame(true);
        }

        private onClickPVP(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameManager.enterPVPGame();
        }

        private onClickEquipment(b: Phaser.Button): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameManager.enterEquipment();
        }

        private onStoreButtonClicked(b: Phaser.Button): void {

            let win: Window;

            if (b.name === GameConstants.APPLE) {
                win = window.open("https://mnj.gs/minipool-ios");
            } else {
                win = window.open("https://mnj.gs/minipool-android");
            }

            win.focus();

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }
    }
}
