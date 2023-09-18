const CsvLineStream = require('./lib/csv-line-stream');

module.exports = {
  pipeThrough,
  CsvLineStream
};

/**
 * Pipes input through stream producing Array of parsed fields
 * @param {ReadableStream} from
 * @returns readable stream
 */
function pipeThrough(from, opts) {
  const csvLineStream = new CsvLineStream(opts);
  return from.pipeThrough(csvLineStream);
}

