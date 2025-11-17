import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Sora Watermark Remover',
  description: 'Privacy policy for Sora Watermark Remover.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">For Sora Watermark Remover</p>
          <p className="text-sm text-gray-500 mt-2">Last Updated: October 17, 2025</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8">
          <section>
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy describes how Sora Watermark Remover (&quot;we&quot;, &quot;our&quot;, or &quot;the
              Service&quot;) collects, uses, and protects your personal information when you use our product.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                <strong>Account Information:</strong> Email and basic profile details from sign-in providers.
              </li>
              <li>
                <strong>Usage Data:</strong> Requests, credits consumed, timestamps, and error logs to improve stability.
              </li>
              <li>
                <strong>Device Data:</strong> Browser user agent and IP for security, abuse prevention, and analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Information</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide watermark removal and account services.</li>
              <li>Detect fraud and protect platform security.</li>
              <li>Improve performance, UX, and service reliability.</li>
              <li>Comply with legal obligations where applicable.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Sharing</h2>
            <p className="text-gray-700 leading-relaxed">
              We do not sell personal data. We may share limited data with infrastructure providers (e.g., hosting,
              storage, email) strictly to operate the service, under confidentiality and security requirements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain data only for as long as needed for the purposes described. Logs used for debugging and abuse
              prevention are kept for a limited period and then deleted or anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              You may request access, correction, or deletion of your personal data, subject to legal and security
              constraints. Contact us using the email below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We apply industry-standard measures to protect data in transit and at rest, including encryption and
              access controls. No method is 100% secure; please contact us if you discover potential vulnerabilities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy questions or requests, email{' '}
              <a href="mailto:privacy@sorawatermarkremovers.com" className="text-purple-600 hover:underline">
                privacy@sorawatermarkremovers.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
