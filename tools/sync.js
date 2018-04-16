/**
 * PlayFab Title-wide data synchronisation script
 */

/* eslint-env node */

const Promise = require('bluebird');
const fs = require('fs-extra-promise');
const path = require('path');
const config = require('config');
const chalk = require('chalk');
const request = require('request-promise');
const walk = require('walk-promise');

const PATTERN_FILE = /\.json$/;

const PATTERN_CATALOG = /^catalog\-.*/,
      PATTERN_CURRENCIES = /^currencies.json$/,
      PATTERN_STATISTICS = /^statistics.json$/;

let rootDir = path.resolve(__dirname, '..'),
    dataDir = path.join(rootDir, 'title');

// Determine deployment target
let targetEnv = config.util.getEnv('NODE_ENV');
let isProduction = targetEnv === 'production';
let targetApp = config.util.getEnv('NODE_APP_INSTANCE') || 'default';

let titleId = config.get('titleId');
let apiKey = config.get('developKey');

function sendAdminRequest(apiEndPoint, content = {}) {
  let options = {
    uri: `https://${titleId}.playfabapi.com/Admin/${apiEndPoint}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-SecretKey': apiKey,
    },
    body: content,
    json: true,
  };

  return request(options);
}

function processDataFile(filename) {

  // Handles JSON files only
  if (!PATTERN_FILE.test(filename)) {
    return;
  }

  console.log(chalk.cyan('Handling:'), path.basename(filename));

  return fs.readJsonAsync(path.join(dataDir, filename), 'utf-8')
    .then((content) => processContent(filename, content));
}

function processContent(filename, content) {

  // Catalog
  if (PATTERN_CATALOG.test(filename)) {
    return updateCatalog(content);
  }

  if (PATTERN_CURRENCIES.test(filename)) {
    return updateCurrencies(content);
  }

  if (PATTERN_STATISTICS.test(filename)) {
    return updateStatistics(content);
  }

  console.log(chalk.yellow('Unknown type:'), filename);

  return Promise.resolve();
}

function updateCatalog(payload) {
  return sendAdminRequest('UpdateCatalogItems', payload);
}

function updateCurrencies(payload) {
  return sendAdminRequest('AddVirtualCurrencyTypes', { VirtualCurrencies: payload });
}

/**
 * Create or update Statistic definition
 */
function updateStatistics(payload) {
  let stats = {};

  return sendAdminRequest('GetPlayerStatisticDefinitions')
    .then((res) => {
      // Retrieve the current statistics list
      if (res && res.code === 200 && res.data.Statistics) {
        res.data.Statistics.forEach((stat) => {
          stats[stat.StatisticName] = true;
        });
      } else {
        Promise.reject(new Error(res.errorMessage));
      }
    })
    .then(() => {
      return Promise.mapSeries(payload, (payloadItem) => {
        let apiEndPoint = stats[payloadItem.StatisticName] !== undefined ? 'UpdatePlayerStatisticDefinition' : 'CreatePlayerStatisticDefinition';
        return sendAdminRequest(apiEndPoint, payloadItem);
      });
    });
}

let envChalkFunction = isProduction ? chalk.red : chalk.yellow;
console.log('Title sync for: ' + envChalkFunction(`${targetEnv} [${titleId}]`) + chalk.cyan(' ' + targetApp));

console.log(chalk.red('Deploying in 5 seconds. Press Ctrl+C to cancel'));

Promise.delay(5000)
  .then(() => walk(dataDir))
  .then((files) => {
    return Promise.mapSeries(files, (file) => processDataFile(file.name));
  })
  .then(() => {
    console.log(chalk.green('Completed'));
  });