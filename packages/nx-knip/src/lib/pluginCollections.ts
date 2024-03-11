import { KnipConfigPlugin, mergeKnipPlugins } from './knipPluginApi';
import { readJsonFile } from '@nx/devkit';
import * as path from 'node:path';
import { safeReadJsonFile } from './utils/safeReadJson';
import {
  withLibraryMapper,
  withMapOverExecutorByName,
  withMapOverRunCommands,
} from './pluginCreators';

/** @public */
export const withLocalNxPlugins = ({
  pluginNames,
}: {
  pluginNames: string[];
}) =>
  withLibraryMapper({
    filter: (project) => pluginNames.includes(project.name),
    mapperFn: ({ project, rootFolder }) => {
      const sourceRoot = project.data.sourceRoot;
      const entry = [`${sourceRoot}/index.ts`];

      const maybeExecutorsJson = safeReadJsonFile(
        path.join(rootFolder, 'executors.json')
      );
      if (maybeExecutorsJson) {
        entry.push(
          ...Object.values(maybeExecutorsJson?.executors)
            .map((it: any) => it?.implementation)
            .filter((value) => !!value)
            .map((value) => value + '.ts')
            .map((value) => path.resolve(rootFolder, value))
            .map((value) => path.relative(process.cwd(), value))
        );
      }

      const maybeGeneratorsJson = safeReadJsonFile(
        path.join(rootFolder, 'generators.json')
      );
      if (maybeGeneratorsJson) {
        entry.push(
          ...Object.values(maybeGeneratorsJson?.generators)
            .map((it: any) => it?.factory)
            .filter((value) => !!value)
            .map((value) => value + '.ts')
            .map((value) => path.resolve(rootFolder, value))
            .map((value) => path.relative(process.cwd(), value))
        );
      }

      return {
        entry: entry.map((it) => it + '!'),
      };
    },
  });

/** @public */
export const withEsbuildApps = () =>
  withMapOverExecutorByName({
    executorName: '@nx/esbuild:esbuild',
    mapperFn: ({ targetContent, project }) => {
      if (project.type !== 'app') {
        return undefined;
      }
      const main = targetContent.options?.main;
      if (!main) {
        return undefined;
      }
      return {
        entry: [main + '!'],
      };
    },
  });

/** @public */
export const withNextJs = () =>
  withMapOverExecutorByName({
    executorName: '@nx/next:build',
    mapperFn: ({ rootFolder, project }) => {
      if (project.type !== 'app') {
        return undefined;
      }
      return {
        next: {
          entry: [
            `${rootFolder}/next.config.{js,ts,cjs,mjs}!`,
            `${rootFolder}/index.d.ts!`,
            `${rootFolder}/next-env.d.ts!`,
            `${rootFolder}/middleware.{js,ts}!`,
            `${rootFolder}/app/**/route.{js,ts}!`,
            `${rootFolder}/app/**/{error,layout,loading,not-found,page,template}.{js,jsx,ts,tsx}!`,
            `${rootFolder}/instrumentation.{js,ts}!`,
            `${rootFolder}/app/{manifest,sitemap,robots}.{js,ts}!`,
            `${rootFolder}/app/**/{icon,apple-icon}.{js,ts,tsx}!`,
            `${rootFolder}/app/**/{opengraph,twitter}-image.{js,ts,tsx}!`,
            `${rootFolder}/pages/**/*.{js,jsx,ts,tsx}!`,
            `${rootFolder}/src/middleware.{js,ts}!`,
            `${rootFolder}/src/app/**/route.{js,ts}!`,
            `${rootFolder}/src/app/**/{error,layout,loading,not-found,page,template}.{js,jsx,ts,tsx}!`,
            `${rootFolder}/src/instrumentation.{js,ts}!`,
            `${rootFolder}/src/app/{manifest,sitemap,robots}.{js,ts}!`,
            `${rootFolder}/src/app/**/{icon,apple-icon}.{js,ts,tsx}!`,
            `${rootFolder}/src/app/**/{opengraph,twitter}-image.{js,ts,tsx}!`,
            `${rootFolder}/src/pages/**/*.{js,jsx,ts,tsx}!`,
          ],
        },
      };
    },
  });

/** @public */
export const withCypress = () =>
  withMapOverExecutorByName({
    executorName: '@nx/cypress:cypress',
    mapperFn: ({ targetContent, project }) => {
      const config = targetContent.options.cypressConfig;
      return {
        cypress: {
          config: [config],
          entry: [`${project.data.sourceRoot}/**/*.{js,ts,mjs,cjs}`],
        },
      };
    },
  });

