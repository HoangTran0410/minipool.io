// LOGROS MINIJUEGOS
// miniplaySend2API("tables", 1) para la mesa 1
// miniplaySend2API("wins", 1) cada vez q se gane un partido PVP
// miniplaySend2API("score", 1750) para los puntos. Al final de la partida SOLO mando el highscore siempre
// miniplaySend2API("plays", 1) al final de cada partida, no?

// URL de testeo
// https://www.minijuegos.com/juego/dev-mini-pool-io

// documentacion sobre los anuncios
// https://ssl.miniplay.com/dev/docs/c2s-js-api#ads-module

module MiniBillar {

    export class GameConstants {

        public static readonly VERSION = "1.0.2";
        public static readonly DEVELOPMENT = false;
        public static readonly DEBUG = false;

        public static readonly VERBOSE = false;
        public static readonly SHOW_DEV_BUTTONS_ON_SOLO = false;
        public static readonly SHOW_PVBOT_CHEAT_BUTTONS = false;
        public static readonly LOG_SERVER_INFO = false;
        public static readonly LOG_BOT_SERVER_INFO = false;

        public static readonly GAME_WIDTH = 1024;
        public static readonly GAME_HEIGHT = 640;

        public static readonly ASSETS_PATH = gameConfig.GAME_ASSETS_PATH || "assets";

        // los botones de las stores
        public static readonly APPLE = "apple";
        public static readonly ANDROID = "android";

        // el tiempo de una partida SOLO
        public static readonly TIME_SOLO_MATCH = 120; // 120
        
        // pool
        public static readonly PHYS_SCALE = .01;
        public static readonly BALL_RADIUS = 1400;
        public static readonly FRICTION = 1;
        public static readonly POCKET_RADIUS = 2300;
        public static readonly MIN_VELOCITY = 2;
        public static readonly CUSHION_RESTITUTION = .6;
        public static readonly BALL_RESTITUTION = .91;

        // swipe
        public static readonly MIN_SWIPE_CHANGE_DISTANCE = 320;

        // los bitmaps
        public static readonly BITMAP_SIZE = 64;

        public static readonly BLACK_SQUARE = "black-square";
        public static readonly BLUE_SQUARE = "blue_square";
        public static readonly WHITE_SQUARE = "white-square";
        public static readonly RED_SQUARE = "red-square";
        public static readonly ORANGE_SQUARE = "orange-square";
        public static readonly YELLOW_SQUARE = "yellow-square";
        public static readonly GREEN_SQUARE = "green-square";
        public static readonly GREY_SQUARE = "grey-square";

        // balls
        public static readonly BALL_TYPE_SOLID = "ball solid";
        public static readonly BALL_TYPE_STRIPED = "ball striped";
        public static readonly BALL_TYPE_BLACK = "ball black";
        public static readonly BALL_TYPE_NONE = "ball none";

        // directions
        public static readonly LEFT = "left";
        public static readonly RIGHT = "right";
        public static readonly UP = "up";
        public static readonly DOWN = "down";

        // gameMode
        public static readonly NO_GAME = "no_game";
        public static readonly SOLO_MODE = "solo";
        public static readonly PVP_MODE = "pvp";
        public static readonly PVBOT_MODE = "pvbot";

        // type notification
        public static readonly NOTIFICATION_NONE = "notification none";
        public static readonly NOTIFICATION_CUE_BALL_POTTED = "notification cue ball potted";
        public static readonly NOTIFICATION_WRONG_BALL_POTTED = "notification wrong ball potted";
        public static readonly NOTIFICATION_WRONG_BALL_TOUCHED = "notification wrong ball touched";
        public static readonly NOTIFICATION_NO_BALL_TOUCHED = "notification no ball touched";
        public static readonly NOTIFICATION_NO_WALL_COLLISION = "notification no wall collision";
        public static readonly NOTIFICATION_TIMEOUT = "notification timeout";
        public static readonly NOTIFICATION_ILEGAL_BREAK = "notification ilegal";
        public static readonly NOTIFICATION_YOUR_TURN = "notification your turn";
        public static readonly NOTIFICATION_FIRST_TIME_INSTRUCTIONS = "first time instructions";

        // game ended
        public static GAME_UNDECIDED = "game_undecided";
        public static PLAYER_WIN = "player_win";
        public static PLAYER_LOSE = "player_lose";
        public static PLAYER_RESIGNS = "player_resigns";
        public static ADVERSARY_LEFT_ROOM = "adversary_left_room";
        
