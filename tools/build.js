/* eslint-env node */

const Promise = require('bluebird');
const fs = require('fs-extra-promise');
const path = require('path');
const config = require('config');
const chalk = require('chalk');
const request = require('request-promise');

const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const argv = require('minimist')(process.argv.slice(2));

let shouldDeploy = !argv['skip-deploy'];

let rootDir = path.resolve(__dirname, '..'),
    outputDir = path.join(rootDir, 'dist'),
    outputFile = path.join(outputDir, 'app.js');

// Determine deployment target
let targetEnv = config.util.getEnv('NODE_ENV');
let isProduction = targetEnv === 'production';
let targetApp = config.util.getEnv('NODE_APP_INSTANCE') || 'default';

let titleId = config.get('titleId');
let apiKey = config.get('developKey');

/**
 * Compile source code with webpack
 * @see webpack.config.js
 */
function compileAsync() {
  let compiler = webpack(webpackConfig);

  return new Promise((resolve, reject) => {
    compiler.run((err, stat) => {
      if (err) {
        return reject(err);
      }

      console.log(stat.toString({ chunks: false, colors: true }));

      resolve();
    });
  });
}

function readOutputAsync() {
  return fs.readFileAsync(outputFile, 'utf8');
}

function deployScriptAsync(content) {
  let options = {
    uri: `https://${titleId}.playfabapi.com/Admin/UpdateCloudScript`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-SecretKey': apiKey,
    },
    body: {
      'Files': [
        {
          'Filename': 'main.js',
          'FileContents': content,
        },
      ],
      'Publish': true,
    },
    json: true,
  };

  console.log(chalk.red('Deploying in 5 seconds. Press Ctrl+C to cancel'));

  return Promise.delay(5000)
    .then(() => {
      console.log(chalk.yellow('Deploying...'));
      return request(options);
    });
}

// --- Main ---

let envChalkFunction = isProduction ? chalk.red : chalk.yellow;
console.log('Building for: ' + envChalkFunction(`${targetEnv} [${titleId}]`) + chalk.cyan(' ' + targetApp));

Promise.resolve()
  .then(() => compileAsync())
  .then(() => readOutputAsync())
  .then((compiledCode) => {
    if (shouldDeploy) {
      return deployScriptAsync(compiledCode);
    }
  })
  .then(() => {
    console.log(chalk.green('Done'));
  })
  .catch((err) => {
    console.log(chalk.red('Error: ' + err));
    console.log(chalk.yellow(err.stack));
  });
