#!/usr/bin/enc node

import inquirer from 'inquirer';
import { join, dirname } from 'path';
import { execSync, exec } from 'child_process';
import { version } from 'process';
import { fileURLToPath } from 'url';
import ora from 'ora';

export const sleep = (ms = 1500) => new Promise((r) => setTimeout(r, ms));

const SPINNER_TEXT = {
  loading: 'Loading...',
  error: 'An error occurred',
  wrongBranch: "You're on the wrong branch",
  verifyNodeV: 'Verifying node version',
  validNodeV: 'Valid node version'
}

export class Pipeline {
  #branches
  #__filename = fileURLToPath(import.meta.url);
  #__dirname = dirname(this.#__filename);
  #spinner = ora(SPINNER_TEXT.loading)
  #currentNodeVersion = parseInt(version.split('.').at(0).replace('v', ''))
  #requiredNodeVersion = null
  #requireNodeVersion = true

  constructor({ branches = [], nodeVersion = null, requireNodeVersion = true }) {
    this.#branches = branches;
    this.#requiredNodeVersion = parseInt(nodeVersion)
    this.#requireNodeVersion = requireNodeVersion;
  }

  getPathFrom = (path = '') => join(this.#__dirname, path)

  getBranches() {
    return this.#branches
  }

  message(message = SPINNER_TEXT.error) {
    this.#spinner.info(message)
    this.#cliSpace()
    process.exit(1)
  }

  fail(error = SPINNER_TEXT.error) {
    this.#spinner.fail(error)
    process.exit(1)
  }

  runScrip(script = '') {
    if (script === '') return

    execSync(script, { stdio: 'inherit' });
    this.#cliSpace()
  }

  async init(cb) {

    await this.#verifyNodeVersion()

    const choosenBranchToDeploy = await this.#questions()

    try {
      await this.#isCurrentBranchSameTo(choosenBranchToDeploy)
    } catch (error) {
      this.#cliSpace()
      this.#spinner.fail(SPINNER_TEXT.wrongBranch)
      this.#cliSpace()
      process.exit(1)
    }

    this.#spinner.start(SPINNER_TEXT.loading);
    await sleep(500)
    this.#cliSpace()

    await cb(this)

    this.#spinner.succeed('Pipeline done')
    process.exit(0)
  }

  #cliSpace() {
    console.log('\n');
  }

  async #isCurrentBranchSameTo(branchName = '') {
    if (branchName === '') {
      process.exit(1)
    }

    const value = await new Promise((resolve, reject) => {
      exec('git rev-parse --abbrev-ref HEAD', (err, stdout, stderr) => {
        if (err) {
          this.#spinner.fail("couldn't read your current branch")
          process.exit(1)
        }

        if (typeof stdout === 'string' && (stdout.trim() === branchName)) {
          resolve(true)
        }

        reject(false)

      });

    })

    return value
  }

  #questions = async () => {
    const { environment } = await inquirer.prompt
      (
        {
          name: 'environment',
          type: 'list',
          choices: this.#branches,
          message: 'Select your branch to deploy',
        },
      )
    return environment
  }

  async #verifyNodeVersion() {
    if (this.#requireNodeVersion === false) return true

    this.#spinner.start(SPINNER_TEXT.verifyNodeV)
    if (this.#currentNodeVersion === this.#requiredNodeVersion) {
      this.#spinner.succeed(SPINNER_TEXT.validNodeV)
      this.#spinner.stop()
      this.#spinner.clear()
      return true
    }

    await sleep(500)
    this.#spinner.fail(`Node version mismatch, current: ${this.#currentNodeVersion}, required: ${this.#requiredNodeVersion ?? 'not defined'}`)
    this.#spinner.stop()
    this.#spinner.clear()
    process.exit(1)
  }
}
