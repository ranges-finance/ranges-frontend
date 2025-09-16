import { TOKEN_TYPE, TTokenConfig } from "@constants/tokenConfig";

export class Token {
  public readonly name: TTokenConfig["name"];
  public readonly symbol: TTokenConfig["symbol"];
  public readonly decimals: TTokenConfig["decimals"];
  public readonly assetId: string;
  public readonly logo?: string;
  public readonly priceFeed?: TTokenConfig["priceFeed"];
  public readonly config: TTokenConfig;

  constructor(config: TTokenConfig) {
    this.name = config.name;
    this.symbol = config.symbol;
    this.decimals = config.decimals;
    this.logo = config.logo;
    this.assetId = config.symbol;
    this.priceFeed = config.priceFeed;

    this.config = config;
  }

  get address() {
    return this.config.type === TOKEN_TYPE.ERC20 ? this.config.address : undefined;
  }

  get isNative() {
    return this.config.type === TOKEN_TYPE.Native;
  }

  get isERC20() {
    return this.config.type === TOKEN_TYPE.ERC20;
  }
}
