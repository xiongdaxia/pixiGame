try {
  const PATH_TYPE = process.env.VUE_APP_PATH_TYPY || "master";
  const PathEnum = {
    development: 0,
    test: 1,
    beta: 2,
    master: 3,
    dev: 4,
    best: 5,
    0: "development",
    1: "test",
    2: "beta",
    3: "master",
    4: "dev",
    5: "best"
  };
  let DEV = PathEnum[0] === PATH_TYPE;
  let TEST = PathEnum[1] === PATH_TYPE;
  let BETA = PathEnum[2] === PATH_TYPE;
  let BEST = PathEnum[5] === PATH_TYPE;
  let MASTER = PathEnum[3] === PATH_TYPE || BEST;

  /**
   * proxy:是否需要代理
   * appId: 微信APPID，目前只有test、master环境有
   * proxyUrl: 代理地址
   * pcUrl: 对应的PC站地址
   */
  // protocol
  const defaultConfig = {
    development: {
      proxy: true,
      md5: "",
      publicPath: process.env.NODE_ENV === "development" ? "" : "",
      proxyUrl: "http://gsxapi.baijiahulian.com:20000/mock/201/",
      bigData: "https://test-click.gaotu100.com/"
    },
    dev: {
      proxy: true,
      md5: "",
      publicPath: "/cw-lab-dev",
      proxyUrl: "/",
      bigData: "https://test-click.gaotu100.com/"
    },
    test: {
      proxy: false,
      md5: "",
      publicPath: process.env.NODE_ENV === "development" ? "" : "/cw-lab",
      proxyUrl: "/",
      bigData: "https://test-click.gaotu100.com/"
    },
    beta: {
      proxy: false,
      md5: "",
      publicPath: process.env.NODE_ENV === "development" ? "" : "/cw-lab",
      proxyUrl: "/",
      bigData: "https://beta-click.gaotu100.com/"
    },
    master: {
      proxy: false,
      md5: "",
      publicPath: process.env.NODE_ENV === "development" ? "" : "/cw-lab",
      proxyUrl: "/",
      bigData: "https://click.gaotu100.com/"
    },
    best: {
      proxy: false,
      md5: "",
      publicPath:
        process.env.VUE_APP_IS_LOCAL === "1" ? "/dist" : "/cw-lab-dev",
      proxyUrl:
        process.env.VUE_APP_IS_LOCAL === "1"
          ? "http://gsxapi.baijiahulian.com:20000/mock/201/"
          : "/",
      bigData:
        process.env.VUE_APP_IS_LOCAL === "1"
          ? "https://test-click.gaotu100.com/"
          : "https://click.gaotu100.com/"
    }
  };
  module.exports = {
    env: defaultConfig[PATH_TYPE],
    DEV,
    TEST,
    BETA,
    MASTER
  };
} catch (error) {
  if (error) {
    process.exit();
  }
}
