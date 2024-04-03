import { Octokit } from "octokit";

export async function branch(
  token: string,
  owner: string,
  repo: string,
) {
  const octokit = new Octokit({ auth: token});

  const repository = await octokit.request('GET /repos/{owner}/{repo}', {
    owner: owner,
    repo: repo,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  return repository.data.default_branch;
}