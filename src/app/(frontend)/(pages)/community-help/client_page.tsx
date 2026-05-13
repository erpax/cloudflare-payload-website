'use client'

import { BackgroundGrid } from '@components/BackgroundGrid/index'
import { Banner } from '@components/Banner/index'
import { DiscordGitCTA } from '@components/DiscordGitCTA/index'
import { Gutter } from '@components/Gutter/index'
import { Heading } from '@components/Heading/index'
import { Cell, Grid } from '@faceless-ui/css-grid'
import { AlgoliaPagination } from '@root/adapters/AlgoliaPagination/index'
import { CommentsIcon } from '@root/graphics/CommentsIcon/index'
import { DiscordIcon } from '@root/graphics/DiscordIcon/index'
import { GithubIcon } from '@root/graphics/GithubIcon/index'
import { ArrowIcon } from '@root/icons/ArrowIcon/index'
import getRelativeDate from '@root/utilities/get-relative-date'
import Link from 'next/link'
import * as React from 'react'

import { AlgoliaProvider, useCommunityHelpSearch } from './AlgoliaProvider/index'
import { ArchiveSearchBar } from './ArchiveSearchBar/index'
import classes from './index.module.scss'

export const CommunityHelp: React.FC = () => {
  const { hits, query } = useCommunityHelpSearch()

  const hasResults = Array.isArray(hits) && hits.length > 0
  const hasQuery = query && query.length > 0

  return (
    <div className={classes.communityHelpWrap}>
      <BackgroundGrid className={classes.bg} />
      <Gutter>
        <div className={['grid', classes.grid].join(' ')}>
          <div className="start-1 cols-12">
            <Heading className={classes.heading} element="h1">
              Community Help
            </Heading>
            <div className={classes.searchBarWrap}>
              <ArchiveSearchBar className={classes.searchBar} />
            </div>
            {hasResults && (
              <ul className={classes.postsWrap}>
                {hits.map((hit, i) => {
                  const payload = (hit as any).payload ?? {}
                  const name = (hit as any).title ?? payload.name ?? ''
                  const author = (hit as any).author ?? payload.author ?? ''
                  const createdAt = (hit as any).createdAt ?? payload.createdAt
                  const platformLabel = hit.platform === 'discord' ? 'Discord' : 'Github'
                  return (
                    <li className={classes.post} key={hit.objectID ?? i}>
                      <Link
                        className={classes.postContent}
                        href={`/community-help/${hit.platform}/${hit.slug}`}
                        prefetch={false}
                        style={{ textDecoration: 'none' }}
                      >
                        <div>
                          <h5 className={classes.title}>{name}</h5>
                          <div className={classes.titleMeta}>
                            <span className={classes.platform}>
                              {platformLabel === 'Discord' && (
                                <DiscordIcon className={classes.icon} />
                              )}
                              {platformLabel === 'Github' && (
                                <GithubIcon className={classes.icon} />
                              )}
                            </span>
                            <span className={classes.author}>{author}</span>
                            <span>—</span>
                            <span className={classes.date}>
                              &nbsp;{getRelativeDate(createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={classes.upvotes}>
                          {(hit as any).upvotes > 0 && (
                            <span>
                              <ArrowIcon rotation={-45} /> {(hit as any).upvotes || ''}
                            </span>
                          )}
                          {(hit as any).messageCount > 0 && (
                            <span>
                              <CommentsIcon /> {(hit as any).messageCount}
                            </span>
                          )}
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
            {!hasResults && hasQuery && (
              <React.Fragment>
                <Banner type="warning">
                  <h5>Sorry, no results were found...</h5>
                  <span>Search tips</span>
                  <ul>
                    <li>Make sure all words are spelled correctly</li>
                    <li>Try more general keywords</li>
                    <li>Try different keywords</li>
                  </ul>
                </Banner>
              </React.Fragment>
            )}
            {hasResults && <AlgoliaPagination className={classes.pagination} />}
          </div>
          <div className={['start-13 cols-4', classes.ctaWrap].join(' ')}>
            <DiscordGitCTA appearance="default" />
          </div>
        </div>
      </Gutter>
    </div>
  )
}

export const CommunityHelpPage = () => {
  return (
    <AlgoliaProvider>
      <CommunityHelp />
    </AlgoliaProvider>
  )
}
