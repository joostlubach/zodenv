import chalk from 'chalk'
import { z } from 'zod'

import config, { Config, configure } from './config'

export { type Config, configure }

export function env<T>(name: string, type: z.ZodType<T>, defaultValue?: T) {
  if (defaultValue != null) {
    type = type.default(defaultValue)
  }

  try {
    return type.parse(process.env[name])
  } catch (error) {
    if (error instanceof z.ZodError) {
      process.stderr.write(chalk`{bold {red ⨉} Error parsing environment variable {underline ${name}}}\n`)
      for (const issue of error.issues) {
        process.stderr.write(chalk`  • ${issue.message}\n`)
      }
      process.exit(255)
    } else {
      throw error
    }
  }
}

export namespace env {

  export function string(name: string, defaultValue?: string | undefined): string {
    return env(name, z.string(), defaultValue)
  }

  export function tryString(name: string): string | undefined {
    return env(name, z.string().optional())
  }

  export function boolean(name: string, defaultValue?: boolean): boolean {
    return env(name, z.any().transform(config.transformBoolean), defaultValue) as boolean
  }

  export function tryBoolean(name: string): boolean | undefined {
    return env(name, z.any().transform(config.transformBoolean).optional())
  }

  export function number(name: string, defaultValue?: number): number | undefined {
    return env(name, z.number(), defaultValue)  
  }

  export function tryNumber(name: string): number | undefined {
    return env(name, z.number().optional())
  }

}