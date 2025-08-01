/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createServerRootRoute } from '@tanstack/react-start/server'

import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { ServerRoute as ApiQueryServerRouteImport } from './routes/api/query'
import { ServerRoute as ApiMutateServerRouteImport } from './routes/api/mutate'
import { ServerRoute as ApiAuthSplatServerRouteImport } from './routes/api/auth/$'

const rootServerRouteImport = createServerRootRoute()

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ApiQueryServerRoute = ApiQueryServerRouteImport.update({
  id: '/api/query',
  path: '/api/query',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiMutateServerRoute = ApiMutateServerRouteImport.update({
  id: '/api/mutate',
  path: '/api/mutate',
  getParentRoute: () => rootServerRouteImport,
} as any)
const ApiAuthSplatServerRoute = ApiAuthSplatServerRouteImport.update({
  id: '/api/auth/$',
  path: '/api/auth/$',
  getParentRoute: () => rootServerRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/'
  fileRoutesByTo: FileRoutesByTo
  to: '/'
  id: '__root__' | '/'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
}
export interface FileServerRoutesByFullPath {
  '/api/mutate': typeof ApiMutateServerRoute
  '/api/query': typeof ApiQueryServerRoute
  '/api/auth/$': typeof ApiAuthSplatServerRoute
}
export interface FileServerRoutesByTo {
  '/api/mutate': typeof ApiMutateServerRoute
  '/api/query': typeof ApiQueryServerRoute
  '/api/auth/$': typeof ApiAuthSplatServerRoute
}
export interface FileServerRoutesById {
  __root__: typeof rootServerRouteImport
  '/api/mutate': typeof ApiMutateServerRoute
  '/api/query': typeof ApiQueryServerRoute
  '/api/auth/$': typeof ApiAuthSplatServerRoute
}
export interface FileServerRouteTypes {
  fileServerRoutesByFullPath: FileServerRoutesByFullPath
  fullPaths: '/api/mutate' | '/api/query' | '/api/auth/$'
  fileServerRoutesByTo: FileServerRoutesByTo
  to: '/api/mutate' | '/api/query' | '/api/auth/$'
  id: '__root__' | '/api/mutate' | '/api/query' | '/api/auth/$'
  fileServerRoutesById: FileServerRoutesById
}
export interface RootServerRouteChildren {
  ApiMutateServerRoute: typeof ApiMutateServerRoute
  ApiQueryServerRoute: typeof ApiQueryServerRoute
  ApiAuthSplatServerRoute: typeof ApiAuthSplatServerRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}
declare module '@tanstack/react-start/server' {
  interface ServerFileRoutesByPath {
    '/api/query': {
      id: '/api/query'
      path: '/api/query'
      fullPath: '/api/query'
      preLoaderRoute: typeof ApiQueryServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/mutate': {
      id: '/api/mutate'
      path: '/api/mutate'
      fullPath: '/api/mutate'
      preLoaderRoute: typeof ApiMutateServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
    '/api/auth/$': {
      id: '/api/auth/$'
      path: '/api/auth/$'
      fullPath: '/api/auth/$'
      preLoaderRoute: typeof ApiAuthSplatServerRouteImport
      parentRoute: typeof rootServerRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
const rootServerRouteChildren: RootServerRouteChildren = {
  ApiMutateServerRoute: ApiMutateServerRoute,
  ApiQueryServerRoute: ApiQueryServerRoute,
  ApiAuthSplatServerRoute: ApiAuthSplatServerRoute,
}
export const serverRouteTree = rootServerRouteImport
  ._addFileChildren(rootServerRouteChildren)
  ._addFileTypes<FileServerRouteTypes>()
