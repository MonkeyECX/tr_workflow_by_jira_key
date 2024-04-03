
import * as core from '@actions/core';
import {Inputs} from './interfaces';

export function showInputs(inps: Inputs): void {

  core.info(`\
[INFO] WorkflowID: ${inps.WorkflowID}
[INFO] CommitMessage: ${inps.CommitMessage}
[INFO] ActualRepository: ${inps.ActualRepository}
`);
}

export function getInputs(): Inputs {
  let useBuiltinJekyll = false;

  const isBoolean = (param: string): boolean => (param || 'false').toUpperCase() === 'TRUE';

  const enableJekyll: boolean = isBoolean(core.getInput('enable_jekyll'));
  const disableNoJekyll: boolean = isBoolean(core.getInput('disable_nojekyll'));

  if (enableJekyll && disableNoJekyll) {
    throw new Error(`Use either of enable_jekyll or disable_nojekyll`);
  } else if (enableJekyll) {
    useBuiltinJekyll = true;
  } else if (disableNoJekyll) {
    useBuiltinJekyll = true;
  }

  const inps: Inputs = {
    GithubToken: core.getInput('github_token'),
    CommitMessage: core.getInput('commit_message'),
    WorkflowID: core.getInput('workflow_id'),
    ActualRepository: core.getInput('actual_repository')
  };

  return inps;
}