'use client'

import { useState } from 'react'
import { useEmailStatus } from '@/hooks/use-email-status'
import { useWhatsAppConfig } from '@/hooks/use-whatsapp'
import { useVerificationConfig } from '@/hooks/use-verification'

function getProviderBadgeColor(provider: string) {
  switch (provider) {
    case 'ethereal':
      return 'bg-amber-100 text-amber-800'
    case 'smtp':
    case 'mailgun':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getWhatsAppProviderBadgeColor(provider: string) {
  switch (provider) {
    case 'twilio':
      return 'bg-green-100 text-green-800'
    case 'local':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getVerificationProviderBadgeColor(provider: string) {
  switch (provider) {
    case 'twilio':
      return 'bg-green-100 text-green-800'
    case 'local':
      return 'bg-amber-100 text-amber-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard API can be unavailable/throw in some contexts — no-op is fine here.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

export default function SettingsPage() {
  const { data, isLoading, error } = useEmailStatus()
  const {
    data: whatsAppConfig,
    isLoading: isWhatsAppLoading,
    error: whatsAppError,
  } = useWhatsAppConfig()
  const {
    data: verificationConfig,
    isLoading: isVerificationLoading,
    error: verificationError,
  } = useVerificationConfig()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        Error loading settings: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Email delivery</h2>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Active provider:</span>
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getProviderBadgeColor(data?.provider ?? '')}`}
          >
            {data?.provider}
          </span>
        </div>

        {data?.provider === 'ethereal' && data.ethereal && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600">
              Ethereal is a fake SMTP provider used for testing — messages never reach a real
              inbox. These credentials are session-scoped and regenerated every time the backend
              restarts, so if you log in to Ethereal and can&apos;t find messages you sent
              earlier, that&apos;s why.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                  Login URL
                </span>
                <a
                  href={data.ethereal.loginUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-900"
                >
                  {data.ethereal.loginUrl}
                </a>
              </div>

              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                  User
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                    {data.ethereal.user}
                  </code>
                  <CopyButton value={data.ethereal.user} />
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                  Password
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                    {data.ethereal.pass}
                  </code>
                  <CopyButton value={data.ethereal.pass} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">WhatsApp delivery</h2>

        {isWhatsAppLoading && (
          <div className="mt-3 flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        )}

        {whatsAppError && (
          <div className="mt-3 rounded-lg bg-red-50 p-4 text-red-800">
            Error loading WhatsApp settings:{' '}
            {whatsAppError instanceof Error ? whatsAppError.message : 'Unknown error'}
          </div>
        )}

        {whatsAppConfig && (
          <>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active provider:</span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getWhatsAppProviderBadgeColor(whatsAppConfig.provider)}`}
              >
                {whatsAppConfig.provider}
              </span>
            </div>

            {whatsAppConfig.provider === 'twilio' && whatsAppConfig.twilio && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div>
                  <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                    From number
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                      {whatsAppConfig.twilio.fromNumber}
                    </code>
                    <CopyButton value={whatsAppConfig.twilio.fromNumber} />
                  </div>
                </div>

                {whatsAppConfig.twilio.isDefaultSandboxNumber && (
                  <p className="mt-4 text-sm text-gray-600">
                    This is the default Twilio Sandbox number. Messages only reach numbers that
                    joined the sandbox via <code className="font-mono">join &lt;code&gt;</code> in
                    WhatsApp — real recipients need a production WhatsApp Business number instead.
                  </p>
                )}
              </div>
            )}

            {whatsAppConfig.provider === 'local' && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600">
                  Local/dev mode — no real WhatsApp messages are sent.
                  {whatsAppConfig.devMode &&
                    ' The admin dev tools (simulate reply, force-trigger follow-up) are available in this mode.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-900">Phone/email verification</h2>

        {isVerificationLoading && (
          <div className="mt-3 flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
          </div>
        )}

        {verificationError && (
          <div className="mt-3 rounded-lg bg-red-50 p-4 text-red-800">
            Error loading verification settings:{' '}
            {verificationError instanceof Error ? verificationError.message : 'Unknown error'}
          </div>
        )}

        {verificationConfig && (
          <>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active provider:</span>
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getVerificationProviderBadgeColor(verificationConfig.provider)}`}
              >
                {verificationConfig.provider}
              </span>
            </div>

            {verificationConfig.provider === 'local' && verificationConfig.devCode && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <p className="text-sm text-gray-600">
                  Local/dev mode — no real SMS/email is sent. Use the code below to confirm any
                  phone/email verification.
                </p>

                <div className="mt-4">
                  <span className="block text-xs font-medium uppercase tracking-wider text-gray-500">
                    Dev OTP code
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="rounded bg-gray-100 px-2 py-1 font-mono text-sm text-gray-800">
                      {verificationConfig.devCode}
                    </code>
                    <CopyButton value={verificationConfig.devCode} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
