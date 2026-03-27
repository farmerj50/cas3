import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Cash 3 Edge",
};

const LAST_UPDATED = "March 23, 2026";
const APP_NAME = "Cash 3 Edge";
const CONTACT_EMAIL = "privacy@cash3edge.com"; // update before submitting to App Store

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#020b2d] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl space-y-8">

        <div>
          <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">
            ← Back
          </Link>
          <h1 className="mt-4 text-3xl font-bold">{APP_NAME} Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-400">Last updated: {LAST_UPDATED}</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">1. Overview</h2>
          <p className="text-slate-300 leading-relaxed">
            {APP_NAME} (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) provides a
            lottery analytics tool to help users track and analyze Pick-3 / Cash-3 lottery
            draw history. This policy describes what data we collect, how we use it, and
            your rights regarding that data.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex gap-2">
              <span className="mt-1 text-cyan-400">•</span>
              <span><strong className="text-white">Account information:</strong> Email address and encrypted password when you register.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 text-cyan-400">•</span>
              <span><strong className="text-white">Lottery data you enter:</strong> Draw results and saved picks you add to the app. This data is yours and stored solely to provide analytics.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 text-cyan-400">•</span>
              <span><strong className="text-white">Payment information:</strong> Premium subscriptions are processed by Stripe. We store only a Stripe customer ID — we never see or store your full card number.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 text-cyan-400">•</span>
              <span><strong className="text-white">Device push token:</strong> If you enable notifications, we store your device token to send draw reminders. You can disable this at any time in your device settings.</span>
            </li>
            <li className="flex gap-2">
              <span className="mt-1 text-cyan-400">•</span>
              <span><strong className="text-white">Usage logs:</strong> Basic server logs (IP address, request timestamp) retained for up to 30 days for security and debugging.</span>
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span>To provide, maintain, and improve the analytics features of the app.</span></li>
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span>To send draw result reminders and pick notifications (only if you opt in).</span></li>
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span>To process subscription payments through Stripe.</span></li>
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span>To detect and prevent fraud or abuse.</span></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Data Sharing</h2>
          <p className="text-slate-300 leading-relaxed">
            We do <strong className="text-white">not</strong> sell, rent, or share your
            personal data with third parties for marketing purposes. We share data only with:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span><strong className="text-white">Stripe</strong> — for payment processing. Subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Stripe&apos;s Privacy Policy</a>.</span></li>
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span><strong className="text-white">Firebase / Google</strong> — for delivery of push notifications. Subject to <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">Google&apos;s Privacy Policy</a>.</span></li>
            <li className="flex gap-2"><span className="mt-1 text-cyan-400">•</span><span><strong className="text-white">Law enforcement</strong> — only when required by applicable law.</span></li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Data Retention</h2>
          <p className="text-slate-300 leading-relaxed">
            Your account data is retained as long as your account is active. You may request
            deletion of your account and all associated data at any time by emailing us.
            Deleted data is purged within 30 days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">6. Security</h2>
          <p className="text-slate-300 leading-relaxed">
            Passwords are hashed using bcrypt. All data is transmitted over HTTPS. We do not
            store payment card numbers. We use industry-standard security practices but cannot
            guarantee absolute security.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">7. Children&apos;s Privacy</h2>
          <p className="text-slate-300 leading-relaxed">
            {APP_NAME} is not intended for users under the age of 18. Lottery games are
            restricted to adults in all supported jurisdictions. We do not knowingly collect
            information from anyone under 18.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">8. Your Rights</h2>
          <p className="text-slate-300 leading-relaxed">
            Depending on your jurisdiction you may have the right to access, correct, or
            delete your personal data. To exercise any of these rights, contact us at the
            address below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
          <p className="text-slate-300 leading-relaxed">
            We may update this policy from time to time. We will notify you of material
            changes via email or an in-app notice. Continued use after changes constitutes
            acceptance of the updated policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p className="text-slate-300">
            Questions or requests:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-400 underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </section>

      </div>
    </main>
  );
}
