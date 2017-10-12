'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import ReactTestUtils from 'react-dom/test-utils';
import SuitCssify from '../index';
import createReactClass from 'create-react-class';

const DECORATOR = 'decorator';
const HIGHER_ORDER = 'higher order';
const HIGHER_ORDER_STATELESS = 'higher order stateless';
const MIXIN = 'mixin';
const UTILITY = 'utility';

/* eslint-disable react/no-multi-comp */
const ComponentFactory = {
  build(kind, options={}, descendantOptions = null) {
    let Component;

    switch(kind) {
      case DECORATOR:
        @SuitCssify.decorator
        class Component extends React.Component {
          render() {
            return (
              <div className={ this.getClassName(options) }>
                { descendantOptions && <span ref="descendant" className={ this.getClassName(descendantOptions) }></span> }
              </div>
            );
          }
        }
        break;

      case HIGHER_ORDER:
        class InnerCmp extends React.Component {
          static propTypes = {
            getClassName: PropTypes.func.isRequired
          };

          render() {
            return (
              <div className={ this.props.getClassName(options) }>
                { descendantOptions && <span ref="descendant" className={ this.props.getClassName(descendantOptions) }></span> }
              </div>
            );
          }
        }
        Component = SuitCssify.higherOrder('foo')(InnerCmp);
        break;

      case HIGHER_ORDER_STATELESS:
        const InnerStateless = ({ getClassName }) => (
          <div className={ getClassName(options) }>
            { descendantOptions && <span className={ getClassName(descendantOptions) }></span> }
          </div>
        );
        InnerStateless.displayName = 'InnerStateless';
        Component = SuitCssify.higherOrder('bar')(InnerStateless);
        break;

      case MIXIN:
        Component = createReactClass({
          mixins: [SuitCssify.mixin],
          render() {
            return (
              <div className={ this.getClassName(options) }>
                { descendantOptions && <span ref="descendant" className={ this.getClassName(descendantOptions) }></span> }
              </div>
            );
          }
        });
        break;

      case UTILITY:
        const getClassName = SuitCssify.getClassName;
        Component = createReactClass({
          render() {
            return (
              <div className={ getClassName(options) }>
                { descendantOptions && <span ref="descendant" className={ getClassName(descendantOptions) }></span> }
              </div>
            );
          }
        });
        break;
    }

    return Component;
  }
};
/* eslint-enable react/no-multi-comp, no-shadow, no-unused-vars */

function renderComponent(Component, props={}) {
  const jsx = (
    <Component { ...props } />
  );
  const component = ReactTestUtils.renderIntoDocument(jsx);
  //console.log(ReactDOMServer.renderToStaticMarkup(jsx));
  return component;
}

