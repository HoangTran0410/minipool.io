module MiniBillar {

    export class Game extends Phaser.Game {

        public static currentInstance: Game;

        constructor() {

            let renderer: number;

            if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i)) {
                renderer = Phaser.CANVAS;
            } else {
                renderer = Phaser.AUTO;
            }

            super(GameConstants.GAME_WIDTH, GameConstants.GAME_HEIGHT, renderer, "content", null, false, true);

            Game.currentInstance = this;

            this.state.add("Boot", Boot, true);
            this.state.add("PreLoader", PreLoader, false);
            this.state.add("SplashState", SplashState, false);
            this.state.add("LobbyState", LobbyState, false);
            this.state.add("PoolState", PoolState, false);
            this.state.add("EquipmentState", EquipmentState, false);
            this.state.add("PlayerRegisteringState", PlayerRegisteringState, false);

            this.state.start("Boot");
        }
    }
}
