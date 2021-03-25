namespace MiniBillar {

    export class SwitchButton extends Phaser.Group {

        public static readonly MUSIC = "music";
        public static readonly POWER = "power";

        public isOn: boolean;

        private typeSwitch: string;

        constructor(game: Phaser.Game, isOn: boolean, typeSwitch: string) {

            super(game, null, "switch-button");

            this.isOn = isOn;

            this.typeSwitch = typeSwitch;

            const button = new Phaser.Button(this.game, 0, 0, "texture_atlas_1", this.onDown, this);
            button.anchor.set(.5);
            this.add(button);

            if (this.isOn) {
                button.setFrames("btn_switch_on_on.png", "btn_switch_on_off.png", "btn_switch_on_on.png", "btn_switch_on_off.png");
            } else {
                button.setFrames("btn_switch_off_on.png", "btn_switch_off_off.png", "btn_switch_off_on.png", "btn_switch_off_off.png");
            }
        }

        private onDown(button: Phaser.Button): void {

            AudioManager.playEffect(AudioManager.BTN_NORMAL);

            this.isOn = !this.isOn;

            if (this.isOn) {
                button.setFrames("btn_switch_on_on.png", "btn_switch_on_off.png", "btn_switch_on_on.png", "btn_switch_on_off.png");
            } else {
                button.setFrames("btn_switch_off_on.png", "btn_switch_off_off.png", "btn_switch_off_on.png", "btn_switch_off_off.png");
            }

            if (this.typeSwitch === SwitchButton.MUSIC) {

                AudioManager.switchAudio();

            } else if (this.typeSwitch === SwitchButton.POWER) {

                GameManager.changePowerBar();
            }

            AudioManager.playEffect(AudioManager.BTN_NORMAL);
        }
    }
}
