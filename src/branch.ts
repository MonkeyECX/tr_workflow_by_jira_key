import { Octokit } from "octokit";

export async function branch(
  token: string,
  owner: string,
  repo: string,
) {
  try {
    const octokit = new Octokit({ auth: token});
    const repository = await octokit.request('GET /repos/{owner}/{repo}', {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
        'accept': 'application/vnd.github.v3+json'
      }
    });

    console.log(repository.data);

    return repository.data.default_branch;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('unexpected error');
    }
  }
  
}