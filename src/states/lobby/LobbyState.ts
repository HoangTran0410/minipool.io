module MiniBillar {

    export class LobbyState extends Phaser.State {

        public static currentInstance: LobbyState;

        private playerAvatar: AvatarBubble;
        private adversaryAvatar: AvatarBubble;
        private playerNick: Phaser.Text;
        private adversaryNick: Phaser.Text;
        private roomIdLabel: Phaser.Text;
        private lookingForPlayerContainer: Phaser.Group;
        private waitingAnim: Phaser.Image;
        private waitingAnimContainer: Phaser.Group;
        private titleLabel: Phaser.Text;
        private buttonBack: Phaser.Button;
        private leavingScene: boolean;
        private f: number;

        public init(): void {

            LobbyState.currentInstance = this;

            this.f = 0;
            this.leavingScene = false;
        }

        public create(): void {

            const background = this.add.image(GameVars.gameWidth / 2, GameVars.gameHeight / 2, "texture_atlas_2", "lobby.png");
            background.anchor.set(.5);
            background.scale.set(GameVars.scaleXMult, GameVars.gameHeight / background.height);

            this.lookingForPlayerContainer = this.game.add.group();

            this.buttonBack = new Phaser.Button(this.game, 38 * GameVars.scaleXMult, 38 * GameVars.scaleYMult, "texture_atlas_1", this.onClickExitLobby, this);
            this.buttonBack.anchor.set(.5);
            if (this.game.device.touch) {
                this.buttonBack.onInputDown.add(function () { this.buttonBack.scale.set(this.buttonBack.scale.x * 1.1, this.buttonBack.scale.y * 1.1); }, this);
            }
            this.buttonBack.onInputOver.add(function () { this.buttonBack.scale.set(this.buttonBack.scale.x * 1.1, this.buttonBack.scale.y * 1.1); }, this);
            this.buttonBack.onInputOut.add(function () { this.buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            this.buttonBack.setFrames("btn_back_on.png", "btn_back_off.png", "btn_back_on.png");
            this.buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.lookingForPlayerContainer.add(this.buttonBack);

            this.titleLabel = new Phaser.Text(this.game, GameVars.gameWidth / 2, 420, "WAITING FOR A RIVAL", { font: "30px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center" });
            this.titleLabel.anchor.x = .5;
            this.titleLabel.stroke = "#2f3237";
            this.titleLabel.strokeThickness = 5;
            this.titleLabel.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.lookingForPlayerContainer.add(this.titleLabel);

            this.waitingAnimContainer = this.game.add.group();
            this.waitingAnimContainer.position.set(GameVars.gameWidth / 2, 360);
            this.waitingAnimContainer.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.lookingForPlayerContainer.add(this.waitingAnimContainer);

            this.waitingAnim = new Phaser.Image(this.game, 0, 0, "texture_atlas_1", "loading_circle.png");
            this.waitingAnim.anchor.set(.5);
            this.waitingAnimContainer.add(this.waitingAnim);

            this.playerAvatar = new AvatarBubble(this.game, GameVars.gameData.playerData.avatar, GameVars.gameWidth / 2 - 150, 250, false);
            this.playerAvatar.visible = false;
            this.playerAvatar.scale.x *= 2 * GameVars.scaleXMult;
            this.playerAvatar.scale.y *= 2 * GameVars.scaleYMult;
            this.add.existing(this.playerAvatar);
            this.lookingForPlayerContainer.add(this.playerAvatar);

            this.adversaryAvatar = new AvatarBubble(this.game, GameVars.gameData.playerData.avatar, GameVars.gameWidth / 2 + 150, 250, false);
            this.adversaryAvatar.visible = false;
            this.adversaryAvatar.scale.x *= 2 * GameVars.scaleXMult;
            this.adversaryAvatar.scale.y *= 2 * GameVars.scaleYMult;
            this.add.existing(this.adversaryAvatar);
            this.lookingForPlayerContainer.add(this.adversaryAvatar);

            this.playerNick = new Phaser.Text(this.game, GameVars.gameWidth / 2 - 150, 340, "", { font: "26px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center" });
            this.playerNick.anchor.x = .5;
            this.playerNick.visible = false;
            this.playerNick.stroke = "#2f3237";
            this.playerNick.strokeThickness = 5;
            this.playerNick.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.lookingForPlayerContainer.add(this.playerNick);

            this.adversaryNick = new Phaser.Text(this.game, GameVars.gameWidth / 2 + 150, 340, "", { font: "26px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center" });
            this.adversaryNick.anchor.x = .5;
            this.adversaryNick.visible = false;
            this.adversaryNick.stroke = "#2f3237";
            this.adversaryNick.strokeThickness = 5;
            this.adversaryNick.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.lookingForPlayerContainer.add(this.adversaryNick);

            if (GameConstants.LOG_SERVER_INFO) {

                this.roomIdLabel = new Phaser.Text(this.game, GameVars.gameWidth / 2, 120, "", { font: "20px Oswald-DemiBold", fontWeight: "600", fill: "#e7f6f8", align: "center" });
                this.roomIdLabel.anchor.x = .5;
                this.roomIdLabel.stroke = "#2f3237";
                this.roomIdLabel.strokeThickness = 5;
                this.roomIdLabel.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
                this.lookingForPlayerContainer.add(this.roomIdLabel);
            }
        }

        public update(): void {

            super.update();

            if (this.waitingAnim) { 
                this.waitingAnim.angle += 5; 
            }

            // para forzar jugar contra el bot si no hay conexion
            this.f ++;

            if (this.f === 120 && !this.playerAvatar.visible) {
                GameManager.setupBotMatchData();
                this.fakePlayerFound();
            }
        }

        public shutdown(): void {

            LobbyState.currentInstance = null;

            super.shutdown();
        }

        public onPlayerJoined(): void {

            if (this.roomIdLabel) { this.roomIdLabel.text = "ROOM ID: " + Communication.CommunicationManager.room.id; }

            this.playerAvatar.visible = true;
            this.playerAvatar.setFrameName(GameVars.gameData.playerData.avatar + ".png");

            this.playerNick.text = GameVars.gameData.playerData.nick;
            this.playerNick.visible = true;

            if (GameVars.adversaryData) {

                this.adversaryAvatar.visible = true;
                const avatarFileName = GameVars.adversaryData.avatar + ".png";
                this.adversaryAvatar.setFrameName(avatarFileName);

                this.adversaryNick.text = GameVars.adversaryData.nick;
                this.adversaryNick.visible = true;
            }

            if (this.playerAvatar.visible && this.adversaryAvatar.visible) {

                this.adversaryFound();
            }
        }

        public setPlayers(): void {

            const darkLayer = this.add.sprite(0, 0, this.game.cache.getBitmapData(GameConstants.BLACK_SQUARE));
            darkLayer.scale.set(GameVars.gameWidth / GameConstants.BITMAP_SIZE, GameVars.gameHeight / GameConstants.BITMAP_SIZE);
            darkLayer.alpha = .7;

            const matchedLabel = this.add.text(GameVars.gameWidth / 2, 400, "MATCHED, GAME STARTS!", { font: "50px Oswald-DemiBold", fill: "#E5FFFF"});
            matchedLabel.anchor.set(.5);
        }

        public fakePlayerFound(): void {

            if (this.leavingScene) {
                return;
            }

            this.leavingScene = true;

            this.adversaryAvatar.visible = true;
            const avatarFileName = GameVars.adversaryData.avatar + ".png";
            this.adversaryAvatar.setFrameName(avatarFileName);

            this.adversaryNick.text = GameVars.adversaryData.nick;
            this.adversaryNick.visible = true;

            // si no hay conexion se fuerza el jugar contra un bot
            if (!this.playerAvatar.visible) {
                this.playerAvatar.visible = true;
                this.playerAvatar.setFrameName(GameVars.gameData.playerData.avatar + ".png");
                this.playerNick.text = GameVars.gameData.playerData.nick;
                this.playerNick.visible = true;
            }

            if (this.playerAvatar.visible && this.adversaryAvatar.visible) {

                this.adversaryFound();
            }

            this.game.time.events.add(Phaser.Timer.SECOND, function (): void {

                GameManager.enterPVBotGame();

            }, GameManager);
        }

        private onClickExitLobby(b: Phaser.Button): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
            GameManager.exitLobby();
        }

        private adversaryFound(): void {

            this.buttonBack.visible = false;
            this.waitingAnim.visible = false;
            this.titleLabel.visible = false;

            const vs = new Phaser.Image(this.game, GameVars.gameWidth / 2, 250, "texture_atlas_1", "vs.png");
            vs.anchor.set(.5);
            vs.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            this.lookingForPlayerContainer.add(vs);

            this.game.add.tween(vs.scale)
                .from({ x: .01, y: .01 }, 400, Phaser.Easing.Elastic.Out, true);
        }
    }
}
