namespace MiniBillar {
    export class RewardCardContainer extends Phaser.Group {

        private rewardCards: RewardCard[];

        constructor(game: Phaser.Game) {

            super(game, null, "cards-displayer");

            this.scale.set(GameVars.scaleXMult, GameVars.scaleYMult);
        }

        public createAndDisplayCards(cardIds: string[]): void {

            this.rewardCards = [];

            for (let i = 0; i < cardIds.length; i++) {

                let rc: RewardCard = new RewardCard(this.game, 0, 0, cardIds[i]);
                this.rewardCards.push(rc);
                this.add(this.rewardCards[i]);

                rc.scale.x = 0.00001;
                rc.alpha = 0;


                this.game.add.tween(rc.scale)
                    .to({ x: 1 }, 600, Phaser.Easing.Bounce.Out, true, i * 250)
                    .onStart.add(function (): void {
                        AudioManager.playEffect(AudioManager.GIFT_CARD_SWISH);
                    }, this);

                this.game.add.tween(rc)
                    .to({ alpha: 1 }, 600, Phaser.Easing.Cubic.Out, true, i * 250);
            }

            let cardXPos = - 256;
            const intervalX = 256;

            if (this.rewardCards.length === 2) {
                cardXPos = -128;
            } else if (this.rewardCards.length === 1) {
                cardXPos = 0;
            }

            for (let i = 0; i < this.rewardCards.length; i++) {

                this.rewardCards[i].x = cardXPos;
                cardXPos += intervalX;
            }
        }

        public animateCardPointsIncrementation(incrementValues: number[]): void {

            for (let i = 0; i < this.rewardCards.length; i++) {
                const card = this.rewardCards[i];
                card.animateToNewestCardPoint(incrementValues[i]);
            }
        }
    }
}
