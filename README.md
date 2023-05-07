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
import { initSnap, useSnap } from 'midtrans-snap'

// You need run this once
initSnap('YOUR_CLIENT_KEY', 'sandbox') /* or change to 'production' */

// Later, you can call useSnap() anywhere
const snap   = useSnap()
const result = await snap.pay('SNAP_PAY_TOKEN')
```

## Nuxt 3

Using this in Nuxt 3 is quite simple, just create the plugin `plugin/snap.client.ts`.

```ts
export default defineNuxtPlugin(() => {
  initSnap('YOUR_CLIENT_KEY', 'sandbox')
})
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
