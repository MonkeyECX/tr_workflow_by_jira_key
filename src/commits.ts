import { Octokit } from "octokit";
import * as core from '@actions/core';

async function getCommitTitle(octokit: Octokit, owner: string, repo: string, sha: string) {
  try{
    const commit = await octokit.request("GET /repos/{owner}/{repo}/commits?sha={sha}", {
      owner: owner,
      repo: repo,
      sha: sha,
      per_page: 1
    });
    if (commit.data.length === 0) {
      core.info(`No commits found for ${sha}`);
      return;
    }
    return commit.data[0].commit.message;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('unexpected error');
    }
  }
} 

async function getCommits(octokit: Octokit, match: string, org: string) {
  try {
    let page = 1;
    const commits = [];
    while (true) {
      const results = await octokit.request("GET /search/commits", {
        q: `${match} org:${org.split('/')[0]}`,
        per_page: 100,
        page: page
      });
      if (results.data.items.length === 0) break;
      commits.push(...results.data.items);
      page++;
    }
    return commits;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('unexpected error');
    }
  }
}

async function getIssuesAndPullRequests(octokit: Octokit, match: string, org: string) {
  try {
    let page = 1;
    const issuesAndPullRequests = [];
    while (true) {
      const results = await octokit.request("GET /search/issues", {
        q: `${match} org:${org.split('/')[0]}`,
        per_page: 100,
        page: page
      });
      if (results.data.items.length === 0) break;
      issuesAndPullRequests.push(...results.data.items);
      page++;
    }
    return issuesAndPullRequests;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('unexpected error');
    }
  }
}


export async function commits(
  token: string,
  sha: string,
  org: string,
) {
  try {
    const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g

    const octokit = new Octokit({ auth: token});

    const orgRepo = org.split('/');
    const orgName = orgRepo[0];
    const repoName = orgRepo[1];

    const commitDetails = await getCommitTitle(octokit, orgName, repoName, sha);

    const match = commitDetails.match(issueIdRegEx);

    if (!match) {
      core.warning(`String does not contain issueKeys`);
      return;
    }
    
    const commits = await getCommits(octokit, match, org);

    const issuesAndPullRequests = await getIssuesAndPullRequests(octokit, match, org);

    if (commits.length === 0 && issuesAndPullRequests.length === 0) {
      core.warning(`No repository found for ${match}`);
      return;
    }

    let issueKeys = [];

    for (const commit of commits) {
      issueKeys.push(commit.repository.full_name);
    }

    for (const issue of issuesAndPullRequests) {
      issueKeys.push(issue.repository_url.replace('https://api.github.com/repos/', ''));
    }
    
    const removeDups = (arr: string[]): string[] => {
      return [...new Set(arr)];
    }

    return removeDups(issueKeys);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('unexpected error');
    }
  }

}