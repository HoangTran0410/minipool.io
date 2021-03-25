// audiosprite --e "mp3,ogg" --o ../assets/audio/audiosprite *.mp3
namespace MiniBillar {

    export class AudioManager {

        public static readonly BALL_HIT: string = "ball_hit";
        public static readonly POCKET: string = "pocket";
        public static readonly CUSHION_HIT: string = "cushion_hit";
        public static readonly LOSE_POINTS: string = "lose_points";
        public static readonly CUE_HIT: string = "cue_hit";
        public static readonly POCKET_ADD_TIME = "pocket_add_time";
        public static readonly BTN_NORMAL: string = "click_btn";
        public static readonly GIFT_CARD_SWISH: string = "gift_card_swish";
        public static readonly GIFT_OPENS: string = "gift_opens";
        public static readonly LOSE: string = "lose";
        public static readonly WIN: string = "win";
        public static readonly MUSIC_MATCH_MINIBILLARD: string = "music_match_minibilliard";
        public static readonly MUSIC_MINIBILLARD: string = "music_minibilliard";
        public static readonly TIME_RUNNING_OUT: string = null;

        public static readonly MIN_TIME = 75;

        private static game: Phaser.Game;
        private static audioSprite: Phaser.AudioSprite;
        private static loopPlayingKey: string;
        private static ballHitEffectPlayedTime: number;
        private static cushionHitEffectPlayedTime: number;
        private static pocketHitEffectPlayedTime: number;

        private static runningTime: boolean;

        public static init(game: Phaser.Game): void {

            AudioManager.game = game;

            AudioManager.loopPlayingKey = null;

            AudioManager.audioSprite = AudioManager.game.add.audioSprite("audio-sprite");

            AudioManager.ballHitEffectPlayedTime = AudioManager.game.time.time;
            AudioManager.cushionHitEffectPlayedTime = AudioManager.game.time.time;
            AudioManager.pocketHitEffectPlayedTime = AudioManager.game.time.time;

            AudioManager.runningTime = false;

            AudioManager.game.sound.mute = GameVars.gameData.musicMuted;
        }  

        public static switchAudio(): void {

            GameVars.gameData.musicMuted = !GameVars.gameData.musicMuted;

            AudioManager.game.sound.mute = GameVars.gameData.musicMuted;

            GameManager.writeGameData();
        }

        public static playEffect(key: string, volume?: number): void {

            if (key === null || typeof key === "undefined") {
                return;
            }

            if (key === AudioManager.TIME_RUNNING_OUT) {
                if (AudioManager.runningTime) {
                    return;
                } else {
                    AudioManager.runningTime = true;
                }
            }

            let omitEffect = false;

            if (key === AudioManager.BALL_HIT) {
                if (AudioManager.game.time.time - AudioManager.ballHitEffectPlayedTime < AudioManager.MIN_TIME) {
                    omitEffect = true;
                } else {
                    AudioManager.ballHitEffectPlayedTime = AudioManager.game.time.time;
                }
            } else if (key === AudioManager.CUSHION_HIT) {
                if (AudioManager.game.time.time - AudioManager.cushionHitEffectPlayedTime < AudioManager.MIN_TIME) {
                    omitEffect = true;
                } else {
                    AudioManager.cushionHitEffectPlayedTime = AudioManager.game.time.time;
                }
            } else if (key === AudioManager.POCKET) {
                if (AudioManager.game.time.time - AudioManager.pocketHitEffectPlayedTime < AudioManager.MIN_TIME) {
                    omitEffect = true;
                } else {
                    AudioManager.pocketHitEffectPlayedTime = AudioManager.game.time.time;
                }
            }

            if (!omitEffect) {
                AudioManager.audioSprite.play(key, volume);
            }
        }

        public static stopEffect(key: string, fade?: boolean): void {

            if (key === null || typeof key === "undefined") {
                return;
            }

            if (key === AudioManager.TIME_RUNNING_OUT) {
                AudioManager.runningTime = false;
            }

            if (fade) {
                const sound = AudioManager.audioSprite.get(key);
                sound.fadeOut(850);
            } else {
                AudioManager.audioSprite.stop(key);
            }
        }

        public static playMusic(key: string, loop?: boolean, volume?: number): void {

            loop = loop || false;
            volume = volume || 1;

            if (loop) {

                if (AudioManager.loopPlayingKey && (AudioManager.loopPlayingKey !== key)) {
                    AudioManager.stopMusic(AudioManager.loopPlayingKey, true, true);
                }
            }

            if (key !== this.loopPlayingKey) {

                AudioManager.audioSprite.play(key, volume);

                AudioManager.loopPlayingKey = key;
            }
        }

        public static stopMusic(key: string, fade?: boolean, loop?: boolean): void {

            if (key === null || typeof key === "undefined") {
                return;
            }

            if (fade) {
                const sound = this.audioSprite.get(key);
                sound.fadeOut(850);
            } else {
                AudioManager.audioSprite.stop(key);
            }

            if (loop) {
                AudioManager.loopPlayingKey = null;
            }
        }
    }
}
