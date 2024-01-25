'use strict';

module.exports = {
  get DataDomeFetch() {
    return require('./datadome-fetch');
  },
  get DataDome() {
    return require('./datadome').default;
  },
  get DataDomeModal() {
    return require('./datadome-modal').default;
  },
  get DataDomeModule() {
    return require('./datadome-module').default;
  }
};
//# sourceMappingURL=index.js.map