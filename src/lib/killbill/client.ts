import {
  KILLBILL_API_KEY,
  KILLBILL_API_SECRET,
  KILLBILL_PASSWORD,
  KILLBILL_URL,
  KILLBILL_USERNAME,
} from 'astro:env/server'
import globalAxios from 'axios'
import killbill from 'killbill'

const axios = globalAxios.create()

const config = new killbill.Configuration({
  basePath: KILLBILL_URL,
  username: KILLBILL_USERNAME,
  password: KILLBILL_PASSWORD,
  apiKey: killbill.apiKey(KILLBILL_API_KEY, KILLBILL_API_SECRET),
})

const killBillAccountApi = new killbill.AccountApi(config, KILLBILL_URL, axios)
const killBillSubscriptionApi = new killbill.SubscriptionApi(
  config,
  KILLBILL_URL,
  axios
)

enum PRODUCTS {
  'premium-monthly' = 'Premium',
  'ai-monthly' = 'AI',
  'publishing-monthly' = 'Publishing',
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  baseTier: 'free' | 'premium'
  activeAddons: string[]
  isTrialActive: boolean
  trialEndsAt?: string
  features: {
    hasPremium: boolean
    hasPublishing: boolean
    hasAI: boolean
  }
  subscriptions?: Array<{
    subscriptionId: string
    productName: string
    state: string
    phaseType?: string
  }>
}

export interface KBAccount {
  accountId: string
  externalKey: string
  name: string
  email: string
}

// KillBill Client following the Ruby example pattern
class KillBillClient {
  private options = {
    username: KILLBILL_USERNAME,
    password: KILLBILL_PASSWORD,
    apiKey: KILLBILL_API_KEY,
    apiSecret: KILLBILL_API_SECRET,
  }

  private auditData = {
    user: 'arc-aide-system',
    reason: 'New subscription',
    comment: 'Triggered by Arc-Aide',
  }

  // Create KB Account (equivalent to create_kb_account in Ruby)
  async createKbAccount(
    externalKey: string,
    name: string,
    email: string
  ): Promise<KBAccount> {
    const accountData: killbill.Account = {
      name,
      email,
      externalKey,
      currency: 'USD',
    }

    const response = await killBillAccountApi.createAccount(
      accountData,
      this.auditData.user,
      this.auditData.reason,
      this.auditData.comment
    )

    return {
      accountId: response.data.accountId!,
      externalKey: response.data.externalKey!,
      name: response.data.name!,
      email: response.data.email!,
    }
  }

  // Find account by external key
  async findAccountByExternalKey(
    externalKey: string
  ): Promise<KBAccount | null> {
    try {
      const response = await killBillAccountApi.getAccountByKey(externalKey)
      return {
        accountId: response.data.accountId!,
        externalKey: response.data.externalKey!,
        name: response.data.name!,
        email: response.data.email!,
      }
    } catch {
      return null
    }
  }

  // Find or create account
  async findOrCreateAccount(
    externalKey: string,
    name: string,
    email: string
  ): Promise<KBAccount> {
    const existing = await this.findAccountByExternalKey(externalKey)
    if (existing) return existing
    return this.createKbAccount(externalKey, name, email)
  }

  // Create Stripe session (equivalent to create_session in Ruby)
  async createSession(accountId: string, successUrl: string): Promise<string> {
    try {
      const pluginEndpoint = `${KILLBILL_URL}/plugins/killbill-stripe/checkout`

      const requestData = {
        kbAccountId: accountId,
        successUrl: successUrl,
      }

      const response = await axios.post(pluginEndpoint, null, {
        params: requestData,
        auth: {
          username: KILLBILL_USERNAME,
          password: KILLBILL_PASSWORD,
        },
        headers: {
          'X-Killbill-ApiKey': KILLBILL_API_KEY,
          'X-Killbill-ApiSecret': KILLBILL_API_SECRET,
          'Content-Type': 'application/json',
        },
      })

      // Extract session ID from response (following Ruby example)
      const formFields = response.data.formFields || []
      const sessionIdField = formFields.find((field: any) => field.key === 'id')

      if (!sessionIdField) {
        throw new Error('No session ID returned from KillBill Stripe plugin')
      }

      return sessionIdField.value
    } catch (error) {
      console.error('Error creating session via KillBill:', error)
      throw error
    }
  }

  // Create payment method (equivalent to create_kb_payment_method in Ruby)
  async createKbPaymentMethod(
    accountId: string,
    sessionId?: string,
    token?: string
  ): Promise<killbill.PaymentMethod> {
    const paymentMethodData: killbill.PaymentMethod = {
      accountId,
      pluginName: 'killbill-stripe',
    }

    // Create plugin properties for Stripe (following Ruby example)
    const pluginProperties: string[] = []
    if (token) {
      pluginProperties.push(`token=${token}`)
    } else if (sessionId) {
      pluginProperties.push(`sessionId=${sessionId}`)
    }

    const response = await killBillAccountApi.createPaymentMethod(
      paymentMethodData,
      accountId,
      this.auditData.user,
      true, // isDefault
      false, // payAllUnpaidInvoices
      undefined, // controlPluginName
      pluginProperties
    )

    return response.data
  }

