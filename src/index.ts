import chalk from 'chalk-template'
import { safeParseFloat } from 'ytil'
import { z } from 'zod'

import config, { Config, configure } from './config'

export { type Config, configure }

export function createEnv(source: NodeJS.ProcessEnv = process.env) {
  function env<T>(name: string, type: z.ZodType<T>, defaultValue?: T | undefined) {
    if (defaultValue !== undefined) {
      type = type.default(defaultValue as z.util.NoUndefined<T>)
    }

    try {
      return type.parse(source[name])
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

  Object.assign(env, {

    string(name: string, defaultValue?: string | undefined): string {
      return env(name, z.string(), defaultValue)
    },

    tryString(name: string): string | undefined {
      return env(name, z.string().optional())
    },

    boolean(name: string, defaultValue?: boolean): boolean {
      return env(name, z.any().transform(config.transformBoolean), defaultValue) as boolean
    },

    tryBoolean(name: string): boolean | undefined {
      return env(name, z.any().transform(config.transformBoolean).optional())
    },

    number(name: string, defaultValue?: number): number {
      return env(name, z.string().transform(safeParseFloat).pipe(z.number()), defaultValue)
    },

    tryNumber(name: string): number | undefined {
      return env(name, z.string().optional().transform(safeParseFloat).pipe(z.number().optional()))
    },
  })

  return env as ZodEnv
}

export interface ZodEnv {
  <T>(name: string, type: z.ZodType<T>, defaultValue?: T | undefined): T;
  string(name: string, defaultValue?: string): string;
  boolean(name: string, defaultValue?: boolean): boolean;
  number(name: string, defaultValue?: number): number;

  tryString(name: string): string | undefined;
  tryBoolean(name: string): boolean | undefined;
  tryNumber(name: string): number | undefined;
}

export const env = createEnv()