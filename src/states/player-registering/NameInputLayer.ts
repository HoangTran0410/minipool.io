namespace MiniBillar {

    export class NameInputLayer extends Phaser.Group {

        public static currentInstance: NameInputLayer;

        private lastValidPlayerName: string;

        constructor(game: Phaser.Game, lastValidPlayerName: string) {

            super(game, null, "name-input-layer-container");

            NameInputLayer.currentInstance = this;

            this.lastValidPlayerName = lastValidPlayerName;

            let transparentBackground = new Phaser.Sprite(this.game, 0, 0, this.game.cache.getBitmapData(GameConstants.BLUE_SQUARE));
            transparentBackground.scale.set(GameVars.gameWidth / 64, GameVars.gameHeight / 64);
            transparentBackground.alpha = .8;
            transparentBackground.inputEnabled = true;
            transparentBackground.events.onInputUp.add(this.onDownTransparentLayer, this);
            this.add(transparentBackground);

            document.getElementById("ti").style.display = "block";
            const tiElement = <HTMLInputElement>document.getElementById("ti");
            this.game.time.events.add(0.15 * Phaser.Timer.SECOND, function (): void {
                tiElement.focus();
            }, this);
        }

        public onExitInputFieldMobile(): void {

            const tiElement = <HTMLInputElement>document.getElementById("ti");
            const newNick = tiElement.value;

            if (newNick.length > 0 && newNick.length < 25) {

                GameVars.gameData.playerData.nick = newNick;
                GameManager.writeGameData();
            }

            PlayerRegisteringState.currentInstance.updateDisplayedName();
            PlayerRegisteringState.currentInstance.hideNameInputLayer();
        }

        public onEnterInputFieldMobile(): string {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            this.lastValidPlayerName = GameVars.gameData.playerData.nick;

            return this.lastValidPlayerName;
        }

        private onDownTransparentLayer(): void {

            const tiElement = <HTMLInputElement>document.getElementById("ti");
            this.game.time.events.add(0.15 * Phaser.Timer.SECOND, function (): void {
                tiElement.blur();
            }, this);

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            PlayerRegisteringState.currentInstance.updateDisplayedName();
            PlayerRegisteringState.currentInstance.hideNameInputLayer();
        }
    }
}