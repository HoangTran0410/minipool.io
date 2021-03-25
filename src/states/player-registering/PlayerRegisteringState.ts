module MiniBillar {

    export class PlayerRegisteringState extends Phaser.State {

        public static currentInstance: PlayerRegisteringState;

        private static STEP_DISTANCE = 190;
        private static AVATARS_CONTAINER_PY_2 = 0;

        public currentlySelectedAvatar: Avatar;

        private avatarFullBodyContainer: AvatarFullBodyContainer;
        private avatarsContainer: Phaser.Group;
        private tweening: boolean;

        private nameInputLayer: NameInputLayer;

        private swiping: boolean;
        private swipeStartPosY: number;
        private originalPreviewYPos: number;
        private lastPreviewYProgress: number;

        public init(): void {

            PlayerRegisteringState.currentInstance = this;

            this.tweening = false;
        }

        public create(): void {

            const background = this.add.image(GameVars.gameWidth / 2, GameVars.gameHeight / 2, "texture_atlas_2", "lobby.png");
            background.anchor.set(.5);
            background.scale.set(GameVars.scaleXMult, GameVars.gameHeight / background.height);

            this.avatarsContainer = this.add.group();
            this.avatarsContainer.x = GameVars.gameWidth / 2 - 160 * GameVars.scaleXMult;
            this.avatarsContainer.y = 190;

            let startScrolledDown = false;
            let selectedAvatar: Avatar;

            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 4; j++) {

                    let avatarName: string;

                    let index = (i + 1) + 4 * j;

                    if (index % 2 === 0) { avatarName = "billar_w0" + Math.round(index / 2); }
                    else { avatarName = "billar_m0" + Math.round(index / 2); }

                    let avatar = new Avatar(this.game, avatarName);
                    avatar.x = 170 * i * GameVars.scaleXMult;
                    avatar.y = 170 * j;
                    if (GameVars.gameData.playerData.avatar === avatarName) {
                        if (j > 2) { startScrolledDown = true; }
                        selectedAvatar = avatar;
                    }
                    this.avatarsContainer.add(avatar);
                }
            }

            const titleMask = this.add.image(GameVars.gameWidth / 2, 0, "texture_atlas_1", "title_mask.png");
            titleMask.anchor.set(.5, 0);
            titleMask.scale.set(GameVars.scaleXMult, GameVars.gameHeight / background.height);

            const avatarSettingTitle = this.add.image(GameVars.gameWidth / 2, 0, "texture_atlas_1", "avatar_settings_title.png");
            avatarSettingTitle.anchor.set(.5, 0);
            avatarSettingTitle.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);

            const buttonBack = new Phaser.Button(this.game, 38 * GameVars.scaleXMult, 38 * GameVars.scaleYMult, "texture_atlas_1", this.onClickBack, this);
            buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
            buttonBack.anchor.set(.5);
            if (this.game.device.touch) {
                buttonBack.onInputDown.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            }
            buttonBack.onInputOver.add(function () { buttonBack.scale.set(buttonBack.scale.x * 1.1, buttonBack.scale.y * 1.1); }, this);
            buttonBack.onInputOut.add(function () { buttonBack.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }, this);
            buttonBack.setFrames("btn_back_on.png", "btn_back_off.png", "btn_back_on.png");
            buttonBack.forceOut = true;
            this.add.existing(buttonBack);

            if (startScrolledDown) {
                this.avatarsContainer.y = PlayerRegisteringState.AVATARS_CONTAINER_PY_2;
            }

            this.avatarFullBodyContainer = new AvatarFullBodyContainer(this.game);
            this.add.existing(this.avatarFullBodyContainer);

            selectedAvatar.select();

            // swipe
            this.originalPreviewYPos = this.avatarsContainer.y;
            this.game.input.onDown.add(this.startSwipe, this);
            this.game.input.onUp.add(this.endSwipe, this);
            this.originalPreviewYPos = null;
            this.lastPreviewYProgress = 0;
            this.clearSwipe();

            this.game.camera.flash(0x000000, 350, false);
        }

        public update(): void {

            if (this.swiping) {

                const currentPointerPos = this.game.input.activePointer.position;
                let yDelta = this.swipeStartPosY - currentPointerPos.y;

                let swipeProgress = yDelta / GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
                swipeProgress = Phaser.Math.clamp(swipeProgress, -.999, .999);

                this.scrollPreview(swipeProgress);
            }

            super.update();
        }

        public shutdown(): void {

            PlayerRegisteringState.currentInstance = null;

            super.shutdown();
        }

        public avatarSelected(): void {

            this.avatarFullBodyContainer.avatarSelected();
        }

        public updateDisplayedName(): void {

            this.avatarFullBodyContainer.updateDisplayedName();
        }

        public showNameInputLayer(): void {

            this.nameInputLayer = new NameInputLayer(this.game, GameVars.gameData.playerData.nick);
            this.add.existing(this.nameInputLayer);
        }

        public hideNameInputLayer(): void {

            if (this.nameInputLayer) {
                this.nameInputLayer.destroy();
                this.nameInputLayer = null;
            }
        }

        private onClickBack(): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            GameManager.fullscreenFilter(GameManager.enterSplash);
        }

        private startSwipe(): void {

            this.clearSwipe();

            if (this.game.input.activePointer.position.x > 120) {

                if (this.tweening) { return; }

                this.swipeStartPosY = this.game.input.activePointer.position.y;
                this.swiping = true;
            }
        }

        private endSwipe(): void {

            if (!this.swiping) { return; }

            const currentPointerPos = this.game.input.activePointer.position;

            let yDelta = this.swipeStartPosY - currentPointerPos.y;

            let swipeProgress = yDelta / GameConstants.MIN_SWIPE_CHANGE_DISTANCE;
            swipeProgress = Phaser.Math.clamp(swipeProgress, -1, 1);
            swipeProgress = Math.round(swipeProgress);

            this.scrollStepped(swipeProgress);

            this.clearSwipe();
        }


        private clearSwipe(): void {

            this.swiping = false;
            this.swipeStartPosY = null;
            this.originalPreviewYPos = null;
        }

        private scrollStepped(steps: number): void {

            if (this.tweening) { return; }

            this.tweening = true;

            const diff = steps;
            steps = -Math.round(this.lastPreviewYProgress);

            if (steps > 0) {

                this.game.add.tween(this.avatarsContainer)
                    .to({ y: 190 }, Math.abs(diff) < 0.1 ? 50 : 650, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(function (): void {

                        this.tweening = false;

                    }, this);

            } else if (steps < 0) {

                this.game.add.tween(this.avatarsContainer)
                    .to({ y: 0 }, Math.abs(diff) < 0.1 ? 50 : 650, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(function (): void {

                        this.tweening = false;

                    }, this);

            } else {

                this.game.add.tween(this.avatarsContainer)
                    .to({ y: this.originalPreviewYPos }, Math.abs(diff) < 0.1 ? 50 : 650, Phaser.Easing.Cubic.Out, true)
                    .onComplete.add(function (): void {

                        this.tweening = false;

                    }, this);
            }

            this.lastPreviewYProgress = 0;

            return;
        }

        private scrollPreview(distance: number): void {

            if (this.tweening) { return; }

            if (!this.originalPreviewYPos) {
                this.originalPreviewYPos = this.avatarsContainer.y;
            }

            let py = this.originalPreviewYPos - (PlayerRegisteringState.STEP_DISTANCE * distance);

            this.lastPreviewYProgress = distance;

            this.avatarsContainer.y = py;
        }
    }
}
