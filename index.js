/**
 * Main program.
 *
 * @author Alex Tsang <alextsang@live.com>
 *
 * @license BSD-3-Clause
 */

'use strict';

const fs = require('fs'),
  https = require('https'),
  path = require('path'),
  queryString = require('querystring'),
  StringDecoder = require('string_decoder').StringDecoder,
  util = require('util'),

  // Path to configuration file.
  CONFIG_FILE_PATH = path.join(
    __dirname,
    'config.json'
  ),

  // Exit code for abnormal condition.
  EXIT_ABNORMAL = 1,

  decoder = new StringDecoder('utf8');

// Interval between updating DNS record, in milliseconds.
let updateInterval = 0,

  // Path to log file.
  logFilePath = null,

  // Query parameter string to be sent to Namecheap.
  queryParamString = null,

  // HTTPS request options.
  requestOptions = null,

  /**
   * Writes message to log file.
   *
   * @param {string} message Log message.
   */
  writeLog = function (message) {
    message += '\n';
    fs.appendFile(logFilePath, message, function (error) {
      if (error !== null) {
        console.error('Unable to write log.');
      }
    });
  },

  /**
   * Updates DNS record.
   */
  updateRecord = function () {
    let date = new Date(),
      responseHandler = function (response) {
        writeLog(date.toISOString());
        // Actual status is included in response body as an XML document.
        writeLog(util.format('Status code: %d', response.statusCode));
        response.on('data', function (data) {
          writeLog(decoder.write(data));
        });
      },
      request = https.request(requestOptions, responseHandler);
    request.end();
    request.on('error', function (error) {
      writeLog(util.format('Error: %s', error));
    });
  },

  /**
   * Starts periodical DNS update.
   */
  startPeriodicUpdate = function () {
    updateRecord();
    setInterval(updateRecord, updateInterval);
  };

// Read configuration file and start updating DNS record periodically.
fs.readFile(
  CONFIG_FILE_PATH,
  {
    encoding: 'utf8'
  },
  function (error, data) {
    if (error !== null) {
      console.error('Unable to read configuration file.');
      process.exit(EXIT_ABNORMAL);
    }
    try {
      let config = JSON.parse(data);
      queryParamString = queryString.stringify({
        host: config.host,
        domain: config.domain,
        password: config.password
      });
      logFilePath = config.log;
      // Convert update interval from seconds to milliseconds.
      updateInterval = config.updateInterval * 1000;
      requestOptions = {
        hostname: 'dynamicdns.park-your-domain.com',
        port: 443,
        path: '/update?' + queryParamString,
        method: 'GET'
      };
    } catch (parseError) {
      console.error(
        util.format('Unable to parse configuratiln file: %s', parseError));
      process.exit(EXIT_ABNORMAL);
    }
    startPeriodicUpdate();
  }
);
