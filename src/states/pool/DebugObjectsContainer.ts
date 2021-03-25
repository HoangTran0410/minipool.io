namespace MiniBillar {
    
    export class DebugObjectsContainer extends Phaser.Group {
    
        public static WHITE = 0xFFFFFF;
        public static RED = 0xFF0000;
        public static GREEN = 0x00FF00;
        public static BLUE = 0x0000FF;
        public static YELLOW = 0xFFFF00;

        private graphics: Phaser.Graphics;
        private cueBallGraphics: Phaser.Graphics;

        constructor(game: Phaser.Game) {
    
            super(game, null, "debug-objects-container");    

            this.graphics = new Phaser.Graphics(this.game);
            this.add(this.graphics);

            this.cueBallGraphics = new Phaser.Graphics(this.game);
            this.add(this.cueBallGraphics);
        }

        public drawCircle(p: Billiard.Vector2D, radius: number, color: number): void {

            this.graphics.lineStyle(1, color);
            this.graphics.drawCircle(p.x * GameConstants.PHYS_SCALE, p.y * GameConstants.PHYS_SCALE, 2 * radius * GameConstants.PHYS_SCALE);
        }

        public clearCueBallGraphics(): void {
            
            this.cueBallGraphics.clear();
        }

        public drawCueBallTrajectoryPoint(p: Billiard.Vector2D, color: number): void {
            
            this.cueBallGraphics.lineStyle(1, color, 1);
            this.cueBallGraphics.beginFill(color, 1);
            this.cueBallGraphics.drawCircle(p.x * GameConstants.PHYS_SCALE, p.y * GameConstants.PHYS_SCALE, 5);
            this.cueBallGraphics.endFill();
        }

        public drawPoint(p: Billiard.Vector2D, color: number): void {
            
            this.graphics.lineStyle(1, color, 1);
            this.graphics.beginFill(color, 1);
            this.graphics.drawCircle(p.x * GameConstants.PHYS_SCALE, p.y * GameConstants.PHYS_SCALE, 5);
            this.graphics.endFill();
        }

        public drawLine(p1: Billiard.Vector2D, p2: Billiard.Vector2D, color: number): void {
            
            this.graphics.lineStyle(1, color, 1);
            this.graphics.moveTo(p1.x * GameConstants.PHYS_SCALE, p1.y * GameConstants.PHYS_SCALE);
            this.graphics.lineTo(p2.x * GameConstants.PHYS_SCALE, p2.y * GameConstants.PHYS_SCALE);
        }
    }
}
