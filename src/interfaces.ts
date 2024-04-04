export interface Inputs {
  readonly GithubToken: string;
  readonly CommitSHA: string;
  readonly WorkflowID: string;
  readonly ActualRepository: string;
  readonly TriggerWorkflow: boolean;
}

export interface CmdResult {
  exitcode: number;
  output: string;
}