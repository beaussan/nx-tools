import {
  combineNxKnipPlugins,
  KnipConfigPlugin,
  withCypress,
  withEsbuildApps,
  withNextJs,
  withNxStandards,
  withNxTsPaths,
  withVitest,
} from './packages/nx-knip/src/index';

const withCustomIgnores = (): KnipConfigPlugin => () => ({
  entry: ['**/src/test-setup.ts'],
  ignoreDependencies: [
    '@nx/node',
    '@nx/workspace',
    '@nx/rollup',
    '@nx/web',
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript',
    '@rollup/plugin-url',
    '@svgr/rollup',
    '@svgr/webpack',
    '@swc/cli',
    '@swc/jest',
    '@types/jest',
    '@vitest/coverage-c8',
    'babel-loader',
    'jest-environment-node',
  ],
  ignore: [
    'apps/courso/frontend/src/generated/graphql.ts',
    'libs/dash/feature/bookmark-list/src/lib/requests.generated.ts',
    'libs/dash/data/hasura-codegen-types/src/lib/graphqlTypes.ts',
    'libs/dash/data/backend-admin-sdk/src/lib/queryCollecion.generated.ts',
    'libs/shared/utils/next-auth/hasura-adaptor/src/lib/generated/graphql.ts',
    'libs/dash/data/user/src/lib/requests.generated.ts',
    'apps/courso/cli-devtool/src/generated/graphql.ts',
    'apps/courso/frontend/lib/generated/GiteaApi.ts',
    'apps/courso/frontend/lib/generated/graphql.ts',
    '.eslintrc.json',
  ],
});

export default combineNxKnipPlugins(
  withNxTsPaths(),
  withNxStandards(),
  withEsbuildApps(),
  withVitest()
);
