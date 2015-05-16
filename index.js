/*
  Main program.

  @author alextsang@live.com
*/
(function(){

  'use strict';

  var fs = require('fs'),
    https = require('https'),
    queryString = require('querystring'),
    StringDecoder = require('string_decoder').StringDecoder,
    util = require('util'),

    decoder = new StringDecoder('utf8'),

    // Interval between updating DNS record, in milliseconds.
    updateInterval = 0,

    // Path to log file.
    logFilePath = null,

    // Query parameter string to be sent to Namecheap.
    queryParamString = null,

    // HTTPS request options.
    requestOptions = null,

    /*
      Parses configuration file.

      @param data Configuration data.
    */
    parseConfig = function(data){
      try{
        var config = JSON.parse(data);
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
      }catch(error){
        console.error(
          util.format('Unable to parse configuratiln file: %s', error));
        process.exit(1);
      }
    },

    /*
      Writes message to log file.

      @param message Log message.
    */
    writeLog = function(message){
      message += '\n';
      fs.appendFile(logFilePath, message, function(error){
        if(error !== null){
          console.error('Unable to write log.');
        }
      });
    },

    /*
      Updates DNS record.
    */
    updateRecord = function(){
      var date = new Date(),
        responseHandler = function(response){
          writeLog(date.toISOString());
          // Actual status is included in response body as an XML document.
          writeLog(util.format('Status code: %d', response.statusCode));
          response.on('data', function(data){
            writeLog(decoder.write(data));
          });
        },
        request = https.request(requestOptions, responseHandler);
      request.end();
      request.on('error', function(error){
        writeLog(util.format('Error: %s', error));
      });
    },

    /*
      Updates DNS record periodically.
    */
    startPeriodicUpdate = function(){
      updateRecord();
      setInterval(updateRecord, updateInterval);
    };

  // Read configuration file and start updating DNS record periodically.
  fs.readFile('config.json', {
    encoding: 'utf8'
  }, function(error, data){
    if(error !== null){
      console.error('Unable to read configuration file.');
      process.exit(1);
    }
    parseConfig(data);
    startPeriodicUpdate();
  });
}());