describe('SuitCssify', () => {
  let Component, component, className, descendantClassName;

  it('includes getClassName method', () => {
    Component = ComponentFactory.build(DECORATOR);
    component = renderComponent(Component);
    expect(component.getClassName).toBeDefined();

    Component = ComponentFactory.build(MIXIN);
    component = renderComponent(Component);
    expect(component.getClassName).toBeDefined();
  });

  it('includes utilities propType', () => {
    Component = ComponentFactory.build(DECORATOR);
    expect(Component.propTypes.utilities).toBeDefined();

    Component = ComponentFactory.build(MIXIN);
    expect(Component.propTypes.utilities).toBeDefined();
  });

  describe('base class name', () => {
    it('includes capitalized component name defaulting to the component displayName', () => {
      Component = ComponentFactory.build(DECORATOR);
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/Component/);

      Component = ComponentFactory.build(HIGHER_ORDER);
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/foo-InnerCmp/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS);
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/bar-InnerStateless/);

      Component = ComponentFactory.build(MIXIN);
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/Component/);
    });

    it('includes capitalized component name and allows it to be customized', () => {
      Component = ComponentFactory.build(DECORATOR, {
        componentName: 'FooBar'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/FooBar/);

      Component = ComponentFactory.build(HIGHER_ORDER, {
        componentName: 'FooBar'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/foo-FooBar/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
        componentName: 'FooBar'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/bar-FooBar/);

      Component = ComponentFactory.build(MIXIN, {
        componentName: 'FooBar'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/FooBar/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'FooBar'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/FooBar/);
    });

    it('includes namespace if provided', () => {
      Component = ComponentFactory.build(DECORATOR, {
        namespace: 'my'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/my-Component/);

      Component = ComponentFactory.build(HIGHER_ORDER, {
        namespace: 'my'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/my-InnerCmp/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
        namespace: 'my'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/my-InnerStateless/);

      Component = ComponentFactory.build(MIXIN, {
        namespace: 'my'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/my-Component/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'Component',
        namespace: 'my'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/my-Component/);
    });

    it('includes camelized descendantName if provided', () => {
      Component = ComponentFactory.build(DECORATOR, {
        descendantName: 'descendant-element'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/Component-descendantElement/);

      Component = ComponentFactory.build(HIGHER_ORDER, {
        descendantName: 'descendant-element'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/foo-InnerCmp-descendantElement/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
        descendantName: 'descendant-element'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/bar-InnerStateless-descendantElement/);

      Component = ComponentFactory.build(MIXIN, {
        descendantName: 'descendant-element'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/Component-descendantElement/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'Component',
        descendantName: 'descendant-element'
      });
      component = renderComponent(Component);
      className = ReactDOM.findDOMNode(component).className;
      expect(className).toMatch(/Component-descendantElement/);
    });
  });

  it('modifier class names follow SuitCss conventions', () => {
    Component = ComponentFactory.build(DECORATOR, {
      modifiers: 'modifier-one modifier-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/Component--modifierOne/);
    expect(className).toMatch(/Component--modifierTwo/);

    Component = ComponentFactory.build(HIGHER_ORDER, {
      modifiers: 'modifier-one modifier-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/foo-InnerCmp--modifierOne/);
    expect(className).toMatch(/foo-InnerCmp--modifierTwo/);

    Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
      modifiers: 'modifier-one modifier-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/bar-InnerStateless--modifierOne/);
    expect(className).toMatch(/bar-InnerStateless--modifierTwo/);

    Component = ComponentFactory.build(MIXIN, {
      modifiers: 'modifier-one modifier-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/Component--modifierOne/);
    expect(className).toMatch(/Component--modifierTwo/);

    Component = ComponentFactory.build(UTILITY, {
      componentName: 'Component',
      modifiers: 'modifier-one modifier-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/Component--modifierOne/);
    expect(className).toMatch(/Component--modifierTwo/);
  });

  it('state class names follow SuitCss conventions', () => {
    Component = ComponentFactory.build(DECORATOR, {
      states: 'state-one state-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/is-stateOne/);
    expect(className).toMatch(/is-stateTwo/);

    Component = ComponentFactory.build(HIGHER_ORDER, {
      states: 'state-one state-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/is-stateOne/);
    expect(className).toMatch(/is-stateTwo/);

    Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
      states: 'state-one state-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/is-stateOne/);
    expect(className).toMatch(/is-stateTwo/);

    Component = ComponentFactory.build(MIXIN, {
      states: 'state-one state-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/is-stateOne/);
    expect(className).toMatch(/is-stateTwo/);

    Component = ComponentFactory.build(UTILITY, {
      componentName: 'Component',
      states: 'state-one state-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/is-stateOne/);
    expect(className).toMatch(/is-stateTwo/);
  });

  it('utility class names follow SuitCss conventions', () => {
    Component = ComponentFactory.build(DECORATOR, {
      utilities: 'utility-one utility-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/u-utilityOne/);
    expect(className).toMatch(/u-utilityTwo/);

    Component = ComponentFactory.build(HIGHER_ORDER, {
      utilities: 'utility-one utility-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/u-utilityOne/);
    expect(className).toMatch(/u-utilityTwo/);

    Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
      utilities: 'utility-one utility-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/u-utilityOne/);
    expect(className).toMatch(/u-utilityTwo/);

    Component = ComponentFactory.build(MIXIN, {
      utilities: 'utility-one utility-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/u-utilityOne/);
    expect(className).toMatch(/u-utilityTwo/);

    Component = ComponentFactory.build(UTILITY, {
      componentName: 'Component',
      utilities: 'utility-one utility-two'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/u-utilityOne/);
    expect(className).toMatch(/u-utilityTwo/);
  });

  it('allows arbitrary class names to be set', () => {
    Component = ComponentFactory.build(DECORATOR);
    component = renderComponent(Component, {
      className: 'arbitrary'
    });
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/arbitrary/);

    Component = ComponentFactory.build(HIGHER_ORDER);
    component = renderComponent(Component, {
      className: 'arbitrary'
    });
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/arbitrary/);

    Component = ComponentFactory.build(HIGHER_ORDER_STATELESS);
    component = renderComponent(Component, {
      className: 'arbitrary'
    });
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/arbitrary/);

    Component = ComponentFactory.build(MIXIN);
    component = renderComponent(Component, {
      className: 'arbitrary'
    });
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/arbitrary/);

    Component = ComponentFactory.build(UTILITY, {
      className: 'arbitrary',
      componentName: 'Component'
    });
    component = renderComponent(Component);
    className = ReactDOM.findDOMNode(component).className;
    expect(className).toMatch(/arbitrary/);
  });

  describe('descendants', () => {
    it('do not automatically inherit parent utilities on props', () => {
      Component = ComponentFactory.build(DECORATOR, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        utilities: 'utility-one utility-two'
      });
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant/);
      expect(descendantClassName).not.toMatch(/utilityOne/);

      Component = ComponentFactory.build(HIGHER_ORDER, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        utilities: 'utility-one utility-two'
      });
      let innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/foo-InnerCmp-descendant/);
      expect(descendantClassName).not.toMatch(/utilityOne/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        utilities: 'utility-one utility-two'
      });
      innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/bar-InnerStateless-descendant/);
      expect(descendantClassName).not.toMatch(/utilityOne/);

      Component = ComponentFactory.build(MIXIN, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        utilities: 'utility-one utility-two'
      });
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant/);
      expect(descendantClassName).not.toMatch(/utilityOne/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'Component'
      }, {
        componentName: 'Component',
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        utilities: 'utility-one utility-two'
      });
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant/);
      expect(descendantClassName).not.toMatch(/utilityOne/);
    });

    it('can assign own utilities', () => {
      Component = ComponentFactory.build(DECORATOR, {
        utilities: 'utility-one utility-two'
      }, {
        descendantName: 'descendant',
        utilities: 'utility-three'
      });
      component = renderComponent(Component);
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant u-utilityThree/);

      Component = ComponentFactory.build(HIGHER_ORDER, {
        utilities: 'utility-one utility-two'
      }, {
        descendantName: 'descendant',
        utilities: 'utility-three'
      });
      component = renderComponent(Component);
      let innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/foo-InnerCmp-descendant u-utilityThree/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {
        utilities: 'utility-one utility-two'
      }, {
        descendantName: 'descendant',
        utilities: 'utility-three'
      });
      component = renderComponent(Component);
      innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/bar-InnerStateless-descendant u-utilityThree/);

      Component = ComponentFactory.build(MIXIN, {
        utilities: 'utility-one utility-two'
      }, {
        descendantName: 'descendant',
        utilities: 'utility-three'
      });
      component = renderComponent(Component);
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant u-utilityThree/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'Component',
        utilities: 'utility-one utility-two'
      }, {
        componentName: 'Component',
        descendantName: 'descendant',
        utilities: 'utility-three'
      });
      component = renderComponent(Component);
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant u-utilityThree/);
    });

    it('do not automatically inherit parent className on props', () => {
      Component = ComponentFactory.build(DECORATOR, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        className: 'arbitrary'
      });
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant/);
      expect(descendantClassName).not.toMatch(/arbitrary/);

      Component = ComponentFactory.build(HIGHER_ORDER, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        className: 'arbitrary'
      });
      let innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/foo-InnerCmp-descendant/);
      expect(descendantClassName).not.toMatch(/arbitrary/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        className: 'arbitrary'
      });
      innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/bar-InnerStateless-descendant/);
      expect(descendantClassName).not.toMatch(/arbitrary/);

      Component = ComponentFactory.build(MIXIN, {}, {
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        className: 'arbitrary'
      });
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant/);
      expect(descendantClassName).not.toMatch(/arbitrary/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'Component'
      }, {
        componentName: 'Component',
        descendantName: 'descendant'
      });
      component = renderComponent(Component, {
        className: 'arbitrary'
      });
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant/);
      expect(descendantClassName).not.toMatch(/arbitrary/);
    });

    it('can assign own className', () => {
      Component = ComponentFactory.build(DECORATOR, {}, {
        descendantName: 'descendant',
        className: 'arbitrary'
      });
      component = renderComponent(Component);
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant arbitrary/);

      Component = ComponentFactory.build(HIGHER_ORDER, {}, {
        descendantName: 'descendant',
        className: 'arbitrary'
      });
      component = renderComponent(Component);
      let innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/foo-InnerCmp-descendant arbitrary/);

      Component = ComponentFactory.build(HIGHER_ORDER_STATELESS, {}, {
        descendantName: 'descendant',
        className: 'arbitrary'
      });
      component = renderComponent(Component);
      innerSpan = ReactTestUtils.findRenderedDOMComponentWithTag(component, 'span');
      descendantClassName = ReactDOM.findDOMNode(innerSpan).className;
      expect(descendantClassName).toMatch(/bar-InnerStateless-descendant arbitrary/);

      Component = ComponentFactory.build(MIXIN, {}, {
        descendantName: 'descendant',
        className: 'arbitrary'
      });
      component = renderComponent(Component);
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant arbitrary/);

      Component = ComponentFactory.build(UTILITY, {
        componentName: 'Component'
      }, {
        componentName: 'Component',
        descendantName: 'descendant',
        className: 'arbitrary'
      });
      component = renderComponent(Component);
      descendantClassName = ReactDOM.findDOMNode(component.refs.descendant).className;
      expect(descendantClassName).toMatch(/Component-descendant arbitrary/);
    });
  });
});
