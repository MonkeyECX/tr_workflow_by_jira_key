const mockRequest = jest.fn();

jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({request: mockRequest}))
}));

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  warning: jest.fn()
}));

import * as core from '@actions/core';
import {
  commits,
  extractIssueKeys,
  getCommits,
  getIssuesAndPullRequests
} from '../src/commits';

describe('commits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns unique repositories found in commits and pull requests', async () => {
    mockRequest
      .mockResolvedValueOnce({
        data: [
          {
            commit: {
              message: 'Implement TR-7359'
            }
          }
        ]
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              repository: {
                full_name: 'MonkeyECX/api'
              }
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          items: []
        }
      })
      .mockResolvedValueOnce({
        data: {
          items: [
            {
              repository_url: 'https://api.github.com/repos/MonkeyECX/api'
            },
            {
              repository_url: 'https://api.github.com/repos/MonkeyECX/front'
            }
          ]
        }
      })
      .mockResolvedValueOnce({
        data: {
          items: []
        }
      });

    await expect(
      commits('token', 'sha', 'MonkeyECX/current')
    ).resolves.toStrictEqual(['MonkeyECX/api', 'MonkeyECX/front']);
  });

  it('does not search repositories when the commit message has no Jira key', async () => {
    mockRequest.mockResolvedValueOnce({
      data: [
        {
          commit: {
            message: 'Refactor 16-17 flat parameters'
          }
        }
      ]
    });

    await expect(
      commits('token', 'sha', 'MonkeyECX/current')
    ).resolves.toBeUndefined();

    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(core.warning).toHaveBeenCalledWith('String does not contain issueKeys');
  });
});

describe('extractIssueKeys', () => {
  it('extracts Jira keys that start with letters', () => {
    expect(
      extractIssueKeys('Fix TR-7359 and follow up on FM-4896')
    ).toStrictEqual(['TR-7359', 'FM-4896']);
  });

  it('does not treat numeric ranges as Jira keys', () => {
    expect(
      extractIssueKeys(
        'Step1Origin and Step2Parameters took 16-17 flat parameters each'
      )
    ).toBeUndefined();
  });
});

describe('getCommits', () => {
  it('does not request search results beyond GitHub first 1000 results limit', async () => {
    const request = jest.fn().mockResolvedValue({
      data: {
        items: Array.from({length: 100}, (_, index) => ({
          sha: `commit-${index}`
        }))
      }
    });

    await getCommits({request} as never, 'PROJ-123', 'MonkeyECX/current-repo');

    expect(request).toHaveBeenCalledTimes(10);
    expect(request).toHaveBeenLastCalledWith('GET /search/commits', {
      q: 'PROJ-123 org:MonkeyECX',
      per_page: 100,
      page: 10
    });
  });
});

describe('getIssuesAndPullRequests', () => {
  it('does not request search results beyond GitHub first 1000 results limit', async () => {
    const request = jest.fn().mockResolvedValue({
      data: {
        items: Array.from({length: 100}, (_, index) => ({
          id: index
        }))
      }
    });

    await getIssuesAndPullRequests(
      {request} as never,
      'PROJ-123',
      'MonkeyECX/current-repo'
    );

    expect(request).toHaveBeenCalledTimes(10);
    expect(request).toHaveBeenLastCalledWith('GET /search/issues', {
      q: 'PROJ-123 org:MonkeyECX',
      per_page: 100,
      page: 10
    });
  });
});
