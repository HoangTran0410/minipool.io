module MiniBillar {

    export class PreLoader extends Phaser.State {

        public static currentInstance: PreLoader;

        private preloadBar: PreloadBar;

        public init(): void {

            PreLoader.currentInstance = this;
        }

        public preload(): void {

            Phaser.Canvas.setBackgroundColor(this.game.canvas, "#000000");

            this.generateBitmapData();
            this.composeScene();
            this.loadAssets();
        }

        public create(): void {
            // nada
        }

        public cueBallDisappeared(): void {

            this.game.time.events.add(GameConstants.DEVELOPMENT ? 50 : 350, function (): void {
                GameManager.onGameAssetsLoaded();
            }, this);
        }

        public shutdown(): void {

            PreLoader.currentInstance = this;

            super.shutdown();
        }

        private updateLoadedPercentage(): void {

            this.preloadBar.updateLoadedPercentage(this.load.progress);
        }

        private generateBitmapData(): void {

            let bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.BLACK_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#000000";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.BLACK_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#000000";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.WHITE_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#FFFFFF";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.RED_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#FF0000";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.ORANGE_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#FF9900";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.YELLOW_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#FFFF00";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.GREEN_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#00FF00";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.BLUE_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#0f1726";
            bmd.ctx.fill();

            bmd = this.game.add.bitmapData(GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE, GameConstants.GREY_SQUARE, true);
            bmd.ctx.beginPath();
            bmd.ctx.rect(0, 0, GameConstants.BITMAP_SIZE, GameConstants.BITMAP_SIZE);
            bmd.ctx.fillStyle = "#2F3237";
            bmd.ctx.fill();
        }

        private composeScene(): void {

            this.add.text(GameVars.gameWidth * .5, GameVars.gameHeight * .5, "ABCDEFG", { font: "30px Oswald-DemiBold", fontWeight: "400", fill: "#542200", align: "center" });
            this.add.text(GameVars.gameWidth * .5, GameVars.gameHeight * .5, "ABCDEFG", { font: "30px Oswald-Medium", fontWeight: "400", fill: "#542200", align: "center" });

            const background = this.add.image(GameVars.gameWidth / 2, GameVars.gameHeight / 2, "preload_background");
            background.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            background.anchor.set(.5);

            this.preloadBar = new PreloadBar(this.game);
            this.add.existing(this.preloadBar);
        }

        private loadAssets(): void {

            // FUENTES BITMAP
            if (GameConstants.DEVELOPMENT) {
                this.load.atlasJSONArray("texture_atlas_0", "/texture_atlas_0.png", "/texture_atlas_0.json");
            }

            this.load.atlasJSONArray("texture_atlas_1", "/texture_atlas_1.png", "/texture_atlas_1.json");
            this.load.atlasJSONArray("texture_atlas_3", "/texture_atlas_3.png", "/texture_atlas_3.json");
            this.load.atlasJSONArray("texture_atlas_2", "/texture_atlas_2.jpg", "/texture_atlas_2.json");
            this.load.atlasJSONArray("texture_atlas_4", "/texture_atlas_4.png", "/texture_atlas_4.json");
            this.load.atlasJSONArray("texture_atlas_5", "/texture_atlas_5.png", "/texture_atlas_5.json");

            // LA IAMGEN CON EL MORE GAMES
            this.load.image("more-games", "/neon_pool_io.png");

            // AUDIO
            this.load.audiosprite("audio-sprite", ["/audio/audiosprite.mp3", "/audio/audiosprite.ogg"], "/audio/audiosprite.json");

            // TEXTOS DEL JUEGO
            this.load.json("card-data", "/config/card_data.json");

            this.load.onFileComplete.add(this.updateLoadedPercentage, this);
        }
    }
}
