namespace MiniBillar {

    export class Utils {

        public static colourRulesText(rulesText: Phaser.Text): void {

            const rulesColorOffset = Utils.getNumberOfDigitsInNumber(GameConstants.MIN_PTS_TO_GET_REWARD);

            Utils.colourText(rulesText, 115, rulesColorOffset + 50, "#fff562", "#1D2836");
        }

        public static getRandomUsernameList(): string[] {

            return [
                "AllyCookie",
                "Branstoqu",
                "Bur_gizer",
                "Chatomadli",
                "ChoneKnotLou",
                "Conceme41",
                "CoooooopsFree",
                "Darklessra",
                "Garioney",
                "GrabsDrummer",
                "IamaBloom",
                "1k1nt1cs",
                "Issueinters",
                "Knottownce",
                "LightN_inja",
                "Multing",
                "Ravag3rma",
                "RockerPersonal",
                "Slip_korks",
                "Sportswaba",
                "Stori3sDas",
                "TagzBall",
                "0Th3reCoverag3",
                "UnowPlus",
                "Fistro",
                "CountOfMor",
                "Mistery2005",
                "KineticForce",
                "M. Rajoy",
                "ChumbaWumba",
                "PlayerTotal",
                "Barcelono",
                "BrainDamage",
                "LobotomyHero",
                "MiniRock",
                "LettuceJuice",
                "Camaleon",
                "Bloom",
                "buTTer",
                "tenderGlobe",
                "ColdFeet",
                "LovelLove",
                "StronGGGG",
                "PoopSY",
                "kidd_2005",
                "thunderblade",
                "Priapus",
                "koksy"
            ];
        }

        public static getRandomAvatarImageList(): string[] {

            return [
                "billar_m01",
                "billar_m02",
                "billar_m03",
                "billar_m04",
                "billar_m05",
                "billar_m06",
                "billar_m07",
                "billar_m08",
                "billar_w01",
                "billar_w02",
                "billar_w03",
                "billar_w04",
                "billar_w05",
                "billar_w06",
                "billar_w07",
                "billar_w08"
            ];
        }

        public static colourText(rulesText: Phaser.Text, startIndex: number, charCount: number, textColour: string, strokeColour?: string): any {

            const oldFill = rulesText.fill;
            const oldStroke = rulesText.stroke;

            rulesText.addColor(textColour, startIndex);
            rulesText.addColor(oldFill, startIndex + charCount);

            if (strokeColour) {
                rulesText.addStrokeColor(strokeColour, startIndex);
                rulesText.addStrokeColor(oldStroke, startIndex + charCount);
            }
        }

        public static truncateName(name: string, limit: number = 10) {

            if (name.length > limit) {
                name = name.substr(0, limit);
                name += "...";
            }

            return name;
        }

        public static validNumber(x: number): string {

            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        public static getNumberOfDigitsInNumber(num: number): number {

            if (num < 0) {
                throw "Invalid. Number must be larger than 0";
            }

            let digits = 1;
            let m = 10;

            while (m <= num) {
                digits++;
                m *= 10;
            }

            return digits;
        }

        public static timeToString(time: number): string {

            let minutes: any = Math.floor(time / 60);
            let seconds: any = time - (minutes * 60);

            if (minutes < 10) {
                minutes = "0" + minutes;
            }

            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            return minutes + ":" + seconds;
        }

        public static shuffle(array: number[], prng: Phaser.RandomDataGenerator): number[] {

            let currentIndex = array.length, temporaryValue, randomIndex;
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                // Pick a remaining element...
                randomIndex = Math.floor(prng.frac() * currentIndex);
                currentIndex -= 1;
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        }

        public static centerPoint(array: { x: number, y: number }[]): { x: number, y: number } {

            let x = 0;
            let y = 0;

            for (let i = 0; i < array.length; i++) {
                x += array[i].x;
                y += array[i].y;
            }

            return { x: x / array.length, y: y / array.length };
        }

        public static parseString(json: string): any {

            json = json.replace(/id:/g, '"id":');
            json = json.replace(/active/g, '"active"');
            json = json.replace(/x:/g, '"x":');
            json = json.replace(/y:/g, '"y":');
            json = json.replace(/ballsData/g, '"ballsData"');
            json = json.replace(/english/g, '"english"');
            json = json.replace(/deltaScrewX/g, '"deltaScrewX"');
            json = json.replace(/deltaScrewY/g, '"deltaScrewY"');
            json = json.replace(/playerId/g, '"playerId"');

            return JSON.parse(json);
        }

        public static stringify(object: any): string {
            let str = JSON.stringify(object);
            return str.replace(/\"([^(\")"]+)\":/g, "$1:");
        }

        public static createAnimFramesArr(filename: string, framesCount: number, reverse: boolean = false,
            timesToRepeatFinalFrame: number = 0, blankBufferBeforeAnim: number = 0): string[] {

            let frames: string[] = [];

            for (let i = 0; i < framesCount; i++) {

                if (i === 0 && blankBufferBeforeAnim > 0) {
                    for (let j = 0; j < blankBufferBeforeAnim; j++) {
                        frames.push("blank.png");
                    }
                }

                frames.push(filename + "_" + (reverse ? (framesCount - 1 - i) : i).toString() + ".png");

                if (i === framesCount - 1 && timesToRepeatFinalFrame > 0) {

                    for (let j = 0; j < timesToRepeatFinalFrame; j++) {
                        frames.push(filename + "_" + (reverse ? (framesCount - 1 - i) : i).toString() + ".png");
                    }
                }
            }

            return frames;
        }

        // https://github.com/darkskyapp/string-hash
        public static hash(str: string) {

            let hash: number = 5381;
            let i = str.length;

            while (i) {
                hash = (hash * 33) ^ str.charCodeAt(--i);
            }

            /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
             * integers. Since we want the results to be always positive, convert the
             * signed int to an unsigned by doing an unsigned bitshift. */
            return hash >>> 0;
        }
    }
}
