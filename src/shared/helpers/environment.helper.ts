import configs from "../configs/env.configs";

export const isDevEnv = () => configs.env === "development";
export const isProdEnv = () => configs.env === "production";
