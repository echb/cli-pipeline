#!/usr/bin/enc node

import inquirer from 'inquirer';
import { join, dirname } from 'path';
import { exec } from 'child_process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import ora from 'ora';

export class Pipeline {
  #branches
  #__filename = fileURLToPath(import.meta.url);
  #__dirname = dirname(this.#__filename);
  #spinner = ora('Loading unicorns')

  constructor(branches = []) {
    this.#branches = branches;
  }

  getPathFrom = (path = '') => join(this.#__dirname, path)

  getBranches() {
    return this.#branches
  }

  #wichEnv = async () => {
    const { environment } = await inquirer.prompt
      ({
        name: 'environment',
        type: 'list',
        choices: this.#branches,
        message: 'question',
      })
    return environment
  }

  stop(error = 'An error occurred') {
    console.error(error);
    process.exit(1)
  }

  runScrip(script = '') {
    if (script === '') return

    execSync(script, { stdio: 'inherit' });
    this.#cliSpace()
  }

  async init(cb) {
    const choosenBranchToDeploy = await this.#wichEnv()

    try {
      await this.#isCurrentBranchSameTo(choosenBranchToDeploy)
    } catch (error) {
      this.#cliSpace()
      this.#spinner.fail("You're on the wrong branch")
      this.#cliSpace()
      process.exit(1)
    }

    this.#spinner.start();
    this.#cliSpace()
    cb(this)
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
          console.error("couldn't read your current branch");
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
}
