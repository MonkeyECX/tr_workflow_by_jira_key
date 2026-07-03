const info = jest.fn();
const warning = jest.fn();
const setOutput = jest.fn();
const startGroup = jest.fn();
const endGroup = jest.fn();

const commits = jest.fn();
const branch = jest.fn();
const dispatch = jest.fn();
const getInputs = jest.fn();
const showInputs = jest.fn();

jest.mock('@actions/core', () => ({
  info,
  warning,
  setOutput,
  startGroup,
  endGroup
}));

jest.mock('../src/commits', () => ({
  commits
}));

jest.mock('../src/branch', () => ({
  branch
}));

jest.mock('../src/dispatch', () => ({
  dispatch
}));

jest.mock('../src/get-inputs', () => ({
  getInputs,
  showInputs
}));

import {run} from '../src/main';
import {Inputs} from '../src/interfaces';

const baseInputs: Inputs = {
  GithubToken: 'token',
  CommitSHA: 'abc123',
  WorkflowID: 'deploy.yml',
  ActualRepository: 'MonkeyECX/current',
  TriggerWorkflow: false
};

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInputs.mockReturnValue(baseInputs);
    commits.mockResolvedValue(['MonkeyECX/current', 'MonkeyECX/api']);
    branch.mockResolvedValue('main');
    dispatch.mockResolvedValue({status: 204});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('warns when no repositories are found', async () => {
    commits.mockResolvedValue(undefined);

    await run();

    expect(warning).toHaveBeenCalledWith('No repos found');
    expect(setOutput).not.toHaveBeenCalled();
  });

  it('sets a message with linked repositories without triggering workflows', async () => {
    await run();

    expect(branch).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(setOutput).toHaveBeenCalledWith(
      'message',
      'The projects MonkeyECX/api are required to implement the ticket!'
    );
  });

  it('dispatches linked repositories when trigger_workflow is true', async () => {
    getInputs.mockReturnValue({
      ...baseInputs,
      TriggerWorkflow: true
    });

    await run();

    expect(branch).toHaveBeenCalledWith('token', 'MonkeyECX', 'api');
    expect(dispatch).toHaveBeenCalledWith(
      'token',
      'MonkeyECX',
      'api',
      'deploy.yml',
      'main',
      {}
    );
    expect(setOutput).toHaveBeenCalledWith(
      'message',
      'Deployment of projects MonkeyECX/api was triggered successfully!'
    );
  });
});
