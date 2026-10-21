interface YouTubePlayerCaptionOptions {
  getOptions: () => string[];
  unloadModule: (moduleName: string) => void;
}

export const disableYouTubeCaptions = (player: YouTubePlayerCaptionOptions): void => {
  if (player.getOptions().includes("captions")) {
    player.unloadModule("captions");
  }
};
