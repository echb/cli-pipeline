export type PipelineParam = {
  nodeVersion: number,
  requireNodeVersion: boolean,
  initialQuestions: Array<Question>,
}

type Question = {
  name: 'environment',
  type: 'list',
  choices: ['serve', 'deploy'],
  message: 'Select your branch to deploy',
}



export interface Pingable {
  ping(): void;
}
