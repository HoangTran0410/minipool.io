namespace MiniBillar {

    export class NotificationLayer extends Phaser.Group {

        public static currentInstance: NotificationLayer;

        private layerFadeDuration: number;
        private layerDisplayDuration: number;
        private notificationDurationScaleModifier: number;

        constructor(game: Phaser.Game, type: string, isPlayerTurn: boolean, opponentChoosingPocket: boolean) {

            super(game, null, "messages-layer");

            NotificationLayer.currentInstance = this;

            this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            this.x = GameVars.gameWidth / 2;
            this.y = GameVars.gameHeight / 2;

            this.notificationDurationScaleModifier = 0.4;

            this.layerFadeDuration = 1000 * this.notificationDurationScaleModifier;
            this.layerDisplayDuration = 7000 * this.notificationDurationScaleModifier;

            this.alpha = 0;
            this.game.add.tween(this)
                .to({ alpha: 1 }, this.layerFadeDuration, Phaser.Easing.Cubic.Out, true)
                .onComplete.add(function (): void {
                    NotificationLayer.currentInstance.hideNotification();
                }, this);

            if (GameVars.gameMode !== GameConstants.SOLO_MODE) {

                this.showNonSOLONotification(type, isPlayerTurn, opponentChoosingPocket);

            } else {

                if (type === GameConstants.NOTIFICATION_FIRST_TIME_INSTRUCTIONS) {

                    const transparentBackground = new Phaser.Sprite(this.game, 0, 145, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
                    transparentBackground.anchor.set(0.5, 0);
                    transparentBackground.alpha = .6;
                    this.add(transparentBackground);

                    let rulesText = new Phaser.Text(this.game, 0, 160, GameConstants.RULES_TEXT, { font: this.game.device.desktop ? "24px Oswald-DemiBold" : "34px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center", stroke: "#2f3237", strokeThickness: 3 });
                    rulesText.anchor.set(0.5, 0);
                    Utils.colourRulesText(rulesText);
                    this.add(rulesText);

                    transparentBackground.scale.set((rulesText.width + 40) / 64, (rulesText.height + 30) / 64);

                    this.layerDisplayDuration = 16000 * this.notificationDurationScaleModifier;
                }
            }
        }

        public hideNotification(): void {

            if (!this.game) { return; }

            this.game.add.tween(this)
                .to({ alpha: 0 }, this.layerFadeDuration, Phaser.Easing.Cubic.Out, true, this.layerDisplayDuration)
                .onComplete.add(function (): void {
                    PoolState.currentInstance.hideNotificationLayer();
                }, this);
        }

        private showNonSOLONotification(type: string, isPlayerTurn: boolean, opponentChoosingPocket: boolean): void {

            const turnImageSwipeDuration = 1000 * this.notificationDurationScaleModifier;
            const turnImageDisplayDuration = 5000 * this.notificationDurationScaleModifier;

            let text = new Phaser.Text(this.game, 0, 0, "", { font: "30px Oswald-DemiBold", fontWeight: "600", fill: "#EB3359", align: "center" });
            text.stroke = "#673952";
            text.strokeThickness = 5;
            text.anchor.set(0.5);
            this.add(text);

            const turnImage = new Phaser.Image(this.game, GameVars.gameWidth + 100, 240, "texture_atlas_1", isPlayerTurn ? "your_turn.png" : "rivals_turn.png");
            turnImage.anchor.set(0.5);
            this.add(turnImage);

            // fly in
            this.game.add.tween(turnImage)
                .to({ x: 50 }, turnImageSwipeDuration, Phaser.Easing.Exponential.Out, true, this.layerFadeDuration)
                .onComplete.add(function (): void {

                    // slide to the left
                    this.game.add.tween(turnImage)
                        .to({ x: turnImage.x - 100 }, turnImageDisplayDuration, Phaser.Easing.Linear.None, true)
                        .onComplete.add(function (): void {

                            // fly out
                            this.game.add.tween(turnImage).to({ x: -GameVars.gameWidth - 100 },
                                turnImageSwipeDuration, Phaser.Easing.Exponential.In, true);

                        }, this);
                }, this);

            if (type === GameConstants.NOTIFICATION_CUE_BALL_POTTED) {
                text.text = "CUE BALL POCKETED";
            } else if (type === GameConstants.NOTIFICATION_NO_BALL_TOUCHED) {
                text.text = "NO BALL TOUCHED";
            } else if (type === GameConstants.NOTIFICATION_TIMEOUT) {
                text.text = "OUT OF TIME";
            } else if (type === GameConstants.NOTIFICATION_WRONG_BALL_POTTED) {
                text.text = "WRONG BALL POCKETED";
            } else if (type === GameConstants.NOTIFICATION_WRONG_BALL_TOUCHED) {
                text.text = "WRONG BALL TOUCHED FIRST";
            } else if (type === GameConstants.NOTIFICATION_NONE) {
                text.visible = false;
            }

            if (opponentChoosingPocket) {

                if (text.visible) {
                    text.text += "\n";
                } else {
                    text.visible = true;
                }

                text.text += "OPPONENT CHOOSING POCKET";
            }

            const iconFoul = new Phaser.Image(this.game, 0, text.y, "texture_atlas_1", "icon_foul.png");
            iconFoul.anchor.set(1, 0.5);
            const iconHalfWidth = iconFoul.width * 0.5;
            text.x += iconHalfWidth * 1.2;
            iconFoul.x = text.x - (text.width * 0.5);
            iconFoul.visible = text.visible;
            this.add(iconFoul);
        }

    }
}
