import { KnipConfig } from 'knip';
import { createProjectGraphAsync, ProjectGraphProjectNode } from '@nx/devkit';
import { mergeKnipConfigs } from './utils/mergeKnipConfigs';
import { log } from './utils/log';

const DEBUG = process.env['DEBUG'] === 'true' || process.env['DEBUG'] === '1';

/** @public */
export type KnipConfigPluginOptions = {
  projects: ProjectGraphProjectNode[];
};

/** @public */
export type KnipPluginOutput = KnipConfig | undefined;

/** @public */
export type KnipConfigPlugin = (
  args: KnipConfigPluginOptions
) => KnipPluginOutput;

export function mergeKnipPlugins(
  ...plugins: KnipConfigPlugin[]
): KnipConfigPlugin {
  return (args) => {
    const pluginOutputs: Array<KnipConfig | Array<KnipConfig>> = [];
    for (const plugin of plugins) {
      const output = plugin(args);
      if (output) {
        pluginOutputs.push(output);
      }
    }
    return mergeKnipConfigs(...pluginOutputs.flat());
  };
}

/** @public */
export async function combineNxKnipPlugins(
  ...plugins: KnipConfigPlugin[]
): Promise<KnipConfig> {
  const graph = await createProjectGraphAsync();
  const pluginOption: KnipConfigPluginOptions = {
    projects: Object.values(graph.nodes),
  };
  const pluginOutputs: Array<KnipConfig | Array<KnipConfig>> = [];
  for (const plugin of plugins) {
    const output = plugin(pluginOption);
    if (output) {
      pluginOutputs.push(output);
    }
  }

  const finalConfig = mergeKnipConfigs(...pluginOutputs.flat());

  if (DEBUG) {
    console.log('---------');
    log(finalConfig);
    console.log('---------');
  }

  return finalConfig;
}
