import { merge } from 'lodash'

export interface Config {
  transformBoolean: (raw: any) => boolean | undefined
}

const config: Config = {
  transformBoolean: (raw: any) => {
    if (raw == null) { return undefined }
    return raw !== '0' && raw !== 'no' && `${raw}`.trim() !== ''
  }
}

export default config

export function configure(cfg?: Partial<Config>) {
  merge(config, cfg, {
    openai: {
      apiKey: process.env.OPENAI_APIKEY ?? null,
    }
  })
}