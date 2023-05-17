# midtrans-snap

> (Un)official Midtrans Snap Client (SnapJS)

![npm](https://img.shields.io/npm/v/midtrans-snap?style=for-the-badge)
![npm](https://img.shields.io/npm/dm/midtrans-snap?style=for-the-badge)

## Features

- Bundler friendly, support ESM and CJS
- Strongly typed, written with Typescript
- Promisify callback, easy to use with *async-await*

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
initSnap('YOUR_CLIENT_KEY', 'sandbox'/* or 'production' */)

// Later, you can call useSnap() anywhere
const snap   = useSnap()
const result = await snap.pay('SNAP_PAY_TOKEN')
```

## Nuxt 3

Using this in Nuxt 3 is quite simple, just create the plugin `plugins/snap.client.ts`.

```ts
export default defineNuxtPlugin(() => {
  initSnap('YOUR_CLIENT_KEY', 'sandbox')
})
```

## Promisify callback

On original one, SnapJS has 4 callbacks: `onSuccess`, `onPending`, `onError`, `onClose`.
This library united this into single Promise, so you can *await* it.

- `onSuccess` and `onPending` will resolve the Promise
- `onClose` and `onError` will reject the Promise

```ts
import { useSnap, isCancel } from 'midtrans-snap'

try {
  const snap   = useSnap()
  const result = await snap.pay('SNAP_PAY_TOKEN')

  if (result.transaction_status !== 'pending')
    console.log('Payment Sucess')
} catch (error) {
  if (isCancel(error)) {
    console.log('Customer closed the popup without finishing the payment')
  } else {
    console.log('Payment error')
  }
}
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
