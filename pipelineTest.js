import { Pipeline, sleep } from "./index.js";

const pipeline = new Pipeline({
  nodeVersion: 18,
  requireNodeVersion: true,
  initialQuestions: [
    {
      name: 'question',
      type: 'list',
      choices: ['serve', 'deploy'],
      message: 'Select your option',
    },
  ],
});

pipeline.init(async (initialResponse, e) => {
  pipeline.runScrip('echo 12')
  if (initialResponse.question === 'serve') {
    await pipeline.done()
    return
  }

  if (initialResponse.question === 'deploy') {
    await pipeline.cliUpdate('Running tests')
    await sleep(1000)
    await pipeline.cliStop('stop')

    const response = await pipeline.aksOptions([
      {
        name: 'continue',
        type: 'confirm',
        choices: ['master', 'dev'],
        message: 'Select your branch to deploy',
        default: false
      },
    ])

    if (response.continue === false) {
      await pipeline.done()
    }

    await pipeline.cliRestart('Loading...')
    await sleep(1000)
    await pipeline.cliStop('stop')
    const { environment } = await pipeline.aksOptions([
      {
        name: 'environment',
        type: 'list',
        choices: ['master', 'dev'],
        message: 'Select your branch to deploy',
      },
    ])

    try {
      await pipeline.verifyBranch(environment)
    } catch (error) {
      pipeline.fail('wrong branch')
    }

    await pipeline.cliRestart('Loading...')
    await sleep(1000)
    await pipeline.done()
  }
})
