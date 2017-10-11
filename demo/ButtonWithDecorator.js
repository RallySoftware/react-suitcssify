'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SuitCssify from '../index';
import classNames from 'classnames';

@SuitCssify.decorator
class Button extends Component {
  static propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool,
    kind: PropTypes.oneOf(['primary', 'secondary']),
    onClick: PropTypes.func,
    size: PropTypes.oneOf(['small', 'medium', 'large'])
  };

  render() {
    const { children, disabled, kind, onClick, size } = this.props;

    const buttonProps = {
      className: this.getClassName({
        modifiers: classNames(kind, size),
        states: classNames({ disabled })
      }),
      onClick: onClick && onClick()
    };

    const textProps = {
      className: this.getClassName({ descendantName: 'text' })
    };

    return (
      <button { ...buttonProps }>
        <span { ...textProps }>{ children }</span>
      </button>
    );
  }
}

export default Button;
