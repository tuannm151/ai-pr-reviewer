/* eslint-disable eslint-comments/no-use */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// @ts-nocheck

import gitlabENV from 'gitlab-ci-env'

export const octokit = {
  repos: {
    async compareCommits(...args) {
      console.log('repos compareCommits', args)
      return {}
    },
    async getContent(...args) {
      console.log('repos getContent', args)
      return {}
    }
  },
  pulls: {
    get(...args) {
      console.log('pulls get')
      return {}
    },
    update(...args) {
      console.log('pulls update')
      return {}
    },
    updateReviewComment(...args) {
      console.log('pulls updateReviewComment')
      return {}
    },
    createReviewComment(...args) {
      console.log('pulls createReviewComment')
      return {}
    },
    createReplyForReviewComment(...args) {
      console.log('pulls createReplyForReviewComment')
      return {}
    },
    listReviewComments(...args) {
      console.log('pulls listReviewComments')
      return {}
    },
    listCommits(...args) {
      console.log('pulls listCommits')
      return {}
    }
  },
  issues: {
    createComment(...args) {
      console.log('issues createComment')
      return {}
    },
    updateComment(...args) {
      console.log('issues updateComment')
      return {}
    },
    listComments({owner, repo, issue_number, page, per_page}) {
      console.log('issues listComments')
      return {}
    }
  }
}

export const context = {
  eventName: process.env.GITHUB_EVENT_NAME,
  repo: {
    owner: gitlabENV.ci.project.path.match(/^(.+)\/([^/]+)$/)[1],
    repo: gitlabENV.ci.project.name
  },
  // payload from process.env.GITHUB_EVENT_PATH
  payload: {
    repository: {
      full_name: gitlabENV.ci.project.path,
      name: gitlabENV.ci.project.name,
      owner: {
        login: gitlabENV.ci.project.rootNamespace // TODO: it's may be wrong for name
      }
    },
    pull_request: {
      title: gitlabENV.ci.commit.title,
      number: gitlabENV.ci.mergeRequest.iid,
      // can't get from gitlab env, if null, will skip get `getDescription` and `getReleaseNotes`
      // TODO: maybe can add a pre task to set this environment variable
      body: null,
      base: {
        sha: gitlabENV.ci.mergeRequest.diff.baseSha
      },
      head: {
        sha: gitlabENV.ci.commit.sha
      }
    },
    issue: {
      number: 0 // maybe it's the issue count number
    },
    comment: '', // for review comment
    action: 'created' // hardcode
  }
}
