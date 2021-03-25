namespace MiniBillar {

    export class PreloadBar extends Phaser.Group {

        private static readonly RECT_WIDTH = 290;
        private static readonly RECT_HEIGTH = 30;

        private preloadCue: Phaser.Image;
        private preloadCueBall: Phaser.Image;
        private percentageLabel: Phaser.Text;
        private f: number;

        constructor(game: Phaser.Game) {

            super(game, null, "preloadbar");

            this.x = GameVars.gameWidth / 2;
            this.y = 395;

            this.f = 0;

            this.scale.x = GameVars.scaleXMult;
            this.scale.y = GameVars.scaleYMult;

            this.preloadCue = new Phaser.Image(this.game, -PreloadBar.RECT_WIDTH / 2, 0, "preload_cue");
            this.preloadCue.anchor.set(1, .5);
            this.add(this.preloadCue);

            this.preloadCueBall = new Phaser.Image(this.game, PreloadBar.RECT_WIDTH / 2 + 22, 0, "preload_cue_ball");
            this.preloadCueBall.anchor.set(.5);
            this.add(this.preloadCueBall);

            const graphics = new Phaser.Graphics(this.game);
            graphics.lineStyle(2, 0xFFFFFF);
            graphics.drawRoundedRect(-PreloadBar.RECT_WIDTH / 2, -PreloadBar.RECT_HEIGTH / 2, PreloadBar.RECT_WIDTH, PreloadBar.RECT_HEIGTH, 10);
            this.add(graphics);

            this.percentageLabel = new Phaser.Text(this.game, 0, 52, "0%", { font: "34px Oswald-DemiBold", fontWeight: "400", fill: "#FFFFFF" });
            this.percentageLabel.anchor.set(.5);
            this.percentageLabel.visible = false;
            this.add(this.percentageLabel);
        }

        public update(): void {

            super.update();

            this.f++;

            if (this.f === 10) {
                this.percentageLabel.visible = true;
            }
        }

        public updateLoadedPercentage(loadProgress: number): void {

            this.percentageLabel.text = loadProgress + "%";

            this.preloadCue.x = -PreloadBar.RECT_WIDTH / 2 + loadProgress / 100 * (PreloadBar.RECT_WIDTH + 6);

            if (loadProgress === 100) {
                this.game.add.tween(this.preloadCue)
                    .to({ x: this.preloadCue.x - 36 }, 300, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(function (): void {
                        this.game.add.tween(this.preloadCue)
                            .to({ x: this.preloadCue.x + 40 }, 100, Phaser.Easing.Cubic.Out, true)
                            .onComplete.add(function (): void {
                                this.game.add.tween(this.preloadCueBall)
                                    .to({ x: (GameVars.gameWidth / 2 + 50) * GameVars.scaleXMultInverse }, 250, Phaser.Easing.Cubic.Out, true)
                                    .onComplete.add(function (): void {
                                        PreLoader.currentInstance.cueBallDisappeared();
                                    }, this);
                            }, this);
                    }, this);
            }
        }
    }
}
