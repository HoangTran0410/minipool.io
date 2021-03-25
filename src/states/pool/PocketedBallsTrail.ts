namespace MiniBillar {

    export class PocketedBallsTrail extends Phaser.Group {

        public static RAILS_LENGTH = 448;
        public static SCALE_FACTOR = .9;

        private rails: Phaser.Image;
        private cover: Phaser.Image;
        private railTweens: Phaser.Tween [];

        constructor(game: Phaser.Game) {

            super(game, null, "pocketed-balls-trail");

            this.x = GameVars.gameData.powerBarSide === GameConstants.LEFT ? 485 : -485;
            this.y = -PocketedBallsTrail.RAILS_LENGTH / 2;

            this.railTweens = [];
           
            const railBottomImageName = GameVars.gameData.equippedTable + "_rail_bottom.png";
            this.rails = new Phaser.Image(this.game, 0, 0, "texture_atlas_4", railBottomImageName);
            this.rails.anchor.x = .5;
            this.add(this.rails);

            const railTopImageName = GameVars.gameData.equippedTable + "_rail_top.png";
            this.cover = new Phaser.Image(this.game, 0, 0, "texture_atlas_4", railTopImageName);
            this.cover.anchor.x = .5;
            this.add(this.cover);

            this.rails.scale.x = GameVars.gameData.powerBarSide === GameConstants.LEFT ? 1 : -1;
            this.cover.scale.x = this.rails.scale.x;
        }

        public pauseGame(): void {
            
            for (let i = 0; i < this.railTweens.length; i++) {
                this.railTweens[i].pause();
            }
        }

        public resumeGame(): void {
            
            for (let i = 0; i < this.railTweens.length; i++) {
                this.railTweens[i].resume();
            }
        }

        public addBall(ball: BallObject): void {

            let numBallsWaiting = 0;

            for (let i = 1; i < GameVars.ballArray.length; i++) {
                if (GameVars.ballArray[i].waitingToTheRail) {
                    numBallsWaiting ++;
                }
            }

            ball.mc.shade.frameName = "shade_potted_ball.png";
            ball.waitingToTheRail = true;

            const delay = 1500 + 500 * numBallsWaiting + Math.round(150 * Math.random());

            const numPocketedBalls = this.children.length - 2 + numBallsWaiting;

            this.game.time.events.add(delay, function(): void {

                ball.waitingToTheRail = false;
                ball.mc.pocketTween = true;

                ball.mc.scale.set(PocketedBallsTrail.SCALE_FACTOR);
                ball.mc.position.set(0, 20);
                ball.shadow.destroy();
    
                this.addAt(ball.mc, 1);
    
                const vy = 2.5 + .65 * Math.random(); 

                const dy = PocketedBallsTrail.RAILS_LENGTH - numPocketedBalls * GameConstants.BALL_RADIUS * 2 * GameConstants.PHYS_SCALE - 8;
                const t = dy / vy * 1000 / 60 * (1 / PocketedBallsTrail.SCALE_FACTOR);
    
                ball.velocity = new Billiard.Vector2D(0, vy);
    
                const railTween = this.game.add.tween(ball.mc)
                                    .to ({y: dy}, t, Phaser.Easing.Linear.None, true);
                
                railTween.onComplete.add(function(): void {

                    ball.mc.pocketTween = false;
                    ball.velocity = new Billiard.Vector2D(0, 0); // en realidad esto no hace falta 

                    if (numPocketedBalls !== 0) {
                        AudioManager.playEffect(AudioManager.BALL_HIT, .015);
                    }

                    const i = this.railTweens.indexOf(railTween);
                    this.railTweens.splice(i, 1);

                }, this); 

                this.railTweens.push(railTween);

            }, this);
        }

        public changeSide(): void {

            this.x = GameVars.gameData.powerBarSide === GameConstants.LEFT ? 485 : -485;
            this.rails.scale.x = GameVars.gameData.powerBarSide === GameConstants.LEFT ? 1 : -1;
            this.cover.scale.x = this.rails.scale.x;
        }

        public setPocketedBalls(): void {
            
            for (let i = 0; i < GameVars.pocketedBalls.length; i ++) {
                
                let ballId = GameVars.pocketedBalls[i];

                for (let j = 1; j < GameVars.ballArray.length; j ++) {

                    let ball = GameVars.ballArray[j];

                    if (ballId === GameVars.ballArray[j].id) {
                        ball.mc.shade.frameName = "shade_potted_ball.png";
                        ball.mc.position.set(0, PocketedBallsTrail.RAILS_LENGTH - i * GameConstants.BALL_RADIUS * 2 * GameConstants.PHYS_SCALE - 8); 
                        ball.mc.scale.set(PocketedBallsTrail.SCALE_FACTOR);
                        this.add(ball.mc);
                    }
                }
            }
        }
    }
}
