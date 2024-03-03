import { KnipConfig } from 'knip';
import { mergeWith, isArray } from 'lodash';

export function mergeKnipConfigs(
  ...configs: Array<KnipConfig | undefined>
): KnipConfig {
  return mergeWith({}, ...configs, (objValue: unknown, srcValue: unknown) => {
    if (isArray(objValue)) {
      return objValue
        .concat(srcValue)
        .filter((item, idx, arr) => arr.indexOf(item) === idx);
    }
    return;
  });
}
