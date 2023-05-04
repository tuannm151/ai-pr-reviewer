/* eslint-disable eslint-comments/no-use */
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */

import gitlabENV from 'gitlab-ci-env'
import {Gitlab, Types} from '@gitbeaker/node'

interface IOverrideNotePosition extends Types.DiscussionNotePosition {
  line_range: {
    start: {
      line_code: string
      type: string
      old_line: null | number
      new_line: number
    }
    end: {
      line_code: string
      type: string
      old_line: null | number
      new_line: number
    }
  }
}

const api = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_PERSONAL_TOKEN
})

interface IBaseParams {
  owner: string
  repo: string
}

interface IPageParams extends IBaseParams {
  page: number
  per_page: number
}

interface ICompare {
  base: string
  head: string
}

interface IContent {
  path: string
  ref: string
}

interface IContent {
  path: string
  ref: string
}

interface IUpdateComment extends IBaseParams {
  comment_id: number
  body: string
}

interface ICreateReviewComment extends IBaseParams {
  pull_number: number
  commit_id: string
  body: string
  path: string
  line: number
  start_side?: 'LEFT' | 'RIGHT'
  start_line?: number
}

export const octokit = {
  repos: {
    async compareCommits({base, head}: ICompare & IBaseParams) {
      const res = await api.Repositories.compare(
        gitlabENV.ci.project.id,
        base,
        head
      )
      return {
        data: {
          files: res.diffs?.map(e => ({
            ...e,
            filename: e.new_path,
            patch: e.diff
          })),
          commits: res.commits?.map(e => ({
            ...e,
            sha: e.id
          }))
        }
      }
    },
    async getContent({path, ref}: IBaseParams & IContent) {
      const res = await api.RepositoryFiles.show(
        gitlabENV.ci.project.id,
        path,
        ref
      )
      return {
        data: {...res, type: 'file'}
      }
    }
  },
  pulls: {
    async get({pull_number}: IBaseParams & {pull_number: number}) {
      const res = await api.MergeRequests.show(
        gitlabENV.ci.project.id,
        pull_number
      )
      return {
        data: {
          ...res,
          body: res.description
        }
      }
    },
    async update({
      pull_number,
      body
    }: IBaseParams & {pull_number: number; body: string}) {
      const res = await api.MergeRequests.edit(
        gitlabENV.ci.project.id,
        pull_number,
        {description: body}
      )
      return {
        data: res
      }
    },
    async updateReviewComment({comment_id, body}: IUpdateComment) {
      const res = await api.MergeRequestNotes.edit(
        gitlabENV.ci.project.id,
        gitlabENV.ci.mergeRequest.iid,
        comment_id,
        body
      )
      return {
        data: res
      }
    },
    async createReviewComment({
      pull_number,
      commit_id,
      body,
      path,
      line,
      start_side,
      start_line
    }: ICreateReviewComment) {
      const res = await api.MergeRequestDiscussions.create(
        gitlabENV.ci.project.id,
        pull_number,
        body,
        {
          commit_id,
          position: {
            base_sha: context.payload.pull_request.base.sha,
            start_sha: context.payload.pull_request.base.sha,
            head_sha: context.payload.pull_request.head.sha,
            position_type: 'text',
            new_path: path,
            old_path: path, // TODO: need to get old_path
            new_line: line
          }
        }
      )
      return {data: res}
    },
    async createReplyForReviewComment(...args: any[]) {
      console.log('pulls createReplyForReviewComment')
      return {}
    },
    async listReviewComments({
      pull_number,
      page,
      per_page
    }: IPageParams & {pull_number: number}) {
      const res = await api.MergeRequestDiscussions.all(
        gitlabENV.ci.project.id,
        pull_number,
        {page, perPage: per_page}
      )
      const data: any[] = []
      res
        .filter(e => e.individual_note === false) // TODO: explain it
        .forEach(e => {
          e.notes?.forEach((note, index, arr) => {
            data.push({
              ...note,
              path: note.position?.new_path,
              start_line:
                (note.position as IOverrideNotePosition)?.line_range?.start
                  .new_line || note.position?.new_line,
              line:
                (note.position as IOverrideNotePosition)?.line_range?.end
                  .new_line || note.position?.new_line,
              in_reply_to_id: index === 0 ? null : arr[0].id,
              user: {...note.author, login: note.author.name}
            })
          })
        })

      return {
        data
      }
    },
    async listCommits({page}: IPageParams & {issue_number: number}) {
      const res = await api.MergeRequests.commits(
        gitlabENV.ci.project.id,
        parseInt(gitlabENV.ci.mergeRequest.iid)
      )
      if (page > 1) return {data: []}
      return {data: res.map(e => ({...e, sha: e.id}))}
    }
  },
  issues: {
    async createComment({
      issue_number,
      body
    }: IBaseParams & {issue_number: number; body: string}) {
      const res = await api.MergeRequestNotes.create(
        gitlabENV.ci.project.id,
        issue_number,
        body
      )
      return {
        data: res
      }
    },
    async updateComment({comment_id, body}: IUpdateComment) {
      const res = await api.MergeRequestNotes.edit(
        gitlabENV.ci.project.id,
        gitlabENV.ci.mergeRequest.iid,
        comment_id,
        body
      )
      return {
        data: res
      }
    },
    async listComments({page, per_page}: IPageParams & {issue_number: number}) {
      const res = await api.MergeRequestNotes.all(
        gitlabENV.ci.project.id,
        gitlabENV.ci.mergeRequest.iid,
        {
          page,
          perPage: per_page
        }
      )
      return {data: res.filter(e => !e?.system)}
    }
  }
}

export const context = {
  eventName: process.env.GITHUB_EVENT_NAME,
  repo: {
    // @ts-ignore
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
    issue: null,
    // {
    //   number: null // maybe it's the issue count number
    // },
    comment: '', // for review comment
    action: 'created' // hardcode
  }
}
