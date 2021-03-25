namespace MiniBillar {

    export class AvatarFullBodyContainer extends Phaser.Group {

        private fullBodyAvatar: Phaser.Image;
        private nameInput: PhaserInput.InputField;
        private lastValidPlayerName: string;
        private fakeNameInput: Phaser.Text;

        constructor(game: Phaser.Game) {

            super(game, null, "avatar-full-body-container");

            this.x = Math.min(GameVars.gameWidth / 4, (GameVars.gameWidth / 2 - 380 * GameVars.scaleXMult));
            this.y = 600;

            this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            this.fullBodyAvatar = new Phaser.Image(this.game, 0, 0, "texture_atlas_5", GameVars.gameData.playerData.avatar + ".png");
            this.fullBodyAvatar.anchor.set(.5, 1);
            this.add(this.fullBodyAvatar);

            this.lastValidPlayerName = GameVars.gameData.playerData.nick;

            const nameEditButton = new Phaser.Button(this.game, 0, 0, "texture_atlas_1");
            nameEditButton.setFrames("btn_edit_avatar_on.png", "btn_edit_avatar_off.png", "btn_edit_avatar_on.png", "btn_edit_avatar_off.png");
            nameEditButton.anchor.set(.5);
            if (this.game.device.touch) { nameEditButton.onInputDown.add(function () { nameEditButton.scale.set(nameEditButton.scale.x * 1.1, nameEditButton.scale.y * 1.1); }, this); }
            nameEditButton.onInputOver.add(function () { nameEditButton.scale.set(nameEditButton.scale.x * 1.1, nameEditButton.scale.y * 1.1); }, this);
            nameEditButton.onInputOut.add(function () { nameEditButton.scale.set(1); }, this);
            this.add(nameEditButton);

            const nameInputLine = new Phaser.Graphics(this.game, 0, 0);
            nameInputLine.lineStyle(4, 0xE5FFFF, 1);
            this.add(nameInputLine);

            let nameInputLinePos: Phaser.Point;

            if (this.game.device.touch) {

                this.fakeNameInput = new Phaser.Text(this.game, -105, -this.fullBodyAvatar.height - 45, this.lastValidPlayerName,
                    { font: "30px Oswald-Medium", fill: "#E5FFFF" });
                this.fakeNameInput.inputEnabled = true;
                this.fakeNameInput.events.onInputUp.add(function () {

                    PlayerRegisteringState.currentInstance.showNameInputLayer();

                }, this);
                this.fakeNameInput.setText(Utils.truncateName(this.lastValidPlayerName, 12));

                this.add(this.fakeNameInput);

                nameInputLinePos = this.fakeNameInput.position;

                nameEditButton.events.onInputUp.add(function (): void {

                    PlayerRegisteringState.currentInstance.showNameInputLayer();
                    nameEditButton.scale.set(1);

                }, this);

            } else {

                this.nameInput = new PhaserInput.InputField(this.game, -105, -this.fullBodyAvatar.height - 45,
                    {
                        font: "30px Oswald-Medium", fill: "#E5FFFF", cursorColor: "#E5FFFF",
                        fillAlpha: 0,
                        width: 180,
                        max: "20",
                    });
                this.nameInput.setText(GameVars.gameData.playerData.nick);
                this.nameInput.focusIn.add(this.onEnterInputField, this);
                this.nameInput.focusOut.add(this.onExitInputField, this);
                this.add(this.nameInput);

                nameInputLinePos = this.nameInput.position;

                nameEditButton.events.onInputUp.add(function (): void {

                    this.nameInput.startFocus();
                    nameEditButton.scale.set(1);

                }, this);
            }

            nameInputLine.moveTo(nameInputLinePos.x - 15, nameInputLinePos.y + 40 );
            nameInputLine.lineTo(nameInputLinePos.x + 180, nameInputLinePos.y + 40 );
            nameEditButton.position.set(nameInputLinePos.x + 200 , nameInputLinePos.y + 25 );
        }

        public avatarSelected(): void {

            this.fullBodyAvatar.frameName = GameVars.gameData.playerData.avatar + ".png";
        }

        public updateDisplayedName(): void {

            this.fakeNameInput.text = Utils.truncateName(GameVars.gameData.playerData.nick, 12);
        }

        private onEnterInputField(inputField: PhaserInput.InputField): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            this.lastValidPlayerName = GameVars.gameData.playerData.nick;
        }

        private onExitInputField(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            if (this.nameInput.value.length > 0) {

                GameVars.gameData.playerData.nick = this.nameInput.value;
                GameManager.writeGameData();

            } else { this.nameInput.setText(this.lastValidPlayerName); }
        }
    }
}
