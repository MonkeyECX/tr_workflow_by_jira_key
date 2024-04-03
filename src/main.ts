import * as core from '@actions/core';
import { commits } from './commits';
import { dispatch } from './dispatch';
import { branch } from './branch';
import {Inputs} from './interfaces';
import {showInputs, getInputs} from './get-inputs';

const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g ;

export async function run(): Promise<void> {
  try {
    core.info('[INFO] Usage https://github.com/MonkeyECX/jira_builds#readme');

    const inps: Inputs = getInputs();
    core.startGroup('Dump inputs');
    showInputs(inps);
    core.endGroup();

    const repositoriesAll = await commits(inps.GithubToken, inps.CommitMessage, inps.ActualRepository);

    if (!repositoriesAll) {
      core.warning('No repos found');
      return;
    }

    const repositories = repositoriesAll.filter(repo => repo !== inps.ActualRepository);

    if (repositories.length === 0) {
      core.warning(`No others projects found for ${inps.CommitMessage} key`);
      return;
    }

    for (const repo of repositories) {
      const orgRepo = repo.split('/');
      const orgName = orgRepo[0];
      const repoName = orgRepo[1];

      const default_branch = await branch(inps.GithubToken, orgName, repoName);
      if (inps.TriggerWorkflow) 
        await dispatch(inps.GithubToken, orgName, repoName, inps.WorkflowID, default_branch, {});
    };
    if(inps.TriggerWorkflow) {
      core.info(`Deployment of projects ${repositories.join(', ')} was triggered successfully!`);
      core.setOutput('jira_build_output', `Deployment of projects ${repositories.join(', ')} was triggered successfully!`);
    } else {
      core.info(`The projects ${repositories.join(', ')} are required to implement the ticket!`);
      core.setOutput('jira_build_output', `The projects ${repositories.join(', ')} are required to implement the ticket!`);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('unexpected error');
    }
  }

}