  // Create subscription (equivalent to create_subscription in Ruby)
  async createSubscription(
    accountId: string,
    productId: string = 'premium-monthly'
  ): Promise<killbill.Subscription> {
    const productName =
      PRODUCTS[productId as keyof typeof PRODUCTS] || 'Premium'

    // This cast is necessary because TypeScript expects both productName and planName to be defined, but that causes "400: message: 'SubscriptionJson productName should not be set when planName is specified'"
    const subscriptionData = {
      accountId,
      productName,
      productCategory: 'BASE' as any,
      billingPeriod: 'MONTHLY' as any,
      priceList: 'DEFAULT',
      // priceOverrides: [...]
    } as killbill.Subscription

    const response = await killBillSubscriptionApi.createSubscription(
      subscriptionData,
      this.auditData.user,
      undefined, // entitlementDate
      undefined, // billingDate
      undefined, // renameKeyIfExistsAndUnused
      undefined, // migrated
      undefined, // skipResponse
      true, // callCompletion
      20 // callTimeoutSec
    )

    return response.data
  }

  // Complete charge process (equivalent to charge function in Ruby)
  async charge(
    accountId: string,
    sessionId?: string,
    token?: string
  ): Promise<{
    invoice: any
    paymentMethod: killbill.PaymentMethod
    subscription: killbill.Subscription
  }> {
    // Add a payment method associated with the Stripe token/session
    const paymentMethod = await this.createKbPaymentMethod(
      accountId,
      sessionId,
      token
    )

    // Add a subscription
    const subscription = await this.createSubscription(accountId)

    // Get the invoice (in the Ruby example they get account.invoices.first)
    const invoicesResponse =
      await killBillAccountApi.getInvoicesForAccount(accountId)
    const invoice = invoicesResponse.data[0] // Most recent invoice

    return { invoice, paymentMethod, subscription }
  }

  // Get subscription status
  async getSubscriptionStatus(
    userExternalKey: string
  ): Promise<SubscriptionStatus> {
    try {
      const account = await this.findAccountByExternalKey(userExternalKey)
      if (!account) {
        return this.getDefaultSubscriptionStatus()
      }

      const bundlesResponse = await killBillAccountApi.getAccountBundles(
        account.accountId
      )
      const subscriptions: killbill.Subscription[] = []

      for (const bundle of bundlesResponse.data) {
        if (bundle.subscriptions) {
          subscriptions.push(...bundle.subscriptions)
        }
      }

      const activeSubscriptions = subscriptions.filter(
        (sub) => sub.state === 'ACTIVE'
      )
      const hasActiveSubscription = activeSubscriptions.length > 0

      // Determine features based on subscriptions
      let baseTier: 'free' | 'premium' = 'free'
      const activeAddons: string[] = []
      let isTrialActive = false

      for (const sub of activeSubscriptions) {
        if (sub.productName?.toLowerCase().includes('premium')) {
          baseTier = 'premium'
        }
        if (sub.productName?.toLowerCase().includes('publishing')) {
          activeAddons.push('publishing')
        }
        if (sub.productName?.toLowerCase().includes('ai')) {
          activeAddons.push('ai')
        }
        if (sub.phaseType === 'TRIAL') {
          isTrialActive = true
        }
      }

      return {
        hasActiveSubscription,
        baseTier,
        activeAddons,
        isTrialActive,
        features: {
          hasPremium: baseTier === 'premium',
          hasPublishing: activeAddons.includes('publishing'),
          hasAI: activeAddons.includes('ai'),
        },
        subscriptions: activeSubscriptions.map((sub) => ({
          subscriptionId: sub.subscriptionId!,
          productName: sub.productName || 'Unknown',
          state: sub.state!,
          phaseType: sub.phaseType,
        })),
      }
    } catch (error) {
      console.error('Error getting subscription status:', error)
      return this.getDefaultSubscriptionStatus()
    }
  }

  private getDefaultSubscriptionStatus(): SubscriptionStatus {
    return {
      hasActiveSubscription: false,
      baseTier: 'free',
      activeAddons: [],
      isTrialActive: false,
      features: {
        hasPremium: false,
        hasPublishing: false,
        hasAI: false,
      },
    }
  }
}

// Export singleton instance
export const killBillClient = new KillBillClient()

// Export APIs for direct use if needed
export { killBillAccountApi, killBillSubscriptionApi }
