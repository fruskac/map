# Fruškać Map
#### Fruška gora, Srbija
The map is to be used in an `iFrame` element. Initial configuration could be passed in via `src` attribute. The Map will expose API to it's parent element to allow Map control. Usages could be found in [examples](https://github.com/fruskac/map/tree/master/examples) directory. Here are some links:
* [AngularJS](./examples/angularjs.html)
* [Embed](examples/embeded.html)
* [Coordinates](./examples/coordinates.html)

## Contributing

##### Branching model
We are using `git-flow` as our brancing model. Read more at [nvie.com/posts/a-successful-git-branching-model](http://nvie.com/posts/a-successful-git-branching-model/)

###### Installing `git-flow`
Read more about `git-flow` and how to install it [github.com/nvie/gitflow](https://github.com/nvie/gitflow)

###### Adding ```git-flow-hooks``` helper
To automate "semantic versioning" you could install ```git-flow-hooks``` from https://github.com/jaspernbrouwer/git-flow-hooks to 
- Prevent direct commits to the master branch.
- Prevent merge marker commits.
- Automatically bump versions when starting a release or hotfix. Versions are generated, written to file and committed.
- Automatically specify tag messages.

##### Tools
To be able to build source files, you need to have `npm` and `node` installed. After that run
```
npm install
```
This will install `Gulp` and other libraries needed for development.

##### Dependencies
To be able to get dependencies, you need to have `bower` installed. Run the command below to install all needed dependencies.
```
bower install
```

##### Build
To create build, run
```
gulp
```

###### Build separate JS, LESS, HTML and IMG
Build can be run by specific type, like
```
gulp js
gulp less
gulp html
gulp img
```

##### Development
While doing development, start watcher which will react on file changes and start appropriate tasks to update build
```
gulp watch
```

This will start the local development server on port 3000, that serves the project root, so you can go to your browser 
and open `http://localhost:3000` to access the files, or for example `http://localhost:3000/examples/angularjs.html` to
access the angularjs example. 
You can also acces the documentation by opening `http://localhost:3000/docs/index.html` in your browser.

##### Release and Documentation
Documentation build is usually done in the release process to minimize the chance of merge problems, as all the files 
from `dist` folder are being copied to `docs/dist`. Documentation build is automated and is run by
```
gulp docs
```
