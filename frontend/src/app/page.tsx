import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="fixed w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">Lionsight</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Features</Link>
              <Link href="#about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About</Link>
              <Link href="/login" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Login</Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Intelligent Business Insights
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Transform your business data into actionable insights with our advanced analytics platform.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/signup" className="px-8 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              Get Started
            </Link>
            <Link href="#demo" className="px-8 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Powerful Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Analytics",
                description: "Monitor your business metrics in real-time with advanced data visualization.",
                icon: "📊"
              },
              {
                title: "AI-Powered Insights",
                description: "Leverage machine learning to uncover hidden patterns and trends in your data.",
                icon: "🤖"
              },
              {
                title: "Custom Reports",
                description: "Generate detailed reports tailored to your specific business needs.",
                icon: "📑"
              }
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lionsight</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Transforming business data into actionable insights.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="#about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">About</Link></li>
                <li><Link href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 text-center text-gray-600 dark:text-gray-300">
            <p>&copy; {new Date().getFullYear()} Lionsight. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
