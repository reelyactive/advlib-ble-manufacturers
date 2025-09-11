advlib-ble-manufacturers
========================

Wireless advertising packet decoding library for Bluetooth Low Energy manufacturer-specific data.  __advlib-ble-manufacturers__ is typically used as a library for [advlib-ble](https://github.com/reelyactive/advlib-ble) which itself is commonly a processor module of the protocol-agnostic [advlib](https://github.com/reelyactive/advlib).

![Overview of advlib-ble-manufacturers](https://reelyactive.github.io/advlib-ble-manufacturers/images/overview.png)

__advlib-ble-manufacturers__ is a lightweight [Node.js package](https://www.npmjs.com/package/advlib-ble-manufacturers) with no dependencies.  It is included in reelyActive's [Pareto Anywhere](https://www.reelyactive.com/pareto/anywhere/) open source IoT middleware.  See also its sister library [advlib-ble-services](https://github.com/reelyactive/advlib-ble-services).


Installation
------------

    npm install advlib-ble-manufacturers


Hello advlib-ble-manufacturers!
-------------------------------

```javascript
const advlib = require('advlib-ble-manufacturers');

let companyCode = 0x004c;
let manufacturerData = '021500112233445566778899aabbccddeeff01234567fc';

let processedData = advlib.processManufacturerSpecificData(companyCode,
                                                           manufacturerData);

console.log(processedData);
```

Which should yield the following console output:

    { deviceIds: [ '00112233445566778899aabbccddeeff/0123/4567' ],
      txPower: -4,
      uri: "https://sniffypedia.org/Organization/Apple_Inc/iBeacon/" }

The __advlib-ble-manufacturers__ library observes [these standard properties](https://github.com/reelyactive/advlib#standard-properties).


Supported Manufacturers
-----------------------

The following manufacturers, in order of their assigned company codes, are supported by __advlib-ble-manufacturers__.

| Company Code | Manufacturer             | /lib file                  |
|:-------------|:-------------------------|:---------------------------|
| 0x004c       | Apple                    | apple.js                   |
| 0x0059       | Nordic Semiconductor     | nordicsemiconductor.js     |
| 0x0077       | Laird Connectivity       | lairdconnectivity.js       |
| 0x026c       | Efento                   | efento.js                  |
| 0x03da       | EnOcean                  | enocean.js                 |
| 0x0500       | Wiliot                   | wiliot.js                  |
| 0x0583       | Code Blue Communications | codebluecommunications.js  |
| 0x0590       | Pur3 Ltd (Espruino)      | pur3ltd.js                 |
| 0x0639       | Minew                    | minew.js                   |
| 0x075b       | Smart Sensor Devices     | smartsensordevices.js      |
| 0x0a62       | MOKO Technology          | mokotechnology.js          |

Consult the [Bluetooth Assigned Numbers for Company Identifiers](https://www.bluetooth.com/specifications/assigned-numbers/company-identifiers/) for the most recent listing of company code assignments.


Supported Devices
-----------------

The following is a _non-exhaustive_ list of devices supported by __advlib-ble-manufacturers__.

| Manufacturer         | Model/Device             | /lib file                |
|:---------------------|:-------------------------|:-------------------------|
| Apple                | iBeacon                  | apple.js                 |
| MOKOSmart            | S02R (ToF Sensor)        | nordicsemiconductor.js   |
| Laird                | BT610                    | lairdconnectivity.js     |
| EnOcean              | EMSIB (STM 550B)         | enocean.js               |
| EnOcean              | EMDCB                    | enocean.js               |
| Wiliot               | IoT Pixel                | wiliot.js                |
| Minew                | S3                       | minew.js                 |
| Minew                | S4                       | minew.js                 |
| Minew                | MBT02                    | minew.js                 |
| Minew                | MSD01                    | minew.js                 |
| Minew                | MSE01                    | minew.js                 |
| Minew                | MSE02                    | minew.js                 |
| Minew                | MSR01                    | minew.js                 |
| Minew                | MTB02                    | minew.js                 |
| Smart Sensor Devices | HibouAir                 | smartsensordevices.js    |
| MOKOSmart            | P1                       | mokotechnology.js        |
| MOKOSmart            | S03D (Door Sensor)       | mokotechnology.js        |


Contributing
------------

Discover [how to contribute](CONTRIBUTING.md) to this open source project which upholds a standard [code of conduct](CODE_OF_CONDUCT.md).


Security
--------

Consult our [security policy](SECURITY.md) for best practices using this open source software and to report vulnerabilities.


License
-------

MIT License

Copyright (c) 2015-2025 [reelyActive](https://www.reelyactive.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
