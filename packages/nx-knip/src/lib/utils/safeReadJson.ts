import { readJsonFile } from '@nx/devkit';

export function safeReadJsonFile<T extends object = any>(
  path: Parameters<typeof readJsonFile>[0],
  options?: Parameters<typeof readJsonFile>[1]
): T | undefined {
  try {
    return readJsonFile<T>(path, options);
  } catch {
    return undefined;
  }
}
