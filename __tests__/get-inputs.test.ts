const getInput = jest.fn();
const info = jest.fn();

jest.mock('@actions/core', () => ({
  getInput,
  info
}));

import {getInputs, showInputs} from '../src/get-inputs';

describe('getInputs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        github_token: 'token',
        commit_sha: 'abc123',
        workflow_id: 'deploy.yml',
        actual_repository: 'MonkeyECX/service',
        trigger_workflow: 'TRUE'
      };

      return inputs[name] || '';
    });
  });

  it('maps GitHub action inputs to the internal inputs object', () => {
    expect(getInputs()).toStrictEqual({
      GithubToken: 'token',
      CommitSHA: 'abc123',
      WorkflowID: 'deploy.yml',
      ActualRepository: 'MonkeyECX/service',
      TriggerWorkflow: true
    });
  });

  it('parses trigger_workflow as false by default', () => {
    getInput.mockImplementation((name: string) =>
      name === 'trigger_workflow' ? '' : 'value'
    );

    expect(getInputs().TriggerWorkflow).toBe(false);
  });

  it('rejects conflicting jekyll options', () => {
    getInput.mockImplementation((name: string) =>
      ['enable_jekyll', 'disable_nojekyll'].includes(name) ? 'true' : ''
    );

    expect(() => getInputs()).toThrow('Use either of enable_jekyll or disable_nojekyll');
  });
});

describe('showInputs', () => {
  it('logs all non-secret inputs', () => {
    showInputs({
      GithubToken: 'secret',
      CommitSHA: 'abc123',
      WorkflowID: 'deploy.yml',
      ActualRepository: 'MonkeyECX/service',
      TriggerWorkflow: false
    });

    expect(info).toHaveBeenCalledWith(expect.stringContaining('CommitSHA: abc123'));
    expect(info).toHaveBeenCalledWith(
      expect.not.stringContaining('secret')
    );
  });
});
