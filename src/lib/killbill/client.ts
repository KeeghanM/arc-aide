import {
  KILLBILL_API_KEY,
  KILLBILL_API_SECRET,
  KILLBILL_PASSWORD,
  KILLBILL_URL,
  KILLBILL_USERNAME,
} from 'astro:env/server'
import { Buffer } from 'node:buffer'

export interface KillBillConfig {
  baseUrl: string
  username: string
  password: string
  apiKey: string
  apiSecret: string
}

export interface KillBillAccount {
  accountId: string
  name: string
  email: string
  currency: string
  externalKey: string
}

export interface KillBillSubscription {
  subscriptionId: string
  productName: string
  billingPeriod: string
  phaseType: string // TRIAL, EVERGREEN, etc.
  chargedThroughDate: string
  state: string // ACTIVE, CANCELLED, etc.
}

export interface KillBillInvoice {
  invoiceId: string
  amount: number
  currency: string
  invoiceDate: string
  status: string
}

export interface StripeSession {
  sessionId: string
  url?: string
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  baseTier: string // 'free' or 'premium'
  activeAddons: string[] // ['publishing', 'ai']
  isTrialActive: boolean
  trialEndsAt?: Date
  subscriptions: KillBillSubscription[]
  account?: KillBillAccount
  features: {
    hasPremium: boolean
    hasPublishing: boolean
    hasAI: boolean
  }
}

export class KillBillClient {
  private config: KillBillConfig
  private baseHeaders: Record<string, string>

