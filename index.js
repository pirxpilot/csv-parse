import { CsvLineStream } from './lib/csv-line-stream.js';

export { CsvLineStream };

/**
 * Pipes input through stream producing Array of parsed fields
 * @param {ReadableStream} from
 * @returns readable stream
 */
export function pipeThrough(from, opts) {
  const csvLineStream = new CsvLineStream(opts);
  return from.pipeThrough(csvLineStream);
}
