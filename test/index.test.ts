import rimraf from "rimraf";
import {
  run,
  findPreloadedFontNames,
  areValidFonts,
  findPreloadedFonts,
} from "./utils/TestUtil";
import { LoadType } from "../src/Types";
import { WP_OUTPUT_DIR } from "./constants/Constants";

const cleanOutput = (done: () => any) => {
  rimraf(WP_OUTPUT_DIR, done);
};

describe("WebpackFontPreloadPlugin tests", () => {
  beforeEach(cleanOutput);
  afterAll(cleanOutput);

  it("should preload all the available fonts when no configuration is specified", async () => {
    const extensions = ["woff", "woff2", "ttf", "eot"];
    const { document } = await run();
    const fonts = findPreloadedFontNames(document);
    expect(fonts.length).toBe(4);
    expect(await areValidFonts(fonts, extensions)).toBe(true);
  });

  it("should preload only specific fonts when `extensions` is specified", async () => {
    const extensions = ["ttf"];
    const { document } = await run(null, {
      extensions,
    });
    const fonts = findPreloadedFontNames(document);
    expect(fonts.length).toBe(2);
    expect(await areValidFonts(fonts, extensions)).toBe(true);
  });

  it("should not add `crossorigin` attribute when option is turned off", async () => {
    const extensions = ["ttf"];
    const { document } = await run(null, {
      extensions,
      crossorigin: false,
    });
    const fonts = findPreloadedFonts(document);
    expect(fonts.length).toBe(2);
    expect(fonts[0].getAttribute("crossorigin")).toBe(null);
    expect(fonts[1].getAttribute("crossorigin")).toBe(null);
  });

  it("should allow to filter font's for preload by specifying a contained string", async () => {
    const { document } = await run(null, {
      filter: "app-font",
    });
    const fonts = findPreloadedFontNames(document);
    expect(fonts.length).toBe(3);
  });

  it("should allow to filter font's for preload by specifying a regex", async () => {
    const { document } = await run(null, {
      filter: /^app-font-1|^ext/i,
    });
    const fonts = findPreloadedFontNames(document);
    expect(fonts.length).toBe(2);
  });

  it("should preload the fonts when public path is not provided", async () => {
    const { document } = await run({
      output: {
        path: WP_OUTPUT_DIR,
        filename: "[name].[chunkhash].bundle.js",
        chunkFilename: "[name].[chunkhash].chunk.js",
        assetModuleFilename: "[name].[hash][ext]",
      },
    });
    const fonts = findPreloadedFontNames(document);
    expect(fonts.length).toBe(4);
  });
});