        // rewards
        public static MIN_PTS_TO_GET_REWARD = 2500;
        public static MIN_PTS_UNLOCK_TABLE = 200;
        public static MIN_PTS_UNLOCK_CUE = 100;
        public static MIN_CARDS_WON_AT_A_TIME = 6;
        public static MAX_CARDS_WON_AT_A_TIME = 15;
        public static readonly RULES_TEXT = "Pocket all coloured balls before the clock runs out.\n" +
            "Coloured balls add 50 pts and 10s. The cue ball deducts 20 pts.\n" +
            "Score at least " + GameConstants.MIN_PTS_TO_GET_REWARD.toString() + " pts to unlock new cues and tables!";

        // MULTIPLAYER
        public static readonly PLAYER = "player";
        public static readonly ADVERSARY = "adversary";
        public static readonly MESSAGE_TYPE_PLAYER_SET = "PLAYER SET";
        public static readonly MESSAGE_TYPE_SHOT = "SHOT";
        public static readonly MESSAGE_TYPE_BALLS_STOPPED = "BALLS_STOPPED";
        public static readonly MESSAGE_TYPE_CUE_ROTATION = "CUE_ROTATION";
        public static readonly MESSAGE_TYPE_POCKET_SELECTED = "POCKET_SELECTED";
        public static readonly MESSAGE_TYPE_CUE_BALL = "CUE_BALL";
        public static readonly MESSAGE_TYPE_RESIGN = "RESIGN";
        public static readonly MESSAGE_TYPE_PLAYER_QUIT_LOBBY = "PLAYER_QUIT_LOBBY";
        public static readonly MESSAGE_TYPE_EMOTICON_SELECTED = "EMOTICON_SELECTED";
        public static readonly MESSAGE_TYPE_CUE_BALL_SPIN_SET = "CUE_BALL_SPIN_SET";
        public static readonly MESSAGE_TYPE_BALL_8_POCKETED = "BALL_8_POCKETED";

        // TABLE SETUP
        public static readonly BALLS_INITIAL_POSITIONS: number[][] = [
            [-21000, 0],
            [21000, 0],
            [23424.8, 1400],
            [30699.2, -5600],
            [28274.4, 4200],
            [25849.6, 2800],
            [28274.4, -4200],
            [28274.4, 1400],
            [25849.6, 0],
            [28274.4, -1400],
            [25849.6, -2800],
            [30699.2, 0],
            [30699.2, 2800],
            [30699.2, -2800],
            [30699.2, 5600],
            [23424.8, -1400]
        ];
        // for debugging. places black hole in front of pocket at match start
        // public static readonly BALLS_INITIAL_POSITIONS: number[][] = [
        //      [0, 0],
        //      [0, 19000],
        //      [39000, 19000],
        //      [39000, -19000],
        //      [-39000, 19000],
        //      [-39000, -19000],
        //      [-36000, 19000],`
        //      [-36000, -19000],
        //      [0, -19000],
        //      [28274.4, -1400],
        //      [25849.6, -2800],
        //      [30699.2, 0],
        //      [30699.2, 2800],
        //      [30699.2, -2800],
        //      [30699.2, 5600],
        //      [23424.8, -1400]
        //  ];

        public static readonly BALLS_INITIAL_POSITIONS_SOLO: number[][] = [
            [-21000, 0],
            [21000, 0],
            [23424.8, 1400],
            [30699.2, -5600 - 4000],
            [28274.4, 4200 + 4000],
            [25849.6, 2800],
            [28274.4, -4200 - 4000],
            [28274.4, 1400],
            [25849.6, 0],
            [28274.4, -1400],
            [25849.6, -2800],
            [30699.2, 0],
            [30699.2, 2800 + 4000],
            [30699.2, -2800 - 4000],
            [30699.2, 5600 + 4000],
            [23424.8, -1400]
        ];
       /*public static readonly BALLS_INITIAL_POSITIONS_SOLO: number[][] = [
           [-5000, 19000],
              [0, 0],
              [39000, 19000],
              [39000, -19000],
              [-39000, 19000],
              [-39000, -19000],
              [36000, 19000],
              [-33000, 19000],
              [0, -19000],
              [28274.4, -1400],
              [25849.6, -2800],
                [-36000, 19000],
              [30699.2, 2800],
              [30699.2, -2800],
              [30699.2, 5600],
              [23424.8, -1400]
       ];*/
        

        // los datos de la room / juego
        public static readonly SAVED_GAME_DATA_KEY = "minibillar-data-key-1";
    }
}
