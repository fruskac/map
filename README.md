# Fruškać Map

#### Fruška gora, Srbija
The map is to be used in an `iFrame` element. Initial configuration could be passed in via `src` attribute. The Map will expose API to it's parent element to allow Map control. Usages could be found in [examples](https://github.com/fruskac/map/tree/master/examples) directory. Here are some links:
* [AngularJS](./examples/angularjs.html)
* [Embed](./examples/embeded.html)
* [Coordinates](./examples/coordinates.html)

# Contributing

We are using `GitHub Flow` as our branching model. Read more at https://guides.github.com/introduction/flow/

#### Fork the repository

Start by forking this repository like explained here https://help.github.com/articles/fork-a-repo/. 

#### Create a local clone of your fork

To get code to your local machine use
```
git clone https://github.com/YOUR-USERNAME/map
```

#### Keep your fork synced

Keep your local fork of this repository in sync use command below. For more details see https://help.github.com/articles/syncing-a-fork/
```
./bin/git/sync-upstream
```

#### Tools
You need to have `npm` and `node` installed. Install `Gulp` and other libraries needed for development with this command
```
npm install
```

#### Dependencies
To be able to get dependencies, you need to have `bower` installed. Run the command below to install all needed dependencies.
```
bower install
```

#### Build
To create a build, run
```
gulp build
```

#### Development
While doing development, start watcher which will react on file changes and start appropriate tasks to update build
```
gulp watch
```

This will also start the local development server on port 3000, that serves the project root, so you can go to your browser and open 

http://localhost:3000
 
to access the files, or for example 

http://localhost:3000/examples/angularjs.html
 
to access the AngularJS example.
 
You can also access the documentation by opening 

http://localhost:3000/docs/

#### Documentation
Documentation build is usually done in the release process to minimize the chance of merge problems, as all the files 
from `dist` folder are being copied to `docs/dist`. Documentation build is automated and is run by
```
gulp docs
```

#### Release

Run builds, put code inline, generate documentation by running
```
gulp release
```