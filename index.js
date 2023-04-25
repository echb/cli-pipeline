#!/usr/bin/enc node
// @ts-check
import inquirer from 'inquirer';
import { join, dirname } from 'path';
import { execSync, exec } from 'child_process';
import { version } from 'process';
import { fileURLToPath } from 'url';
import ora from 'ora';

export const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));

const SPINNER_TEXT = {
  loading: 'Loading...',
  error: 'An error occurred',
  wrongBranch: "You're on the wrong branch",
  verifyNodeV: 'Verifying node version',
  warnVerifyNodeV: 'Is highly recomended allow check node version',
  validNodeV: 'Valid node version',
  succeed: 'Task done',
}

export class Pipeline {
  // #branches
  #__filename = fileURLToPath(import.meta.url);
  #__dirname = dirname(this.#__filename);
  #spinner = ora(SPINNER_TEXT.loading)
  #currentNodeVersion = parseInt(version.split('.').at(0).replace('v', ''))
  #requiredNodeVersion = null
  #requireNodeVersion = true
  #initialQuestions = []

  /**
   * @typedef {import('./types').PipelineParam} PipelineParam
   * @param {PipelineParam}
   */
  constructor({ nodeVersion = null, requireNodeVersion = true, initialQuestions = [] }) {
    // this.#branches = branches;
    this.#requiredNodeVersion = parseInt(nodeVersion)
    this.#requireNodeVersion = requireNodeVersion;
    this.#initialQuestions = initialQuestions;
  }

  getPathFrom = (path = '') => join(this.#__dirname, path)

  // getBranches() {
  //   return this.#branches
  // }

  async cliUpdate(message = SPINNER_TEXT.error) {
    await sleep(300)
    this.#spinner.text = message
  }

  async cliStop(message = SPINNER_TEXT.error) {
    await sleep(300)
    this.#spinner.stop(message)
  }

  async cliRestart(message = SPINNER_TEXT.error) {
    await sleep(300)
    this.#spinner.start(message)
  }
  #message(message = SPINNER_TEXT.error) {
    this.#spinner.info(message)
    // this.#cliSpace()
    // process.exit(1)
  }

  fail(error = SPINNER_TEXT.error) {
    this.#spinner.fail(error)
    process.exit(1)
  }

  /**
   * @param {string} script
   * Here you can run cli commands like you usually do with normal cli
   */
  runScrip(script = '') {
    if (script === '') return

    this.#cliSpace()
    execSync(script, { stdio: 'inherit' });
    this.#cliSpace()
  }

  async init(cb) {

    await this.#verifyNodeVersion()

    // const choosenBranchToDeploy = await this.#askBranchToDeploy()

    const questions = await this.aksOptions(this.#initialQuestions)

    // process.exit(0)

    // try {
    //   await this.#isCurrentBranchSameTo(choosenBranchToDeploy)
    // } catch (error) {
    //   this.#cliSpace()
    //   this.#spinner.fail(SPINNER_TEXT.wrongBranch)
    //   this.#cliSpace()
    //   process.exit(1)
    // }

    this.#spinner.start(SPINNER_TEXT.loading);
    await sleep(500)
    // this.#cliSpace()

    await cb(questions, this)

    // this.#spinner.succeed(SPINNER_TEXT.succeed)
    // process.exit(0)
    // this.done()
  }

  async done() {
    await sleep(300)
    this.#spinner.succeed(SPINNER_TEXT.succeed)
    this.#spinner.clear()
    process.exit(0)
  }

  #cliSpace() {
    console.log('\n');
  }

  async verifyBranch(branchName = '') {
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

  // #askBranchToDeploy = async () => {
  //   const a = await inquirer.prompt([
  //     {
  //       name: 'environment',
  //       type: 'list',
  //       choices: this.#branches,
  //       message: 'Select your branch to deploy',
  //     }
  //   ])
  //   console.log(a);
  //   return a
  // }

  aksOptions = async (questions = []) => {
    const a = await inquirer.prompt(
      questions
      // [
      // {
      //   name: 'environment',
      //   type: 'list',
      //   choices: this.#branches,
      //   message: 'Select your branch to deploy',
      // }
      // ]
    )
    // console.log(a);
    return a
  }

  async #verifyNodeVersion() {
    if (this.#requireNodeVersion === false) {
      this.#spinner.warn(SPINNER_TEXT.warnVerifyNodeV)
      await sleep(1000)
      return true
    }

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



class TestSuite {
  #suite = []

  expect(value) {
    return this
  }

  expectToBe(value, expected) {
    const result = value === expected
    this.#suite.push(result)

    return result
  }

  results() {
    console.log('\n')
    console.table(this.#suite);
    return this.#suite.every((e) => e === true)
  }
}

// const g = new TestSuite()

// async function logJSONData() {
//   const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
//   const jsonData = await response.json();

//   g.expectToBe(jsonData.id, 1)

//   return true
// }

