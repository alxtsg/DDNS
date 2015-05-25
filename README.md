# DDNS #

## Description ##

A simple Node.js application for updating DNS record on Namecheap.

## Requirements ##

* Node.js (tested with 0.10.35).

## Installation ##

0. Install Node.js.
1. Start the application by `node index.js`.

## Usage ##

The configuration file `config.json` controls the following:

* `host`: The subdomain of domain, use `"@"` for the domain itself.
* `domain`: The domain, e.g. `"example.com"`.
* `password`: The password for updating DNS record.
* `log`: The file name of log file.
* `updateInterval`: The update interval of DNS record, in seconds, e.g. `3600` for updating every 1 hour.

## License ##

[The BSD 3-Clause License](http://opensource.org/licenses/BSD-3-Clause)