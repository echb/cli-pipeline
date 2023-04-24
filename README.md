import

```js
import { Pipeline } from 'cli_pipeline';
```

example

```js
import { Pipeline } from 'cli_pipeline';

const pipeline = new Pipeline(['main']);

pipeline.init((e) => {
  pipeline.runScrip('yarn run g');
  pipeline.runScrip('node -v');
});
```

run the pipeline

`node ./pipeline.js`
