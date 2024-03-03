import { describe } from 'vitest';
import { KnipConfig } from 'knip';
import { mergeKnipConfigs } from './mergeKnipConfigs';

describe('mergeKnipConfigs', () => {
  it('should merge configs', () => {
    const config1: KnipConfig = {
      cypress: {
        entry: ['a'],
      },
    };

    const config2: KnipConfig = {
      playwright: {
        entry: ['b'],
      },
    };

    const config3: KnipConfig = {
      vite: {
        entry: ['c'],
      },
    };

    const result = mergeKnipConfigs(config1, config2, config3);

    expect(result).toEqual({
      cypress: {
        entry: ['a'],
      },
      playwright: {
        entry: ['b'],
      },
      vite: {
        entry: ['c'],
      },
    });
  });

  it('should filter out undefined', () => {
    const config1: KnipConfig = {
      cypress: {
        entry: ['a'],
      },
    };

    const config3: KnipConfig = {
      vite: {
        entry: ['c'],
      },
      playwright: undefined,
    };

    const result = mergeKnipConfigs(config1, undefined, config3, undefined);

    expect(result).toEqual({
      cypress: {
        entry: ['a'],
      },
      vite: {
        entry: ['c'],
      },
    });
  });

  it('should merge arrays', () => {
    const config1: KnipConfig = {
      cypress: {
        entry: ['a'],
      },
    };

    const config3: KnipConfig = {
      cypress: {
        entry: ['b'],
      },
      playwright: undefined,
    };

    const result = mergeKnipConfigs(config1, config3);

    expect(result).toEqual({
      cypress: {
        entry: ['a', 'b'],
      },
    });
  });

  it('should merge arrays without duplicates', () => {
    const config1: KnipConfig = {
      cypress: {
        entry: ['a'],
      },
    };

    const config3: KnipConfig = {
      cypress: {
        entry: ['a'],
      },
    };

    const result = mergeKnipConfigs(config1, config3);

    expect(result).toEqual({
      cypress: {
        entry: ['a'],
      },
    });
  });
});
