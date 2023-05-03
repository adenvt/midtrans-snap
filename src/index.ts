declare global {
  interface Window {
    snap?: Snap
  }
}

interface Snap {
  pay: (token: string, options: SnapOptions) => void,
  show: () => void,
  hide: () => void,
}

interface SnapResult {
  status_code: string,
  status_message: string[],
}

type PaymenType =
  | 'credit_card'
  | 'cimb_clicks'
  | 'bca_klikbca'
  | 'bca_klikpay'
  | 'bri_epay'
  | 'telkomsel_cash'
  | 'echannel'
  | 'indosat_dompetku'
  | 'permata_va'
  | 'other_va'
  | 'bca_va'
  | 'bni_va'
  | 'kioson'
  | 'indomaret'
  | 'gci'
  | 'danamon_online'

interface SnapOptions {
  onSuccess?: (result: SnapResult) => void
  onPending?: (result: SnapResult) => void,
  onError?: (error: SnapResult) => void,
  onClose?: (error: SnapResult) => void,
  enabledPayments?: PaymenType[],
  language?: 'en' | 'id',
  autoCloseDelay?: number,
  selectedPaymentType?: PaymenType,
  uiMode?: 'deeplink' | 'qr' | 'auto'
}

type UseSnapOptions = Omit<SnapOptions, 'onSuccess' | 'onPending' | 'onError' | 'onClose'>

type SnapEnv = 'production' | 'sandbox'

const SNAP_LOCATION: Record<SnapEnv, string> = {
  production: 'https://app.midtrans.com/snap/snap.js',
  sandbox   : 'https://app.sandbox.midtrans.com/snap/snap.js',
}

export class SnapError extends Error {
  result?: SnapResult
  isClosed?: boolean

  constructor (message: string, isClosed: boolean = false, result?: SnapResult) {
    super(message)

    this.result   = result
    this.isClosed = isClosed
  }
}

export class MidtransSnap {
  #clientKey: string
  #env: SnapEnv

  /**
   *
   * @param clientKey Snap client key
   * @param env 'production' | 'sandbox', default is `sandbox`
   */
  constructor (clientKey: string, env: SnapEnv = 'sandbox') {
    this.#clientKey = clientKey
    this.#env       = env
  }

  #loadScript(): Promise<Snap> {
    if (window.snap !== undefined) {
      return Promise.resolve(window.snap)
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')

      const onLoad = () => {
        if (window.snap !== undefined) {
          onFinish()
          resolve(window.snap)
        }
      }

      const onError = (error: ErrorEvent) => {
        onFinish()
        reject(error)
      }

      const onFinish = () => {
        script.removeEventListener('load', onLoad)
        script.removeEventListener('error', onError)
      }

      script.addEventListener('load', onLoad)
      script.addEventListener('error', onError)

      script.src               = SNAP_LOCATION[this.#env]
      script.dataset.clientKey = this.#clientKey
      script.dataset.testId    = 'midtrans-snap'
      script.type              = 'text/javascript'

      document.body.append(script)
    })
  }

  async pay (tokenOrUrl: string, options: UseSnapOptions = {}) {
    const regex = /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/gm  // Extract token from url
    const match = regex.exec(tokenOrUrl)
    const token = match ? match[0] : tokenOrUrl
    const snap  = await this.#loadScript()

    return new Promise((resolve, reject) => {
      snap.pay(token, {
        ...options,
        onSuccess (result) {
          resolve(result)
        },
        onPending (result) {
          resolve(result)
        },
        onError (result) {
          const message = result.status_message[0] || 'Payment Error'
          const error   = new SnapError(message, false, result)

          reject(error)
        },
        onClose () {
          const error = new SnapError('Customer closed the popup without finishing the payment', true)

          reject(error)
        },
      })
    })
  }

  async show () {
    (await this.#loadScript()).show()
  }

  async hide () {
    (await this.#loadScript()).hide()
  }

  isCancel (error: Error) {
    return (error instanceof SnapError) && error.isClosed
  }
}
