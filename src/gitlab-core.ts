/* eslint-disable no-console */
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {readFileSync} from 'node:fs'
import yaml from 'yaml'

const defaultYml = yaml.parse(
  readFileSync(
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../action.yml'),
    'utf-8'
  )
)

export const getBooleanInput = (key: string) => {
  return Boolean(defaultYml.inputs[key].default)
}
export const getInput = (key: string) => {
  return defaultYml.inputs[key].default
}
export const getMultilineInput = (key: string) => {
  return defaultYml.inputs[key].default.split('\n')
}

export const setFailed = console.log
export const info = console.log
export const warning = console.warn
export const error = console.error
