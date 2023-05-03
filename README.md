# midtrans-snap

> (Un)official Midtrans Snap Client wrapper

## Features

- Bundler friendly
- Strongly typed
- Promisify callback

## Installation

```sh
# Using NPM
npm install --save midtrans-snap

# Using Yarn
yarn add midtrans-snap
```

## Usage

```ts
import { MidtransSnap } from 'midtrans-snap'

const snap   = new MidtransSnap('YOUR_CLIENT_KEY', 'production')
const result = await snap.pay('SNAP_PAY_TOKEN')
```

## Contribution

- Clone this repository
- Play [Caramelldansen](https://youtu.be/PDJLvF1dUek) in background (very important)
- Run deps using `yarn install`
- Write your additional feature
- Don't forget to write the test
- Open PR

## License

This project publish under MIT LIcense, see [LICENSE](/LICENSE) for more details.
