class CsvLineStream extends TransformStream {
  constructor(options) {
    super(parser(options));
  }
}

module.exports = CsvLineStream;

const QUOTE = '"';
const FS = ',';
const LS = '\n';
const ESC = '\\';

function parser({ trim = false } = {}) {
  const states = Object.create(null);
  const field = [];
  let line = [];

  states.startField = {
    on(c, controller) {
      switch (c) {
        case FS:
          emitField();
          return states.startField;
        case LS:
          emitLine(controller);
          return states.startField;
        case QUOTE:
          return states.quoting;
        default:
          field.push(c);
          return states.inField;
      }
    },
    flush() {}
  };

  states.inField = {
    on(c, controller) {
      switch (c) {
        case FS:
          emitField();
          return states.startField;
        case LS:
          emitField();
          emitLine(controller);
          return states.startField;
        default:
          field.push(c);
          return states.inField;
      }
    },
    flush(controller) {
      emitField();
      emitLine(controller);
    }
  };

  states.quoting = {
    on(c) {
      switch (c) {
        case QUOTE:
          return states.postQuoting;
        case ESC:
          return states.escaping;
        default:
          field.push(c);
          return states.quoting;
      }
    },
    flush() {}
  };

  states.postQuoting = {
    on(c, controller) {
      switch (c) {
        case FS:
          emitField();
          return states.startField;
        case LS:
          emitField();
          emitLine(controller);
          return states.startField;
        default:
          // ignore anything else, or maybe raise error
          return states.postQuoting;
      }
    },
    flush(controller) {
      emitField();
      emitLine(controller);
    }
  };

  states.escaping = {
    on(c) {
      if (c === QUOTE) {
        field.push(QUOTE);
      } else {
        field.push(ESC, c);
      }
      return states.quoting;
    },
    flush(controller) {
      field.push(ESC);
      states.quoting.flush(controller);
    }
  };

  let state = states.startField;

  return {
    transform,
    flush
  };

  function emitField() {
    let f = field.join('');
    if (trim) {
      f = f.trim();
    }
    line.push(f);
    field.length = 0;
  }

  function emitLine(controller) {
    controller.enqueue(line);
    line = [];
  }

  /**
   * Process next `codePoint` in the stream by feeding the state machine. Emit a new line if it is ready.
   *
   * @param {String} str
   * @param {TransformStreamDefaultController} controller
   */
  function transform(str, controller) {
    for (const cp of str) {
      state = state.on(cp, controller);
    }
  }

  function flush(controller) {
    state.flush(controller);
  }
}
