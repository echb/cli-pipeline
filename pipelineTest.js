import { Pipeline, sleep } from "./index.js";

const pipeline = new Pipeline({
  nodeVersion: 18,
  requireNodeVersion: true,
  initialQuestions: [
    {
      name: 'environment',
      type: 'list',
      choices: ['serve', 'deploy'],
      message: 'Select your branch to deploy',
    },
  ],
});

pipeline.init(async (e, initialResponse) => {


  // pipeline.runScrip('yarn run g')
  // console.log(questions);
  // const is = await logJSONData()

  // if (is === false) {
  //   // pipeline.message('')
  //   pipeline.fail('validation failed')
  // }

  // pipeline.runScrip('node -v')

  // --------------
  // console.log(response.environment);
  if (initialResponse.environment === 'serve') {
    await pipeline.cliUpdate('Running tests')
    const is = await logJSONData()

    if (is === false) {
      pipeline.fail('validation failed')
    }

    await pipeline.done()
    return
  }

  if (initialResponse.environment === 'deploy') {
    pipeline.cliStop('stop')
    const a = await pipeline.aksOptions([
      {
        name: 'environment',
        type: 'list',
        choices: ['master', 'dev'],
        message: 'Select your branch to deploy',
      },
    ])
    pipeline.cliRestart('loading')

    try {
      await pipeline.verifyBranch(a.environment)
    } catch (error) {
      pipeline.fail('wrong branch')
    }

    pipeline.done()
  }
})


// console.table([
//   {
//     a: 1,
//     name: 'das',
//     valid: true
//   }
// ])

async function logJSONData() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
  const jsonData = await response.json();
  // console.log(jsonData);
  return true
}
