export function CookiesContent() {
  return (
    <div className="max-w-3xl flex-1 space-y-12 pb-16">
      
      <section id="introduction" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">1. Introduction</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>This Cookie Policy explains how PDFBerri uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are, why we use them, and your rights to control our use of them.</p>
          <p>This policy should be read together with our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>, which outlines how we handle personal data.</p>
        </div>
      </section>

      <section id="what-are-cookies" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">2. What Are Cookies?</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>Cookies are small text files that are stored on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Session cookies:</strong> These are temporary and expire when you close your browser.</li>
            <li><strong>Persistent cookies:</strong> These remain on your device until they expire or you delete them.</li>
            <li><strong>First-party cookies:</strong> Set by the website you are visiting.</li>
            <li><strong>Third-party cookies:</strong> Set by a domain other than the one you are visiting.</li>
          </ul>
          <p>We may also use similar technologies like local storage, pixels, and tags to improve your experience.</p>
        </div>
      </section>

      <section id="why-we-use" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">3. Why We Use Cookies</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>We use cookies and similar technologies for several purposes, including:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Operating our website and ensuring core functionality.</li>
            <li>Remembering your preferences and settings.</li>
            <li>Understanding how visitors use our website to improve performance.</li>
            <li>Measuring the effectiveness of our marketing and advertising.</li>
          </ul>
        </div>
      </section>

      <section id="types-of-cookies" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">4. Types of Cookies We May Use</h2>
        <div className="space-y-6 leading-relaxed text-muted-foreground">
          
          {/* Category 1 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">A. Strictly Necessary Cookies</h3>
            <p className="mb-2">These cookies are essential to provide you with services available through our website and to use some of its features, such as accessing secure areas or processing documents.</p>
            <p className="text-sm font-medium text-foreground">Consent: Generally not required, as these are essential for the website to function.</p>
          </div>

          {/* Category 2 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">B. Functional Cookies</h3>
            <p className="mb-2">These cookies allow us to remember choices you make when you use our website, such as remembering your language preference or UI settings.</p>
            <p className="text-sm font-medium text-foreground">Consent: May be required depending on applicable law.</p>
          </div>

          {/* Category 3 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">C. Analytics and Performance Cookies</h3>
            <p className="mb-2">These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve the user experience.</p>
            <p className="text-sm font-medium text-foreground">Consent: Generally required where implemented.</p>
          </div>

          {/* Category 4 */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-2 text-lg font-bold text-foreground">D. Advertising and Marketing Cookies</h3>
            <p className="mb-2">These cookies are used to make advertising messages more relevant to you and your interests. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements based on your interests.</p>
            <p className="text-sm font-medium text-foreground">Consent: Required under most privacy laws for non-essential advertising.</p>
          </div>

        </div>
      </section>

      <section id="third-party" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">5. Third-Party Cookies and Services</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>In addition to our own cookies, we may also use various third-party cookies to report usage statistics of the website, deliver advertisements on and through the website, and so on.</p>
          <p>Third-party advertising providers (such as Google AdSense, if integrated) may use cookies to serve ads based on your prior visits to this website or other websites. Third parties operate under their own privacy and cookie policies.</p>
        </div>
      </section>

      <section id="how-we-use" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">6. How We Use Cookie Information</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>Information collected through cookies may be used to maintain functionality, remember preferences, understand usage trends, improve performance, support advertising, and detect misuse or security issues.</p>
          <p>Cookies do not typically contain information that personally identifies you, but personal information that we store about you may be linked to the information obtained from cookies.</p>
        </div>
      </section>

      <section id="managing" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">7. Managing Your Cookie Preferences</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies.</p>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-primary">
            <strong>Note:</strong> If a dedicated cookie consent banner or preference center is implemented on PDFBerri, you will be able to manage your choices there. Currently, you should manage your preferences via your browser settings.
          </div>
        </div>
      </section>

      <section id="browser-controls" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">8. Browser Cookie Controls</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>Most web browsers allow you to manage cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser.</p>
          <p>If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.</p>
        </div>
      </section>

      <section id="retention" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">9. Cookie Retention</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>The length of time that a cookie remains on your device depends on whether it is a "session" or "persistent" cookie. Session cookies last until you close your browser. Persistent cookies last until they expire or are deleted.</p>
          <p>Where third-party cookies are used, the retention periods are determined by the third-party providers.</p>
        </div>
      </section>

      <section id="international" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">10. International Visitors and Privacy Rights</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>Visitors from different jurisdictions may have different rights concerning cookies and tracking technologies. We aim to comply with applicable privacy and electronic communications regulations in the regions we operate.</p>
        </div>
      </section>

      <section id="changes" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">11. Changes to This Cookie Policy</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>We may update this Cookie Policy from time to time to reflect changes in our technologies, services, and legal obligations. The "Last updated" date at the top of this page will reflect the most recent revision.</p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24">
        <h2 className="mb-4 text-2xl font-bold text-foreground">12. Contact Us</h2>
        <div className="space-y-4 leading-relaxed text-muted-foreground">
          <p>If you have questions about our use of cookies or other technologies, please contact us at:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li><strong>Email:</strong> privacy@pdfberri.com</li>
            <li><strong>Contact Page:</strong> <a href="/contact" className="text-primary hover:underline">https://www.pdfberri.com/contact</a></li>
          </ul>
        </div>
      </section>

    </div>
  );
}