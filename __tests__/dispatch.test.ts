const request = jest.fn();

jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({request}))
}));

import {dispatch} from '../src/dispatch';

describe('dispatch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('dispatches a workflow with the provided ref and inputs', async () => {
    const response = {status: 204};
    request.mockResolvedValue(response);

    await expect(
      dispatch('token', 'MonkeyECX', 'service', 'deploy.yml', 'main', {
        foo: 'bar'
      })
    ).resolves.toBe(response);

    expect(request).toHaveBeenCalledWith(
      'POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches',
      {
        owner: 'MonkeyECX',
        repo: 'service',
        workflow_id: 'deploy.yml',
        ref: 'main',
        inputs: {
          foo: 'bar'
        },
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    );
  });

  it('rethrows request errors with their original message', async () => {
    request.mockRejectedValue(new Error('workflow missing'));

    await expect(
      dispatch('token', 'MonkeyECX', 'service', 'deploy.yml', 'main', {})
    ).rejects.toThrow('workflow missing');
  });
});
