import { Octokit } from "octokit";

export async function commits(
  token: string,
  searchStr: string,
  org: string,
) {
  const issueIdRegEx = /([a-zA-Z0-9]+-[0-9]+)/g

  const octokit = new Octokit({ auth: token});

  const match = searchStr.match(issueIdRegEx);
  const commits = [];

  if (!match) {
    console.log(`String does not contain issueKeys`);

    return
  }
  let page = 1;
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

  if (commits.length === 0) {
    console.log(`No commits found for ${match}`);
    return;
  }

  let issueKeys = [];

  for (const commit of commits) {
    issueKeys.push(commit.repository.full_name);
  }
  
  const removeDups = (arr: string[]): string[] => {
    return [...new Set(arr)];
  }

  return removeDups(issueKeys);

}