/** @public */
export const withNxTsPaths =
  (path = 'tsconfig.base.json'): KnipConfigPlugin =>
  () => {
    const tsConfig = readJsonFile(path);

    return {
      paths: tsConfig.compilerOptions.paths,
    };
  };

/** @public */
const withVitestNxCrystal = () =>
  withMapOverRunCommands({
    commandPrefix: 'vitest ',
    mapperFn: ({ rootFolder }) => {
      return {
        vitest: {
          config: [
            rootFolder + '/vitest*.config.{js,mjs,ts,cjs,mts,cts}',
            rootFolder + '/vite*.config.{js,mjs,ts,cjs,mts,cts}',
            'vitest.workspace.{js,mjs,ts,cjs,mts,cts}',
          ],
          entry: [rootFolder + '/**/*.{test,test-d,spec}.?(c|m)[jt]s?(x)'],
        },
      };
    },
  });

const withVitestNxExecutor = () =>
  withMapOverExecutorByName({
    executorName: '@nx/vite:test',
    mapperFn: ({ rootFolder, targetContent }) => {
      const configs = targetContent?.options?.config
        ? [
            targetContent?.options?.config,
            'vitest.workspace.{js,mjs,ts,cjs,mts,cts}',
          ]
        : [
            rootFolder + '/vitest*.config.{js,mjs,ts,cjs,mts,cts}',
            rootFolder + '/vite*.config.{js,mjs,ts,cjs,mts,cts}',
            'vitest.workspace.{js,mjs,ts,cjs,mts,cts}',
          ];
      return {
        vitest: {
          config: configs,
          entry: [rootFolder + '/**/*.{test,test-d,spec}.?(c|m)[jt]s?(x)'],
        },
      };
    },
  });

export const withVitest = () =>
  mergeKnipPlugins(withVitestNxCrystal(), withVitestNxExecutor());
/** @public */
export const withNxStandards = (): KnipConfigPlugin => () => {
  return {
    project: ['**/*.{ts,js,tsx,jsx}'],
    ignore: ['tmp/**', 'node_modules/**'],
    ignoreDependencies: ['prettier'],
    eslint: {
      config: ['**/.eslintrc.{json,js}', '.eslintrc.{json,js}'],
    },
    vite: {
      config: ['**/vite.config.{ts,js}'],
    },
    vitest: {
      config: ['**/vitest.config.{ts,js}', '**/vite.config.{ts,js}'],
    },
    tailwind: {
      config: ['**/tailwind.config.{js,cjs,mjs,ts}'],
    },
    postcss: {
      config: ['**/postcss.config.js', '**/postcss.config.json'],
    },
    babel: {
      config: [
        '**/babel.config.json',
        '**/babel.config.js',
        '**/.babelrc.json',
        '**/.babelrc.js',
        '**/.babelrc',
      ],
    },
    storybook: {
      config: [
        '**/.storybook/{main,test-runner}.{js,ts}',
        '.storybook/{main,test-runner}.{js,ts}',
      ],
      entry: [
        '**/.storybook/{manager,preview}.{js,jsx,ts,tsx}',
        '**/*.stories.{js,jsx,ts,tsx}',
        '.storybook/{manager,preview}.{js,jsx,ts,tsx}',
      ],
      project: [
        '.storybook/**/*.{js,jsx,ts,tsx}',
        '**/.storybook/**/*.{js,jsx,ts,tsx}',
      ],
    },
  };
};

/** @public */
export const withEslint = () =>
  withMapOverExecutorByName({
    executorName: '@nx/linter:eslint',
    mapperFn: ({ rootFolder, targetContent }) => {
      const entry = targetContent?.options?.eslintConfig
        ? [targetContent.options.eslintConfig]
        : [rootFolder + '/.eslintrc.{json,js}', '.eslintrc.{json,js}'];
      return {
        eslint: {
          config: entry,
        },
      };
    },
  });

/** @public */
export const withEsbuildPublishableLibs = () =>
  withLibraryMapper({
    filter: (project) =>
      project.type === 'lib' &&
      project.data &&
      !!project.data.targets &&
      !!project.data.targets['publish'] &&
      project.data.targets['build'] &&
      project.data.targets['build'].executor === '@nx/esbuild:esbuild',
    mapperFn: ({ project }) => {
      const main = project?.data?.targets?.['build']?.options?.main;
      if (!main) {
        return undefined;
      }
      return {
        entry: [main + '!'],
      };
    },
  });
