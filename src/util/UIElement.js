import { uuid } from "./functions/func";
import EventMachine, { splitMethodByKeyword } from "./EventMachine";

const REG_STORE_MULTI_PATTERN = /^ME@/;

const MULTI_PREFIX = "ME@";
const SPLITTER = "|";

export const PIPE = (...args) => {
  return args.join(SPLITTER);
};

export const EVENT = (...args) => {
  return MULTI_PREFIX + PIPE(...args);
};

class UIElement extends EventMachine {
  constructor(opt, props = {}) {
    super(opt);

    this.initializeProperty(opt, props)

    this.created();

    this.initialize();

    this.initializeStoreEvent();

  }

  /**
   * UIElement instance 에 필요한 기본 속성 설정 
   */
  initializeProperty (opt, props = {}) {

    this.opt = opt || {};
    this.parent = this.opt;
    this.props = props;
    this.source = uuid();
    this.sourceName = this.constructor.name;

    if (opt && opt.$store) this.$store = opt.$store;
    if (opt && opt.$app) this.$app = opt.$app;
  }

  created() {}

  getRealEventName(e, s = MULTI_PREFIX) {
    var startIndex = e.indexOf(s);
    return e.substr(startIndex < 0 ? 0 : startIndex + s.length);
  }

  initializeStoreEvent() {
    this.storeEvents = {};

    this.filterProps(REG_STORE_MULTI_PATTERN).forEach(key => {
      const events = this.getRealEventName(key, MULTI_PREFIX);

      // support deboounce for store event 
      var [debounceMethods, params] = splitMethodByKeyword(events.split(SPLITTER), 'debounce');

      var debounceSecond = 0 
      if (debounceMethods.length) {
        debounceSecond = +params[0].target || 0 
      }

      events
        .split(SPLITTER)
        .filter(it => debounceMethods.includes(it) === false)
        .map(it => it.trim())
        .forEach(e => {
          var callback = this[key].bind(this);
          callback.source = this.source;
          this.storeEvents[e] = callback;
          this.$store.on(e, this.storeEvents[e], this, debounceSecond);
      });
    });
  }

  destoryStoreEvent() {
    this.$store.offAll(this);
    this.storeEvents = {} 
  }

  destroy () {
    super.destroy()
    this.destoryStoreEvent();
  }

  emit(...args) {
    this.$store.source = this.source;
    this.$store.emit(...args);
  }

  trigger(...args) {
    this.$store.source = this.source;
    this.$store.trigger(...args);
  }

  on (message, callback) {
    this.$store.on(message, callback);
  }

  off (message, callback) {
    this.$store.off(message, callback);
  }
}

export default UIElement;
