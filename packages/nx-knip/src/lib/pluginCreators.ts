import { ProjectGraphProjectNode, TargetConfiguration } from '@nx/devkit';
import { mergeKnipConfigs } from './utils/mergeKnipConfigs';
import { KnipConfigPlugin, KnipPluginOutput } from './knipPluginApi';

/** @public */
export type FullLibraryMapperFunction = (args: {
  project: ProjectGraphProjectNode;
  rootFolder: string;
}) => KnipPluginOutput;

export const withLibraryMapper =
  ({
    mapperFn,
    filter = () => true,
  }: {
    mapperFn: FullLibraryMapperFunction;
    filter?: (project: ProjectGraphProjectNode) => boolean;
  }): KnipConfigPlugin =>
  ({ projects }) => {
    return mergeKnipConfigs(
      ...projects
        .filter((project) => filter(project))
        .map((project) => mapperFn({ project, rootFolder: project.data.root }))
        .filter((config) => !!config)
    );
  };

/** @public */
export type ExecutorMapperFunction = (args: {
  executor: string;
  project: ProjectGraphProjectNode;
  targetContent: TargetConfiguration;
  rootFolder: string;
  targetName: string;
}) => KnipPluginOutput;

export const withMapOverExecutorByName =
  ({
    executorName,
    mapperFn,
  }: {
    executorName: string;
    mapperFn: ExecutorMapperFunction;
  }): KnipConfigPlugin =>
  ({ projects }) => {
    return mergeKnipConfigs(
      ...projects
        .map((project) =>
          Object.entries(project.data.targets ?? {})
            .filter(([_, value]) => value.executor === executorName)
            .map(([targetName, _]) => ({ project, targetName }))
        )
        .filter((data) => !!data)
        .flat()
        .map(({ project, targetName }) =>
          mapperFn({
            executor: project.data.targets?.[targetName].executor ?? '',
            project,
            targetContent: project.data.targets?.[targetName] ?? {},
            rootFolder: project.data.root,
            targetName,
          })
        )
        .filter((config) => !!config)
    );
  };

/** @public */
export type RunCommandMapperFunction = (args: {
  command: string;
  project: ProjectGraphProjectNode;
  targetContent: TargetConfiguration;
  rootFolder: string;
  targetName: string;
}) => KnipPluginOutput;
export const withMapOverRunCommands =
  ({
    commandPrefix,
    mapperFn,
  }: {
    commandPrefix: string;
    mapperFn: RunCommandMapperFunction;
  }): KnipConfigPlugin =>
  ({ projects }) => {
    return mergeKnipConfigs(
      ...projects
        .map((project) =>
          Object.entries(project.data.targets ?? {})
            .map(([targetName, _]) => {
              const targetContent = project.data.targets?.[targetName];
              if (!targetContent) {
                return { project, command: '', targetName };
              }
              if (targetContent.command) {
                return { project, command: targetContent.command, targetName };
              }
              if (targetContent.executor !== 'nx:run-commands') {
                return { project, command: '', targetName };
              }
              if (targetContent.options?.command) {
                return {
                  project,
                  command: targetContent.options.command,
                  targetName,
                };
              }
              return { project, command: '', targetName };
            })
            .filter(
              (value) =>
                !!value?.command && value.command.startsWith(commandPrefix)
            )
            .map(({ command, targetName }) => ({
              project,
              command,
              targetName,
            }))
        )
        .filter((data) => !!data)
        .flat()
        .map(({ project, command, targetName }) =>
          mapperFn({
            command: command,
            project,
            targetContent: project.data.targets?.[targetName] ?? {},
            rootFolder: project.data.root,
            targetName,
          })
        )
        .filter((config) => !!config)
    );
  };
