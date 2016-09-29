'use strict';

import React, { PropTypes } from 'react';
import { getClassName, getBaseComponentName } from './utility';

export default function(namespace) {
  return function(Component) {
    const componentName = Component.displayName || Component.name || 'Component';
    const baseComponentName = getBaseComponentName(componentName, namespace);
    const higherOrderGetClassName = (options) => {
      const finalOptions = { ...options };
      const hasComponentNameProp = options && options.hasOwnProperty('componentName');
      const hasNamespaceProp = options && options.hasOwnProperty('namespace');

      if (hasNamespaceProp || hasComponentNameProp) {
        finalOptions.componentName = hasComponentNameProp ? options.componentName : componentName;
        finalOptions.namespace = hasNamespaceProp ? options.namespace : namespace;
      } else {
        finalOptions.baseComponentName = baseComponentName;
      }
      return getClassName(finalOptions);
    };

    return class SuitCssifyHigherOrder extends React.Component {
      static displayName = `SuitCssify(${componentName})`;
      static propTypes = {
        className: PropTypes.string,
        utilities: PropTypes.string
      };

      render() {
        let finalGetClassName = higherOrderGetClassName;
        const { className, utilities } = this.props;
        if (className || utilities) {
          const propsOptions = {};
          if (className) {
            propsOptions.className = className;
          }
          if (utilities) {
            propsOptions.utilities = utilities;
          }
          finalGetClassName = (options) => {
            const finalOptions = { ...options };
            // Use className & utilities on props unless descendantName is supplied
            if (!options.hasOwnProperty('descendantName')) {
              Object.assign(finalOptions, propsOptions);
            }
            return higherOrderGetClassName(finalOptions);
          };
        }
        return <Component { ...this.props } getClassName={ finalGetClassName } />;
      }
    };
  };
}
