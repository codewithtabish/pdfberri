export function PrivacyContent() {
  return (
    <div className="flex-1 max-w-3xl space-y-12">
      {/* Section 1 */}
      <section id="introduction" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Welcome to PDFBerri. We are committed to protecting your personal information and your right to privacy. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our PDF tools and AI services.
          </p>
          <p>
            By using PDFBerri, you agree to the collection and use of information in accordance with this policy. 
            We will not use or share your information with anyone except as described in this Privacy Policy.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id="information-we-collect" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>We collect information that you voluntarily provide to us when you use our services:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> If you create an account, we collect your name, email address, and authentication details.</li>
            <li><strong>Uploaded Documents:</strong> Files you upload for processing. These are processed securely and deleted according to our retention policy.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, and pages visited.</li>
          </ul>
        </div>
      </section>

      {/* Section 3 */}
      <section id="how-we-use" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>We use the information we collect or receive to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Provide, operate, and maintain our services.</li>
            <li>Process your PDF documents and execute requested tasks.</li>
            <li>Improve, personalize, and expand our website and tools.</li>
            <li>Communicate with you regarding updates, support, and security alerts.</li>
          </ul>
        </div>
      </section>

      {/* Section 4 */}
      <section id="document-processing" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">4. Document Processing</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            PDFBerri utilizes both local browser processing and secure server-side processing depending on the tool.
            When files are processed on our servers, they are transmitted using secure encryption (HTTPS).
          </p>
          <p>
            <strong>Retention:</strong> Uploaded files are automatically deleted from our servers after a short period (typically within 2 hours) unless you explicitly save them to an account.
          </p>
        </div>
      </section>

      {/* Section 5 */}
      <section id="ai-features" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">5. AI Features & Data</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            When you use our AI-powered tools (such as Chat with PDF or AI Summarizer), the text from your document may be sent to our secure AI processing partners.
          </p>
          <p>
            We do not use your uploaded documents to train public AI models. Your data is processed temporarily and securely to provide the requested AI output.
          </p>
        </div>
      </section>

      {/* Section 6 */}
      <section id="data-security" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Security</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. 
            However, please also remember that we cannot guarantee that the internet itself is 100% secure.
          </p>
        </div>
      </section>

      {/* Section 7 */}
      <section id="your-rights" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">7. Your Privacy Rights</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Depending on your location, you may have the right to request access to, correct, or delete the personal information we hold about you. 
            You can contact us to exercise these rights.
          </p>
        </div>
      </section>

      {/* Section 8 */}
      <section id="contact" className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-foreground mb-4">8. Contact Us</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
            <br />
            <strong>Email:</strong> privacy@pdfberri.com
          </p>
        </div>
      </section>
    </div>
  );
}