  constructor(config: KillBillConfig) {
    this.config = config
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'X-Killbill-ApiKey': config.apiKey,
      'X-Killbill-ApiSecret': config.apiSecret,
      'X-Killbill-CreatedBy': 'arc-aide-app',
      'X-Killbill-Reason': 'User subscription management',
      'X-Killbill-Comment': 'Managed by Arc-Aide application',
      'Authorization': `Basic ${Buffer.from(`${config.username}:${config.password}`).toString('base64')}`,
    }
  }

  async findAccountByExternalKey(
    externalKey: string
  ): Promise<KillBillAccount | null> {
    try {
      // Use the correct Kill Bill API endpoint for finding by external key
      const searchUrl = `${this.config.baseUrl}/1.0/kb/accounts?externalKey=${encodeURIComponent(externalKey)}`
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: this.baseHeaders,
      })

      if (response.status === 404) return null
      if (!response.ok) {
        throw new Error(
          `KB API error when finding account: ${response.status} - ${response.statusText}`
        )
      }

      // According to Kill Bill docs, this endpoint returns a single account object (not an array)
      const account = await response.json()

      // Verify the external key matches (safety check)
      if (account && account.externalKey === externalKey) {
        return account
      }

      return null
    } catch (error) {
      // Only catch and return null for network errors that aren't API errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error finding KB account:', error)
        return null
      }
      // Re-throw API errors and other errors
      throw error
    }
  }

  async createAccount(
    userId: string,
    name: string,
    email: string
  ): Promise<KillBillAccount> {
    const accountData = {
      name,
      email,
      currency: 'USD',
      externalKey: userId,
    }

    const response = await fetch(`${this.config.baseUrl}/1.0/kb/accounts`, {
      method: 'POST',
      headers: this.baseHeaders,
      body: JSON.stringify(accountData),
    })

    if (response.status === 409) {
      // Account already exists, try to find it
      console.log(
        `Account with external key ${userId} already exists, attempting to find it`
      )
      try {
        const existingAccount = await this.findAccountByExternalKey(userId)
        if (existingAccount) {
          console.log(
            `Successfully found existing account: ${existingAccount.accountId}`
          )
          return existingAccount
        }
        console.log(
          `Could not find existing account with external key: ${userId}`
        )
      } catch (findError) {
        console.error(`Error while trying to find existing account:`, findError)
      }
      throw new Error(
        `Account conflict (409) but unable to find existing account with external key: ${userId}`
      )
    }

    if (!response.ok) {
      throw new Error(
        `Failed to create KB account: ${response.status} - ${response.statusText}`
      )
    }

    return await response.json()
  }

  async findOrCreateAccount(
    userId: string,
    name: string,
    email: string
  ): Promise<KillBillAccount> {
    try {
      // First, try to find the existing account
      let account = await this.findAccountByExternalKey(userId)

      if (!account) {
        // Account doesn't exist, create it
        account = await this.createAccount(userId, name, email)
      }

      return account
    } catch (error) {
      console.error(`Error in findOrCreateAccount for user ${userId}:`, error)
      throw new Error(
        `Failed to find or create Kill Bill account: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  async getAccountSubscriptions(
    accountId: string
  ): Promise<KillBillSubscription[]> {
    const response = await fetch(
      `${this.config.baseUrl}/1.0/kb/accounts/${accountId}/subscriptions`,
      {
        method: 'GET',
        headers: this.baseHeaders,
      }
    )

    // 404 means no subscriptions exist for this account, which is normal
    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch subscriptions: ${response.status} - ${response.statusText}`
      )
    }

    return await response.json()
  }

  async getAccountInvoices(accountId: string): Promise<KillBillInvoice[]> {
    const response = await fetch(
      `${this.config.baseUrl}/1.0/kb/accounts/${accountId}/invoices`,
      {
        method: 'GET',
        headers: this.baseHeaders,
      }
    )

    // 404 means no invoices exist for this account, which is normal for new accounts
    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new Error(
        `Failed to fetch invoices: ${response.status} - ${response.statusText}`
      )
    }

    return await response.json()
  }

  async createStripeCheckoutSession(
    accountId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<StripeSession> {
    const params = new URLSearchParams({
      kbAccountId: accountId,
      successUrl,
      cancelUrl,
    })

    const response = await fetch(
      `${this.config.baseUrl}/plugins/killbill-stripe/checkout?${params}`,
      {
        method: 'POST',
        headers: this.baseHeaders,
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to create Stripe session: ${response.status}`)
    }

    const data = await response.json()
    const sessionId = data.formFields?.find(
      (field: any) => field.key === 'id'
    )?.value

    if (!sessionId) {
      throw new Error('No session ID returned from Kill Bill')
    }

    return { sessionId }
  }

  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const account = await this.findAccountByExternalKey(userId)
      if (!account) {
        return {
          hasActiveSubscription: false,
          baseTier: 'free',
          activeAddons: [],
          isTrialActive: false,
          subscriptions: [],
          features: {
            hasPremium: false,
            hasPublishing: false,
            hasAI: false,
          },
        }
      }

      const subscriptions = await this.getAccountSubscriptions(
        account.accountId
      )
      const activeSubscriptions = subscriptions.filter(
        (sub) => sub.state === 'ACTIVE'
      )

      if (activeSubscriptions.length === 0) {
        return {
          hasActiveSubscription: false,
          baseTier: 'free',
          activeAddons: [],
          isTrialActive: false,
          subscriptions,
          account,
          features: {
            hasPremium: false,
            hasPublishing: false,
            hasAI: false,
          },
        }
      }

      // Separate base subscriptions from add-ons
      const baseSubscriptions = activeSubscriptions.filter((sub) =>
        this.isBaseProduct(sub.productName)
      )
      const addonSubscriptions = activeSubscriptions.filter((sub) =>
        this.isAddonProduct(sub.productName)
      )

      // Determine base tier (Premium takes precedence over Free)
      const baseTier = baseSubscriptions.some(
        (sub) => sub.productName === 'Premium'
      )
        ? 'premium'
        : 'free'

      // Get active add-ons
      const activeAddons = addonSubscriptions.map((sub) =>
        this.mapProductNameToTier(sub.productName)
      )

      // Check if any subscription is in trial
      const isTrialActive = activeSubscriptions.some(
        (sub) => sub.phaseType === 'TRIAL'
      )
      const trialSub = activeSubscriptions.find(
        (sub) => sub.phaseType === 'TRIAL'
      )

      return {
        hasActiveSubscription:
          baseTier === 'premium' || activeAddons.length > 0,
        baseTier,
        activeAddons,
        isTrialActive,
        trialEndsAt:
          isTrialActive && trialSub
            ? new Date(trialSub.chargedThroughDate)
            : undefined,
        subscriptions,
        account,
        features: {
          hasPremium: baseTier === 'premium',
          hasPublishing: activeAddons.includes('publishing'),
          hasAI: activeAddons.includes('ai'),
        },
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error)
      throw error
    }
  }

  private isBaseProduct(productName: string): boolean {
    return ['Free', 'Premium'].includes(productName)
  }

  private isAddonProduct(productName: string): boolean {
    return ['Publishing', 'AI'].includes(productName)
  }

  private mapProductNameToTier(productName: string): string {
    // Map your Kill Bill product names to display tiers
    const mapping: Record<string, string> = {
      Free: 'free',
      Premium: 'premium',
      Publishing: 'publishing',
      AI: 'ai',
    }
    return mapping[productName] || 'unknown'
  }
}

// Environment-based client
export const killBillClient = new KillBillClient({
  baseUrl: KILLBILL_URL,
  username: KILLBILL_USERNAME,
  password: KILLBILL_PASSWORD,
  apiKey: KILLBILL_API_KEY,
  apiSecret: KILLBILL_API_SECRET,
})
