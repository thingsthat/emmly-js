# Emmly JavaScript SDK

This JavaScript SDK is for the Emmly API, so you can easily access content stored in Emmly with your JavaScript applications.

![GitHub package.json version](https://img.shields.io/github/package-json/v/thingsthat/emmly-js) [![GitHub license](https://img.shields.io/github/license/thingsthat/emmly-js)](https://github.com/thingsthat/emmly-js/blob/master/LICENSE) ![Release workflow](https://github.com/thingsthat/emmly-js/actions/workflows/main.yml/badge.svg) ![GitHub issues](https://img.shields.io/github/issues/thingsthat/emmly-js)

## Installation

The kit is universal, it can be used:

* Server-side with Node.js
* Client-side as part of your React or Vue application
* Client-side with a script tag

### NPM

```sh
npm install @thingsthat/emmly-js --save
```

### Yarn

```sh
yarn add @thingsthat/emmly-js --save
```

### CDN

```
https://unpkg.com/@thingsthat/emmly-js
```

## Configuration

To get started with the Emmly JavaScript SDK, you first need to configure it with your API credentials and any other necessary settings. Here's a step-by-step guide on how to do this:

### Setting API Credentials

You will need your Emmly API token to authenticate requests. The default is automatically retrieved from the EMMLY_API_TOKEN environment variable if set. Here's how to set it manually:

```javascript
import { EmmlyClient } from '@thingsthat/emmly-js';

const client = new EmmlyClient()
client.setToken(EMMLY_API_TOKEN)
```

### Configuring Timeout

You can also configure other options like request timeout, which defines how long the SDK should wait for a response before timing out:

```javascript
client.setTimeout(10000); // Default timeout in milliseconds
```

## Testing

API tests use Mocha. Use the following command:

```sh
yarn test
```

For these tests, you will need the following environment variables:

* EMMLY_API_TOKEN - The API token for accessing the Emmly API.
* EMMLY_API_URL - The URL of the API. This is necessary if you are running tests in a local environment or in an environment other than production.

You can also add these variables to a .env file in your project root for convenience.

## License

This software is licensed under the MIT License, quoted below.

Copyright (c) 2023 Things That Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.