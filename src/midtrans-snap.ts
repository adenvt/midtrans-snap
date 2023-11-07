declare global {
  interface Window {
    snap?: Snap,
  }
}

interface Snap {
  pay: (token: string, options: SnapOptions) => void,
  show: () => void,
  hide: () => void,
}

export interface SnapResult {
  status_code: string,
  status_message: string,
  order_id: string,
  gross_amount: string,
  payment_type: PaymenType,
  transaction_id: string,
  transaction_time: string,
  transaction_status: 'capture' | 'settlement' | 'pending' | 'cancel' | 'expired',
  fraud_status: 'accept' | 'challenge' | 'deny',
  approval_code: string,
  masked_card: string,
  bank: string,
  permata_va_number: string,
  bca_va_number: string,
  bill_key: string,
  biller_code: string,
  saved_token_id: string,
  saved_token_id_expired_at: string,
  card_type: 'credit' | 'debit',
  pdf_url: string,
  va_numbers: Array<{
    bank: string,
    va_number: string,
  }>,
}

export interface SnapErrorResult {
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
  onSuccess?: (result: SnapResult) => void,
  onPending?: (result: SnapResult) => void,
  onError?: (error: SnapErrorResult) => void,
  onClose?: (error: SnapErrorResult) => void,
  enabledPayments?: PaymenType[],
  language?: 'en' | 'id',
  autoCloseDelay?: number,
  selectedPaymentType?: PaymenType,
  uiMode?: 'deeplink' | 'qr' | 'auto',
}

export type UseSnapOptions = Omit<SnapOptions, 'onSuccess' | 'onPending' | 'onError' | 'onClose'>

export type SnapEnv = 'production' | 'sandbox' | (string & Record<never, never>)

export const SNAP_LOCATION: Record<SnapEnv, string> = {
  production: 'https://app.midtrans.com/snap/snap.js',
  sandbox   : 'https://app.sandbox.midtrans.com/snap/snap.js',
}

export class SnapError extends Error {
  result?: SnapErrorResult
  isClosed?: boolean

  constructor (message: string, isClosed: boolean = false, result?: SnapErrorResult) {
    super(message)

    this.result   = result
    this.isClosed = isClosed
  }
}

export class MidtransSnap {
  #clientKey: string
  #env: SnapEnv
  #scriptEl?: HTMLScriptElement

  /**
   *
   * @param clientKey Snap client key
   * @param env 'production' | 'sandbox', default is `sandbox`
   */
  constructor (clientKey: string, env: SnapEnv = 'sandbox') {
    this.#clientKey = clientKey
    this.#env       = env
  }

  async #loadScript (): Promise<Snap> {
    if (window.snap !== undefined)
      return window.snap

    return await new Promise((resolve, reject) => {
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

      this.#scriptEl = script
    })
  }

  async pay (tokenOrUrl: string, options: UseSnapOptions = {}): Promise<SnapResult> {
    const regex = /\b[\da-f]{8}\b(?:-[\da-f]{4}){3}-\b[\da-f]{12}\b/gm // Extract token from url
    const match = regex.exec(tokenOrUrl)
    const token = match ? match[0] : tokenOrUrl
    const snap  = await this.#loadScript()

    return await new Promise((resolve, reject) => {
      snap.pay(token, {
        ...options,
        onSuccess (result) {
          resolve(result)
        },
        onPending (result) {
          resolve(result)
        },
        onError (result) {
          const message = result.status_message.join(', ') || 'Payment Error'
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
    // eslint-disable-next-line unicorn/no-await-expression-member
    (await this.#loadScript()).show()
  }

  async hide () {
    // eslint-disable-next-line unicorn/no-await-expression-member
    (await this.#loadScript()).hide()
  }

  destroy () {
    if (this.#scriptEl)
      this.#scriptEl.remove()
  }
}

let instance: MidtransSnap

export function initSnap (clientKey: string, env: SnapEnv = 'sandbox') {
  if (!clientKey)
    throw new Error('clientKey is required')

  if (instance)
    instance.destroy()

  instance = new MidtransSnap(clientKey, env)

  return instance
}

export function useSnap () {
  if (!instance)
    throw new Error('Snap has not initilized before, please call "initSnap()" first')

  return instance
}

export function isSnapError (error: unknown): error is SnapError {
  return (error instanceof SnapError)
}

export function isCancel (error: Error): error is SnapError {
  return isSnapError(error) && Boolean(error.isClosed)
}
