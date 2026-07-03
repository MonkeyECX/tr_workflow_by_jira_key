const request = jest.fn();

jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({request}))
}));

import {branch} from '../src/branch';

describe('branch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the repository default branch', async () => {
    request.mockResolvedValue({
      data: {
        default_branch: 'develop'
      }
    });

    await expect(branch('token', 'MonkeyECX', 'service')).resolves.toBe(
      'develop'
    );

    expect(request).toHaveBeenCalledWith('GET /repos/{owner}/{repo}', {
      owner: 'MonkeyECX',
      repo: 'service',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        accept: 'application/vnd.github.v3+json'
      }
    });
  });

  it('rethrows request errors with their original message', async () => {
    request.mockRejectedValue(new Error('repo not found'));

    await expect(branch('token', 'MonkeyECX', 'missing')).rejects.toThrow(
      'repo not found'
    );
  });
});
