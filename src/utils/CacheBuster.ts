module PhaserCachebuster {
    /**
     * Let"s change the type of the Phaser.Loader so we can add a cacheBuster property
     */
    export interface ICacheBustedLoader extends Phaser.Loader {
        cacheBuster: string;
    }

    /**
     * This here"s the cacheBuser plugin. It patches the Phaser.Loader with a new transformUrl method.
     * This method takes the cacheBuster parameter into account when fabricating a new url.
     *
     * Due to how this methid is used in the Phaser.Loader, all assets well get appended with a query parameter.
     */
    export class CacheBuster extends Phaser.Plugin {
        constructor(game: Phaser.Game, parent: Phaser.PluginManager) {
            super(game, parent);

            this.patchLoader();
        }

        private patchLoader(): void {
            Object.defineProperty(Phaser.Loader, "cacheBuster", {
                value: null
            });

            (<PhaserCachebuster.ICacheBustedLoader>Phaser.Loader.prototype).transformUrl = function (url: string, file?: any): string {
                // No url? return!
                if (!url) {
                    return "";
                }

                // Cachebusted string is added?
                // But only if it is set, and we aren"t loading the asset trough a data URI
                if ((<PhaserCachebuster.ICacheBustedLoader>this).cacheBuster !== null && null === url.match(/^(data:)/)) {
                    url += "?v=" + (<PhaserCachebuster.ICacheBustedLoader>this).cacheBuster;
                }

                if (url.match(/^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/)) {
                    return url;
                } else {
                    return this.baseURL + file.path + url;
                }
            };
        }
    }
}
