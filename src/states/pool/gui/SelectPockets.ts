namespace MiniBillar {

    export class SelectPockets extends Phaser.Group {

        public selectedPocketId: number;
        public canSelect: boolean;

        private pockets: Phaser.Image[];
        private tweens: Phaser.Tween[];

        constructor(game: Phaser.Game) {

            super(game, null, "select-pocket");

            this.canSelect = false;
            this.selectedPocketId = -1;

            this.pockets = [];

            for (let i = 0; i < 6; i++) {
                const x = GameVars.pocketArray[i].position.x * GameConstants.PHYS_SCALE;
                const y = GameVars.pocketArray[i].position.y * GameConstants.PHYS_SCALE;

                let pocket = new Phaser.Image(this.game, x, y, "texture_atlas_1", "pocket_mark.png");
                pocket.anchor.set(0.5);
                pocket.name = GameVars.pocketArray[i].id.toString();

                pocket.inputEnabled = true;
                pocket.events.onInputUp.add(this.onPocketDown, this);
                this.add(pocket);

                this.pockets.push(pocket);
            }

            this.visible = false;
        }

        public showSelectPockets(): void {

            if (this.visible && this.alpha !== .8) {
                return;
            }

            this.alpha = 1;

            this.hideSelectPockets();

            GameVars.pocketIdWhereBlackFell = -1;

            StageContainer.currentInstance.hideCue("Showing select pockets");
            StageContainer.currentInstance.hideGuide("Showing select pockets");

            this.visible = true;
            this.canSelect = true;

            this.tweens = [];

            for (let i = 0; i < 6; i++) {

                const tween = this.game.add.tween(this.pockets[i])
                    .to({ alpha: [0, 1] }, 2000, Phaser.Easing.Linear.None, true, 0, -1);
                this.tweens.push(tween);
            }
        }

        public hideSelectPockets(): void {

            if (!this.visible) { 
                return; 
            }

            this.visible = false;

            for (let i = 0; i < 6; i++) {
                this.game.tweens.remove(this.tweens[i]);
                this.pockets[i].alpha = 1;
            }
        }

        public setRivalPocket(pocketId: number): void {
            
            this.setSelectedPocket(pocketId, false);
        }

        public resetSelectedPocket(): void {

            this.selectedPocketId = -1;
        }

        private setSelectedPocket(pocketId: number, showCueAndGuide: boolean = true) {

            if (!this.canSelect) {
                return;
            }

            this.canSelect = false;

            if (showCueAndGuide) {
                StageContainer.currentInstance.showCue("Select pockets set");
                StageContainer.currentInstance.showGuide("Select pockets set");
            }

            for (let i = 0; i < 6; i++) {
                this.game.tweens.remove(this.tweens[i]);

                if (parseInt(this.pockets[i].name) === pocketId) {
                    this.pockets[i].alpha = .6;
                } else {
                    this.pockets[i].alpha = 0;
                }
            }

            this.selectedPocketId = pocketId;
            MatchManager.pocketSelected(pocketId);
        }

        private onPocketDown(img: Phaser.Image): void {
           
            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            const pocketId = parseInt(img.name);
            this.setSelectedPocket(pocketId);
        }
    }
}
