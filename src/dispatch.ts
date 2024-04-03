import { Octokit } from "octokit";

export async function dispatch (
  token: string,
  owner: string,
  repo: string,
  workflow_id: string,
  ref: string,
  inputs: {}
) {
  const octokit = new Octokit({ auth: token });
  return await octokit.request('POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches', {
    owner: owner,
    repo: repo,
    workflow_id: workflow_id,
    ref: ref,
    inputs: inputs,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
}