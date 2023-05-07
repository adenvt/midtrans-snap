import { initSnap, useSnap } from '..'

initSnap('123456', 'sandbox')

function pay () {
  useSnap()
    .pay('123')
    .then((result) => {
      // eslint-disable-next-line no-console
      console.log(result)
    })
    .catch(console.error)
}

document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('#pay') as HTMLButtonElement

  button.addEventListener('click', pay)
})
