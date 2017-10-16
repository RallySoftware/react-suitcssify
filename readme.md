# react-suitcssify

A React component utility to generate CSS class names that conform to [SUIT CSS naming conventions](https://github.com/suitcss/suit/blob/master/doc/naming-conventions.md).

__This utility can be used as a higher-order component, decorator, mixin, or utility function__.
This means that you can use it with React components defined using createClass, ES2015 classes, or stateless-functional components.

Provides a general purpose `getClassName(options)` method that accepts a variety of options for generating SUIT CSS conformant class names.

```JavaScript
getClassName({
  baseComponentName: string,
  className: string,
  componentName: string,
  descendantName: string,
  modifiers: string,
  namespace: string,
  states: string,
  utilities: string
})
```



When using the decorator or mixin approach, the following defaults are provided.

* __className__  - `Component.props.className`  _Note that `Component.propTypes.className` is also added for convenience._
* __componentName__ - `Component.displayName || Component.name`
* __namespace__ - `Component.namespace`
* __utilities__ - `Component.props.utilities`  _Note that `Component.propTypes.utilities` is also added for convenience._

When using the higher-order approach, the following defaults are provided.

* __className__  - `Component.props.className`
* __componentName__ - `Component.displayName || Component.name`
* __utilities__ - `Component.props.utilities`

## Installation

```
npm install react-suitcssify
```

## Usage

#### ES2015 class with a decorator

```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import SuitCssify from 'react-suitcssify';

@SuitCssify.decorator
class MyComponent extends React.Component {
  render() {
    return <div className={ this.getClassName() }></div>
  }
}

ReactDOM.render(<MyComponent/>, document.body);
```
* _NOTE: Your codebase must support ES7 decorators to use this syntax.  Alternatively, simply use the decorator as a wrapper function to achieve the same effect._

#### As a higher-order component

This decorator approach does not work with [stateless functional React components](https://facebook.github.io/react/blog/2015/10/07/react-v0.14.html#stateless-functional-components). This approach will pass in the `getClassName` function as a prop to your component.

```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import SuitCssify from 'react-suitcssify';

const MyComponent = ({ getClassName }) => <div className={ getClassName() }></div>;

const WrappedComponent = SuitCssify.higherOrder('optional_namespace')(MyComponent);

ReactDOM.render(<WrappedComponent/>, document.body);
```

Here's an example with an ES2015 class React component.

```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import SuitCssify from 'react-suitcssify';

class MyComponent extends React.Component {
  static propTypes = {
    getClassName: React.PropTypes.func.isRequired
  };

  render() {
    return <div className={ this.props.getClassName() }></div>
  }
}

const WrappedComponent = SuitCssify.higherOrder('optional_namespace')(MyComponent);

ReactDOM.render(<WrappedComponent/>, document.body);
```

#### As a mixin

```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import SuitCssify from 'react-suitcssify';

const MyComponent = React.createClass({
  mixins: [SuitCssify.mixin],

  render: function() {
    return <div className={ this.getClassName() }></div>
  }
});

ReactDOM.render(<MyComponent/>, document.body);
```

#### Calling getClassName directly

```JavaScript
import React from 'react';
import ReactDOM from 'react-dom';
import SuitCssify from 'react-suitcssify';

const getClassName = SuitCssify.getClassName;

class MyComponent extends React.Component {
  render() {
    return <div className={ getClassName({ componentName: 'MyComponent', namespace: 'my' }) }></div>
  }
}

ReactDOM.render(<MyComponent/>, document.body);
```

A more performant implementation of a component using the `getClassName` function directly is to instead call getBaseComponentName which pre-calculates the baseComponentName one time given the componentName and namespace instead of calculating it on every call. While being slightly more verbose than the other options, it will provide better performance than all the other approaches. Here's what that looks like:

```
const displayName = 'MyComponent';
const namespace = 'my';
const baseComponentName = SuitCssify.getBaseComponentName(displayName, namespace);
const getClassName = SuitCssify.getClassName;

class MyComponent extends React.Component {
  render() {
    return <div className={ getClassName({ baseComponentName }) }></div>
  }
}

ReactDOM.render(<MyComponent/>, document.body);

```

Each of the above render as:

```html
<div class="MyComponent"></div>
```

## Examples

#### Assuming we have the following component

```HTML
<Component />
```

#### We should expect the following output.

```JavaScript
getClassName() -----> 'Component'

getClassName({ componentName: 'AwesomeComponent' }) -----> 'AwesomeComponent'

getClassName({ namespace: 'my' }) -----> 'my-Component'

getClassName({ modifiers: 'foo bar' }) -----> 'Component Component--foo Component--bar'

getClassName({ states: 'active' }) -----> 'Component is-active'

getClassName({ utilities: 'floatRight' }) -----> 'Component u-floatRight'

getClassName({ className: 'arbitrary' }) -----> 'Component arbitrary'

getClassName({ descendantName: 'title' }) -----> 'Component Component-title'

getClassName({
  className: 'arbitrary',
  componentName: 'AwesomeComponent',
  modifiers: 'foo bar',
  namespace: 'my',
  states: 'active',
  utilities: 'floatRight'
}) -----> 'my-AwesomeComponent my-AwesomeComponent--foo my-AwesomeComponent--bar is-active u-floatRight arbitrary'

getClassName({
  componentName: 'AwesomeComponent',
  namespace: 'my',
  modifiers: 'foo bar',
  states: 'active',
  utilities: 'floatRight',
  className: 'arbitrary',
  descendantName: 'child'
}) -----> 'my-AwesomeComponent-child my-AwesomeComponent-child--foo my-AwesomeComponent-child--bar is-active u-floatRight arbitrary'

const baseComponentName = getBaseComponentName('Component', 'my');
getClassName({
  baseComponentName
}) -----> 'my-Component'
```

For more examples, browse the [demo files](https://github.com/brentertz/react-suitcss-mixin/blob/master/demo) or just run the demo.

## Demo

```
npm run demo
```

## Build

```
npm run build
```

## Tests

```
npm test
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code.

## Release History

* 3.3.0 - Add support for React 16.
* 3.2.0 - Add getBaseComponentName to API. Alias `utility` as `getClassName` -- utility will be removed in a future release as it would be a breaking change.
* 3.1.0 - Add higher-order component option. Update React version and add to peerDependencies.  Other minor tweaks.
* 3.0.2 - Update decorator to not use inheritance.  Update dev dependencies, including react 0.14.
* 3.0.1 - Use destructuring assignment instead of Object.assign.  Utilize internal format method to de-dupe similar code.  Adjust imports.
* 3.0.0 - Descendant elements no longer automatically inherit parent className.
* 2.0.2 - Add extra this.props check when using as utility.
* 2.0.1 - Remove React as peer dependency.
* 2.0.0 - Extend capabilities for use as decorator, mixin, or utility method. Project renamed to react-suitcssify.  To upgrade, simply change the import/require to use the desired type (decorator, mixin, or utility) as shown in the usage section above.
* 1.0.1 - Update dependencies. Fix test mock. Update readme.
* 1.0.0 - Camelize and capitalize componentName
* 0.0.5 - Use Object.assign polyfill from react/lib. Update .npmignore and readme.
* 0.0.4 - Initial release
