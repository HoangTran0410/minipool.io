namespace MiniBillar {

    export class PlayerAvatarContainer extends Phaser.Group {

        constructor(game: Phaser.Game) {

            super(game, null, "player-avatar-container");

            this.scale.x = GameVars.scaleXMult;

            const background = new Phaser.Image(this.game, -48, -53, "texture_atlas_1", "avatar_container_background.png");
            this.add(background);

            const avatar = new Phaser.Image(this.game, 0, 0, "texture_atlas_5", GameVars.gameData.playerData.avatar + ".png");
            avatar.inputEnabled = true;
            avatar.events.onInputUp.add(this.onClickAvatarEdit, this);
            avatar.anchor.set(.5, .325);
            avatar.scale.set(.45);
            this.add(avatar);

            const mask = new Phaser.Graphics(this.game);
            mask.beginFill(0xffffff);
            mask.drawCircle(0, 0, 83);
            this.add(mask);

            avatar.mask = mask;

            let shownNick = GameVars.gameData.playerData.nick;
            shownNick = Utils.truncateName(shownNick);

            const nickLabel = new Phaser.Text(this.game, 55, -22, shownNick, { font: "22px Oswald-DemiBold", fill: "#E5FFFF" });
            this.add(nickLabel);

            const currentCue = new Phaser.Image(this.game, 210, 32, "texture_atlas_5", GameVars.gameData.playerData.equipedCue + "_sprite_0.png");
            currentCue.anchor.y = .5;
            currentCue.angle = 180;
            currentCue.scale.set(.46);
            this.add(currentCue);

            const nameEditButton = new Phaser.Button(this.game, 201, -10.5, "texture_atlas_1");
            nameEditButton.setFrames("btn_edit_avatar_on.png", "btn_edit_avatar_off.png", "btn_edit_avatar_on.png", "btn_edit_avatar_off.png");
            nameEditButton.anchor.set(.5);
            if (this.game.device.touch) {
                nameEditButton.onInputDown.add(function () { nameEditButton.scale.set(nameEditButton.scale.x * 1.1, nameEditButton.scale.y * 1.1); }, this);
            }
            nameEditButton.onInputOver.add(function () { nameEditButton.scale.set(nameEditButton.scale.x * 1.1, nameEditButton.scale.y * 1.1); }, this);
            nameEditButton.onInputOut.add(function () { nameEditButton.scale.set(1); }, this);
            nameEditButton.events.onInputUp.add(function (): void {

                AudioManager.playEffect(AudioManager.BTN_NORMAL);

                nameEditButton.scale.set(1);
                GameManager.enterPortraitSelectionScreen();

            }, this);

            this.add(nameEditButton);
        }

        private onClickAvatarEdit(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameManager.enterPortraitSelectionScreen();
        }
    }
}
