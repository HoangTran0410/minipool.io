/// <reference path="../../typescript/phaser-input.d.ts"/>
namespace MiniBillar {

    export class Boot extends Phaser.State {

        public static currentInstance: Boot;

        public bootedInWrongOrientation: boolean;

        public static onYandexFullscreenChanged() {

            if (!gameConfig) {
                return;
            } else {
                if (gameConfig.GameVersion !== "yandex") {
                    return;
                }
            }

            Game.currentInstance.scale.setGameSize(screen.width, screen.height);
            GameVars.gameWidth = screen.width;
            GameVars.gameHeight = screen.height;

            Boot.onFullScreenChange();

            if (Game.currentInstance.state.current === "SplashState") {
                Game.currentInstance.state.restart(false);
            }
        }

        public static onFullScreenChange(): void {

            const aspectRatio = screen.width / screen.height;

            GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT = (GameVars.gameWidth / GameVars.gameHeight) / aspectRatio;

            if (aspectRatio <= 1.35) {
                GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = .75;
            } else if (aspectRatio <= 1.55) {
                GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = .8;
            } else if (aspectRatio <= 1.65) {
                GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = .9;
            } else {
                GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 1;
            }

            Boot.setScaleMultipliers();

            Game.currentInstance.scale.refresh();
        }

        public static onOrientationChange(): void {

            if (!Boot.currentInstance) {
                return;
            }

            Boot.currentInstance.game.time.events.add(300, function (): void {
                if (Boot.currentInstance.bootedInWrongOrientation && window.innerHeight < window.innerWidth) {
                    Boot.currentInstance.game.state.restart(true, false);
                }
            }, this);
        }

        public static enterIncorrectOrientation(): void {

            document.getElementById("orientation").style.display = "block";
            document.getElementById("content").style.display = "none";
        }

        public static leaveIncorrectOrientation(): void {

            document.getElementById("orientation").style.display = "none";
            document.getElementById("content").style.display = "block";
        }

        public static onBlur(): void {

            Game.currentInstance.sound.mute = true;
        }

        public static onFocus(): void {

            if (!GameVars.gameData.musicMuted) {
                Game.currentInstance.sound.mute = false;
            }
        }

        private static setScaleMultipliers(): void {

            GameVars.scaleXMult = GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT * GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT;
            GameVars.scaleYMult = GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT;
            GameVars.scaleXMultInverse = 1 / GameVars.scaleXMult;
            GameVars.scaleYMultInverse = 1 / GameVars.scaleYMult;

            GameManager.log("scaleX:" + GameVars.scaleXMult + ", "
                + "scaleY:" + GameVars.scaleYMult);
        }

        public init(): void {

            Boot.currentInstance = this;

            this.input.maxPointers = 1;

            this.game.stage.backgroundColor = "#05060a";
            this.game.stage.disableVisibilityChange = true;

            this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

            this.game.scale.pageAlignHorizontally = true;

            if (this.game.device.desktop) {

                this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

                GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT = 1;
                GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 1;

                this.game.scale.pageAlignHorizontally = true;

                if (!gameConfig) { return; } else {
                    if (gameConfig.GameVersion === "yandex") {
                        window.onresize = Boot.onYandexFullscreenChanged;
                        Boot.onYandexFullscreenChanged();
                    }
                }

            } else {

                this.game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;

                if (this.game.scale.compatibility.supportsFullScreen) {
                    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
                    this.game.scale.onFullScreenChange.add(Boot.onFullScreenChange, this);
                } else {
                    console.log("Device does not support fullscreen");
                }

                let aspectRatio = window.innerWidth / window.innerHeight;
                this.scale.setMinMax(window.innerWidth, window.innerHeight);

                GameVars.scaleX_DO_NOT_USE_OUTSIDE_BOOT = (GameVars.gameWidth / GameVars.gameHeight) / aspectRatio;

                if (aspectRatio <= 1.35) {
                    GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = .75;
                } else if (aspectRatio <= 1.55) {
                    GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = .8;
                } else if (aspectRatio <= 1.65) {
                    GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = .9;
                } else {
                    GameVars.correctionScale_DO_NOT_USE_OUTSIDE_BOOT = 1;
                }

                this.game.scale.pageAlignVertically = true;

                this.game.scale.forceOrientation(true, false);
                this.game.scale.onOrientationChange.add(Boot.onOrientationChange, this);
                this.game.scale.enterIncorrectOrientation.add(Boot.enterIncorrectOrientation, Boot);
                this.game.scale.leaveIncorrectOrientation.add(Boot.leaveIncorrectOrientation, Boot);

                this.bootedInWrongOrientation = window.innerHeight > window.innerWidth ? true : false;
                document.getElementById("ti").onblur = () => {
                    if (NameInputLayer.currentInstance) {

                        NameInputLayer.currentInstance.onExitInputFieldMobile();
                        document.getElementById("ti").style.display = "none";
                    }
                };
                document.getElementById("ti").onfocus = () => {
                    if (NameInputLayer.currentInstance) {

                        const tiElement = <HTMLInputElement>document.getElementById("ti");
                        tiElement.value = NameInputLayer.currentInstance.onEnterInputFieldMobile();
                    }
                };
            }

            ifvisible.on("blur", Boot.onBlur);
            ifvisible.on("focus", Boot.onFocus);

            Boot.setScaleMultipliers();

            if (GameConstants.DEVELOPMENT) {
                this.game.time.advancedTiming = true;
            }
        }

        public preload(): void {

            this.load.path = GameConstants.ASSETS_PATH;
            this.load.crossOrigin = "anonymous";
            this.load.image("preload_background", "/preload_background.jpg");
            this.load.image("preload_cue", "/preload-cue.png");
            this.load.image("preload_cue_ball", "/preload-cue-ball.png");
        }

        public create(): void {

            if (!this.game.device.desktop && this.bootedInWrongOrientation) {
                return;
            }

            GameManager.init(this.game);

            this.game.add.plugin(new PhaserInput.Plugin(this.game, this.game.plugins));
        }

        public shutdown(): void {

            Boot.currentInstance = null;

            super.shutdown();
        }
    }
}
