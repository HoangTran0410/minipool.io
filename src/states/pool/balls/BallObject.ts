namespace MiniBillar {

    export class BallObject  {

        public id: number;
        public active: boolean;
        public position: Billiard.Vector2D;
        public velocity: Billiard.Vector2D;
        public shadow: Phaser.Image;
        public mc: Ball;
        public firstContact: boolean;
        public contactArray: Billiard.Contact[];
        public lastCollisionObject: any;
        public waitingToTheRail: boolean;
        
        // para la cue ball
        public screw: number;
        public english: number;
        public deltaScrew: Billiard.Vector2D;
        public grip: number;
        public ySpin: number;
       
        protected game: Phaser.Game;

        constructor(game: Phaser.Game, n: number, x: number, y: number, active: boolean) {
            
            this.game = game;

            this.id = n;
            this.active = active;

            if (this.active) {
                this.shadow = new Phaser.Image(this.game, 0, 0, "texture_atlas_1", "shadow.png");
                this.shadow.anchor.set(.5);
            } else {
                this.shadow = null;
            }

            this.mc = new Ball(this.game, GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE, n, this);
        
            this.position = new Billiard.Vector2D(x, y);
            this.velocity = new Billiard.Vector2D(0, 0);
            this.lastCollisionObject = null;   
            this.firstContact = false;
            this.contactArray = [];
            this.waitingToTheRail = false;

            if (this.id === 0) {
                this.screw = 0;
                this.english = 0;
                this.deltaScrew = new Billiard.Vector2D(0, 0);
            }

            this.grip = 1;
            this.ySpin = 0;

            this.mc.x = this.position.x * GameConstants.PHYS_SCALE;
            this.mc.y = this.position.y * GameConstants.PHYS_SCALE;

            if (this.shadow) {
                this.shadow.x = this.mc.x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.x / 300);
                this.shadow.y = this.mc.y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.y / 150);
            } 
        }

        public setPosition(x: number, y: number) {

            this.mc.x = x;
            this.mc.y = y;
                
            this.shadow.x = this.mc.x + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.x / 300);
            this.shadow.y = this.mc.y + .35 * GameConstants.BALL_RADIUS * GameConstants.PHYS_SCALE * (this.mc.y / 150);    

            this.position.x = this.mc.x / GameConstants.PHYS_SCALE;
            this.position.y = this.mc.y / GameConstants.PHYS_SCALE;
        }

        public destroy(): void {

            this.mc.destroy();
            this.shadow.destroy();
        }
    }
}
