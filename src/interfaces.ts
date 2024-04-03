export interface Inputs {
  readonly GithubToken: string;
  readonly CommitMessage: string;
  readonly WorkflowID: string;
  readonly ActualRepository: string;
}

export interface CmdResult {
  exitcode: number;
  output: string;
}