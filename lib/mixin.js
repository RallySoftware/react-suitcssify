'use strict';

import PropTypes from 'prop-types';
import { getClassName } from './utility';

const mixin = {
  propTypes: {
    className: PropTypes.string,
    utilities: PropTypes.string
  },

  getClassName: function(config = {}) {
    const options = { ...config };
    if (!options.hasOwnProperty('className')) {
      options.className = this && (config.descendantName ? null : (this.props && this.props.hasOwnProperty('className') && this.props.className)) || null;
    }
    if (!(options.hasOwnProperty('baseComponentName') || options.hasOwnProperty('componentName'))) {
      options.componentName = this && (this.constructor.displayName || this.constructor.name) || 'Undefined';
    }
    if (!options.hasOwnProperty('namespace')) {
      options.namespace = this && this.namespace || null;
    }
    if (!options.hasOwnProperty('utilities')) {
      options.utilities = this && (config.descendantName ? null : (this.props && this.props.hasOwnProperty('utilities') && this.props.utilities)) || null;
    }
    return getClassName(options);
  }
};

export default mixin;
