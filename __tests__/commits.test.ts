import {
  extractIssueKeys,
  getCommits,
  getIssuesAndPullRequests
} from '../src/commits';

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
