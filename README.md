import

```js
import { Pipeline } from './index.js';
```

example

```js
import { Pipeline } from './index.js';

const pipeline = new Pipeline(['main']);

pipeline.init((e) => {
  pipeline.runScrip('yarn run g');
  pipeline.runScrip('node -v');
});
```

run the pipeline

`node ./pipeline.js`
