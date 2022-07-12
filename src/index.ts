import * as core from '@actions/core'
import * as github from '@actions/github'
import * as artifact from '@superactions/artifact'
import { createCommentOrUpdate } from '@superactions/comment'
import { existsSync } from 'fs'
import { join } from 'path'

const context = github.context
const token = core.getInput('token')
const artifactClient = artifact.create({ ghToken: token })

/**
 * GitHub (Super) Action uploading a given directory as webpage and positing a comment with link back on PR.
 */
async function main(): Promise<void> {
  const _directory = core.getInput('directory')
  const directoryPath = join(process.env['GITHUB_WORKSPACE'] || process.cwd(), _directory)

  if (!existsSync(directoryPath)) {
    throw new Error(`Directory ${directoryPath} doesn't exist!`)
  }

  if (context.eventName === 'pull_request') {
    await artifactClient.uploadDirectory('D1', directoryPath)
    const pageUrl = artifactClient.getPageUrl('D1')

    await createCommentOrUpdate({
      message: `[Branch deployment ready](${pageUrl})`,
      uniqueAppId: 'superactions/deploy-branch-action',
      githubToken: token,
    })
  }
}

main().catch((e: Error) => {
  core.warning(e.stack!)
  core.setFailed(e)
})
