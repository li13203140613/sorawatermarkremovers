import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Sora Watermark Remover',
  description: 'Privacy policy for Sora Video Watermark Remover Chrome Extension',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            For Sora Video Watermark Remover Chrome Extension
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last Updated: October 17, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">

          {/* Introduction */}
          <section>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy describes how Sora Video Watermark Remover (&quot;we&quot;, &quot;our&quot;, or &quot;the Extension&quot;)
              collects, uses, and protects your personal information when you use our Chrome extension.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Information We Collect
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  1.1 Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Email address (from Google OAuth sign-in)</li>
                  <li>Google account ID (for authentication)</li>
                  <li>Profile name and avatar (optional, from Google account)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  1.2 Usage Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Video URLs you download from Sora</li>
                  <li>Credit usage history and transaction records</li>
                  <li>Extension installation and usage statistics</li>
                  <li>Browser type and version</li>
                  <li>Timestamps of actions performed</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  1.3 Technical Data
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                  <li>Authentication tokens (stored locally)</li>
                  <li>Session information</li>
                  <li>API request logs</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Authenticate your identity and provide secure access</li>
              <li>Manage your credit balance and process transactions</li>
              <li>Process video watermark removal requests</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our service and user experience</li>
              <li>Send important updates about the service</li>
              <li>Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          {/* Data Storage and Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Data Storage and Security
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Security Measures:</strong> We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>HTTPS encryption for all data transmission</li>
                <li>Secure OAuth 2.0 authentication with Google</li>
                <li>Encrypted storage of authentication tokens</li>
                <li>Regular security audits and updates</li>
              </ul>
              <p className="mt-3">
                <strong>Data Retention:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Video URLs are processed temporarily and not permanently stored</li>
                <li>User account data is retained until account deletion</li>
                <li>Usage logs are retained for 90 days for service improvement</li>
              </ul>
            </div>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Data Sharing and Third Parties
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">We DO NOT:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Sell your personal information to third parties</li>
                <li>Share your data for advertising purposes</li>
                <li>Use your data for purposes unrelated to video processing</li>
                <li>Share your browsing history or video content</li>
              </ul>

              <p className="font-semibold mt-4">We MAY share data with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google:</strong> For OAuth authentication services</li>
                <li><strong>Supabase:</strong> Our database and authentication provider</li>
                <li><strong>Stripe:</strong> For secure payment processing (we don&apos;t store card details)</li>
                <li><strong>API Service:</strong> For video watermark removal processing</li>
              </ul>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Your Rights
            </h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update incorrect or incomplete information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Stop using the service at any time</li>
              <li><strong>Withdraw Consent:</strong> Revoke permissions given to the extension</li>
            </ul>
            <p className="text-gray-700 mt-3">
              To exercise these rights, contact us at <a href="mailto:support@sorawatermarkremovers.com" className="text-purple-600 hover:underline">support@sorawatermarkremovers.com</a>
            </p>
          </section>

          {/* Cookies and Local Storage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Cookies and Local Storage
            </h2>
            <p className="text-gray-700 mb-3">
              We use browser local storage (not cookies) to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Keep you signed in across browser sessions</li>
              <li>Remember your preferences and settings</li>
              <li>Store authentication tokens securely in your browser</li>
              <li>Cache frequently used data for better performance</li>
            </ul>
            <p className="text-gray-700 mt-3">
              This data is stored locally on your device and can be cleared by uninstalling the extension.
            </p>
          </section>

          {/* Chrome Extension Permissions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Chrome Extension Permissions
            </h2>
            <p className="text-gray-700 mb-3">Our extension requests the following permissions:</p>
            <div className="space-y-3 text-gray-700">
              <div>
                <p><strong>identity:</strong> For Google OAuth sign-in</p>
              </div>
              <div>
                <p><strong>storage:</strong> To save authentication tokens locally</p>
              </div>
              <div>
                <p><strong>downloads:</strong> To save watermark-free videos to your computer</p>
              </div>
              <div>
                <p><strong>tabs:</strong> To detect Sora video pages and inject the download button</p>
              </div>
              <div>
                <p><strong>Host permissions (sora.chatgpt.com):</strong> To access Sora video pages</p>
              </div>
              <div>
                <p><strong>Host permissions (www.sorawatermarkremovers.com):</strong> To communicate with our API</p>
              </div>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Children&apos;s Privacy
            </h2>
            <p className="text-gray-700">
              Our service is not intended for users under 13 years of age. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe
              your child has provided us with personal information, please contact us to have it removed.
            </p>
          </section>

          {/* International Data Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. International Data Transfers
            </h2>
            <p className="text-gray-700">
              Your data may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data in accordance
              with this privacy policy and applicable laws.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              10. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700">
              We may update this privacy policy from time to time to reflect changes in our practices
              or for legal, operational, or regulatory reasons. We will notify users of significant
              changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Updating the &quot;Last Updated&quot; date at the top of this policy</li>
              <li>Sending an email notification for material changes</li>
              <li>Displaying a notice in the extension</li>
            </ul>
          </section>

          {/* Compliance */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              11. Legal Compliance
            </h2>
            <p className="text-gray-700 mb-3">This extension complies with:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Chrome Web Store Developer Program Policies</strong></li>
              <li><strong>GDPR</strong> (General Data Protection Regulation) for EU users</li>
              <li><strong>CCPA</strong> (California Consumer Privacy Act) for California residents</li>
              <li><strong>Other applicable privacy laws and regulations</strong></li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 mb-3">
              If you have any questions, concerns, or requests regarding this privacy policy
              or our data practices, please contact us:
            </p>
            <div className="bg-purple-50 p-6 rounded-lg space-y-2">
              <p className="text-gray-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@sorawatermarkremovers.com" className="text-purple-600 hover:underline">
                  support@sorawatermarkremovers.com
                </a>
              </p>
              <p className="text-gray-700">
                <strong>Website:</strong>{' '}
                <a href="https://www.sorawatermarkremovers.com" className="text-purple-600 hover:underline">
                  https://www.sorawatermarkremovers.com
                </a>
              </p>
            </div>
            <p className="text-gray-700 mt-4">
              We will respond to your inquiry within 30 days.
            </p>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-6">
            <p className="text-gray-600 italic">
              By using the Sora Video Watermark Remover Chrome Extension, you acknowledge that you
              have read and understood this Privacy Policy and agree to its terms.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            â†?Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
