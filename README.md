# PlayFab ES6/Webpack Boilerplate

This is a boilerplate for Javascript based PlayFab projects, which includes the following features:

* ES6 compatible syntax. You can use multiple files to modularise your code and relate them through `import` syntax.
* A build script that combine your code into PlayFab compatible bundle
* A deploy script that deploy your code to multiple PlayFab projects
* A data synchronisation tool to make sure _Catalogs_, _Currencies_ and _Statistics_ are identical across multiple projects.

## Initial Setup

This project is meant to be a starting point of a PlayFab project. You can simply download or fork the project and change `package.json` to your needs.

### Installation

```bash
npm install
```

This will install all the required library.

### Configuration

This project make use of the excellent [node-config](https://github.com/lorenwest/node-config) library.

You can simply define settings for multiple PlayFab projects using the usual `development` / `test` / `production` notation.

The project uses YAML format for configuration by default, but you can change it to whatever suits the task.

Change `config/development.yaml` to include your PlayFab App ID and Secret key.

## Building and Publishing

```bash
# Create bundle under `dist/app.js`
npm run build

# Create and deploy to PlayFab (but not making it the live version)
npm run deploy

# Create bundle and publish (make it the live version)
npm run publish

# Publish to production (NOTE: proceed with caution)
NODE_ENV=production npm run publish
```

## Title Data Synchronisation

Title data can be defined under `title/`. You can update your PlayFab environment as follow:

```bash
# Update development environment
npm run sync

# Update production environment (NOTE: proceed with caution)
NODE_ENV=production npm run sync
```

Title data are expected to be in JSON format since this is the format PlayFab used for importing/exporting data.

### Catalog

Catalog data can be defined with file names with `catalog-[CATALOG_NAME].json` pattern (e.g. `catalog-items.json`)

The format should be the same as if you download a JSON file from PlayFab's admin panel.

Multiple catalogs can be defined as long as the file pattern matches.

### Currency

Currency information can be defined with `currencies.json`.

Again, the format is identical to what PlayFab exports.

### Statistics

Statistics information can be defined with `statistics.json`.