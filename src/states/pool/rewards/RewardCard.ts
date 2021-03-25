namespace MiniBillar {

    export class RewardCard extends Phaser.Group {

        public cardId: string;
        public points: number;
        public cardMaxPoints: number;
        public cardType: string;
        public unlocked: boolean;
        public progressLabel: Phaser.Text;

        private cardMaxPointsLabel: string;
        private pointsToIncrement: number;
        private incrementPointsDt: number;
        private incrementPointsCounter: number;
        private progressBar: Phaser.Image;
        private progressMaskRectangle: Phaser.Graphics;
        private boxContainerImage: Phaser.Image;
        private equipButton: Phaser.Button;
        private equippedImage: Phaser.Image;
        private parentRail: Rail;

        constructor(game: Phaser.Game, x: number, y: number, cardId: string, currentPoints: number = -1, insideScaledObject: boolean = true, clickable: boolean = false) {

            super(game, null, "reward-card");

            if (!insideScaledObject) { this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult); }

            this.x = x;
            this.y = y;

            this.cardId = cardId;
            this.cardType = RewardsManager.getCardType(this.cardId);
            this.parentRail = null;
            this.pointsToIncrement = 0;
            this.incrementPointsDt = 0;
            this.incrementPointsCounter = 0;

            if (currentPoints < 0) { this.points = RewardsManager.getCardPoints(this.cardId); } else {
                this.points = currentPoints;
            }

            const cardImageNameWithExtension = this.cardId + ".png";

            this.cardMaxPoints = RewardsManager.getMaxForCardType(this.cardType);
            this.cardMaxPointsLabel = "/" + this.cardMaxPoints;

            this.boxContainerImage = new Phaser.Image(this.game, 0, 0, "texture_atlas_5", cardImageNameWithExtension);
            this.boxContainerImage.anchor.set(0.5);
            if (clickable) { this.boxContainerImage.inputEnabled = true; }

            this.add(this.boxContainerImage);

            const progressBarBG = new Phaser.Graphics(this.game, 0, 0);
            progressBarBG.beginFill(0x006f4c);
            this.add(progressBarBG);

            this.progressBar = new Phaser.Image(this.game, 0, 120, "texture_atlas_1", "progress_bar.png");
            this.progressBar.scale.x *= 1.03;
            this.progressBar.scale.y *= 1.1;
            this.progressBar.anchor.set(0.5);
            this.add(this.progressBar);

            progressBarBG.drawRect(0, - this.progressBar.height / 2, this.progressBar.width, this.progressBar.height);
            progressBarBG.x = this.progressBar.x - this.progressBar.width / 2;
            progressBarBG.y = this.progressBar.y;

            this.progressMaskRectangle = new Phaser.Graphics(this.game, this.progressBar.x - this.progressBar.width / 2, this.progressBar.y);
            this.progressMaskRectangle.beginFill(0xffffff);
            this.progressMaskRectangle.drawRect(0, - this.progressBar.height / 2, this.progressBar.width, this.progressBar.height);
            this.progressMaskRectangle.endFill();
            this.progressMaskRectangle.renderable = false;

            const maskScale = Phaser.Math.clamp(currentPoints / this.cardMaxPoints, 0.01, 1);
            this.progressMaskRectangle.scale.x = maskScale;
            this.add(this.progressMaskRectangle);
            this.progressBar.mask = this.progressMaskRectangle;

            let progressText = currentPoints.toString() + this.cardMaxPointsLabel;
            this.progressLabel = new Phaser.Text(this.game, this.progressBar.x, this.progressBar.y + 3, progressText, { font: "20px Oswald-DemiBold", fontWeight: "400", fill: "#E5FFFF", align: "center" });
            this.progressLabel.anchor.set(.5);
            this.add(this.progressLabel);

            this.boxContainerImage.bringToTop();

            this.equipButton = new Phaser.Button(this.game, this.progressBar.x, this.progressBar.y + 1, "texture_atlas_1");
            this.equipButton.anchor.set(.5);
            if (this.game.device.touch) {
                this.equipButton.onInputDown.add(function () { this.equipButton.scale.set(this.equipButton.scale.x * 1.05, this.equipButton.scale.y * 1.05); }, this, 5);
            }
            this.equipButton.onInputOver.add(function () { this.equipButton.scale.set(this.equipButton.scale.x * 1.05, this.equipButton.scale.y * 1.05); }, this, 5);
            this.equipButton.onInputOut.add(function () { this.equipButton.scale.set(1, 1); }, this, 5);
            this.equipButton.events.onInputUp.add(this.onClickEquip, this, 5);
            this.equipButton.setFrames("btn_equip_pressed.png", "btn_equip.png", "btn_equip_pressed.png", "btn_equip.png");
            this.add(this.equipButton);

            this.equippedImage = new Phaser.Image(this.game, this.progressBar.x, this.progressBar.y + 1, "texture_atlas_1", "equipped.png");
            this.equippedImage.anchor.set(.5);
            this.add(this.equippedImage);

            this.equipButton.bringToTop();

            if (currentPoints === this.cardMaxPoints) {

                this.unlocked = true;

                if (GameVars.gameData.playerData.equipedCue === this.cardId || GameVars.gameData.equippedTable === this.cardId) {
                    this.equippedImage.visible = true;
                    this.equipButton.visible = false;
                }
                else {

                    this.equippedImage.visible = false;
                    this.progressLabel.visible = false;
                }

            } else {
                this.unlocked = false;
                this.equippedImage.visible = false;
                this.equipButton.visible = false;
            }
        }

        public update(): void {

            if (this.pointsToIncrement > 0) {
                if (this.incrementPointsCounter < 0) {

                    this.incrementPointsCounter = this.incrementPointsDt;

                    this.pointsToIncrement--;

                    if (this.points >= this.cardMaxPoints) {

                        this.pointsToIncrement = 0;
                        this.points = this.cardMaxPoints;
                        this.progressLabel.text = "UNLOCKED!";
                    }
                    else {

                        this.progressLabel.text = (this.points - this.pointsToIncrement).toString() + this.cardMaxPointsLabel;
                    }

                } else {
                    this.incrementPointsCounter -= this.game.time.physicsElapsedMS;
                }
            }
        }

        public onClickEquip(): void {

            this.equipButton.scale.set(1, 1);

            this.equipButton.visible = false;
            this.equippedImage.visible = true;

            if (!this.parentRail) {
                return;
            }

            let oldSelected: string;

            if (this.cardType === "cue") { oldSelected = GameVars.gameData.playerData.equipedCue; } else {
                oldSelected = GameVars.gameData.equippedTable;
            }

            if (this.cardId === oldSelected || !this.unlocked) {
                return;
            } else {

                let unequipSuccessful = false;

                for (let card of this.parentRail.cardArray) {

                    if (card.cardId === oldSelected) {

                        unequipSuccessful = true;
                        card.unequip();
                        break;
                    }
                }

                if (unequipSuccessful) {

                    GameManager.onItemEquiChange(this.cardType, this.cardId);
                }
            }

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }

        public unequip(): void {

            this.equipButton.visible = true;
            this.equippedImage.visible = false;
            this.progressLabel.visible = false;
        }

        public animateToNewestCardPoint(incrementValue: number): void {

            let oldProgValue = Phaser.Math.clamp((this.points - incrementValue) / this.cardMaxPoints, .01, 1);
            this.progressMaskRectangle.scale.x = oldProgValue;

            let currentProgValue = Phaser.Math.clamp(this.points / this.cardMaxPoints, .01, 1);
            this.progressLabel.text = (Math.max(0, this.points - incrementValue)).toString() + this.cardMaxPointsLabel;

            const tweenDelay = 1000;
            const tweenDuration = 1500;

            this.game.add.tween(this.progressMaskRectangle.scale)
                .to({ x: currentProgValue }, tweenDuration, Phaser.Easing.Cubic.Out, true, tweenDelay)
                .onStart.add(function (): void {

                    this.pointsToIncrement = incrementValue;
                    this.incrementPointsDt = tweenDuration / incrementValue * 0.8;
                    this.incrementPointsCounter = this.incrementPointsDt;

                }, this);
        }

        public setParentRail(parentRail: Rail): any {

            this.parentRail = parentRail;
        }
    }
}
