import util from 'node:util';

export const log = (value: unknown) =>
  console.log(
    util.inspect(value, { showHidden: false, depth: null, colors: true })
  );
