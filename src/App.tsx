import React, { useState } from "react";
import {
  Download,
  ShieldCheck,
  Star,
  CheckCircle,
  Lock,
  FileText,
  ChevronRight,
  Mail,
  CreditCard,
  Smartphone,
  X,
  Menu,
} from "lucide-react";

// --- TYPESCRIPT DEFINITIONS ---
declare global {
  interface Window {
    RazorpayBS: any;
    Razorpay: any;
  }
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  downloadLink: string;
  features: string[];
}

interface Customer {
  name: string;
  email: string;
}

// --- PRODUCT CONFIGURATION ---
const PRODUCT: Product = {
  id: "PDF-001",
  title: "Premium Study PDF",
  description:
    "The ultimate guide to mastering your studies. concise, actionable, and designed for high retention.",
  price: 499,
  originalPrice: 999,
  rating: 4.9,
  reviews: 1542,
  downloadLink:
    "https://drive.google.com/file/d/16XL0NWy7SkXPaMXWpzx68pLqgF3S0se3/view",
  features: [
    "Instant PDF Download",
    "Mobile & Tablet Friendly",
    "Lifetime Access",
    "Printable High-Quality Layout",
  ],
};

// --- COMPONENTS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "razorpay" | "outline";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) => {
  const baseStyle =
    "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30",
    secondary:
      "bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50",
    razorpay: "bg-[#0c238a] text-white hover:bg-[#0e2aa0] shadow-md", // Razorpay Blue brand color
    outline:
      "bg-transparent text-slate-600 border border-slate-200 hover:border-slate-400",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
    {children}
  </span>
);

// --- MAIN APP COMPONENT ---

export default function App() {
  const [view, setView] = useState<"home" | "success">("home");
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customer, setCustomer] = useState<Customer>({ name: "", email: "" });

  // --- HANDLERS ---

  const handleBuyNow = () => {
    setShowCheckout(true);
  };

  // Helper to load Razorpay Script dynamically
  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // 1. Load Razorpay SDK
    const res = await loadScript(
      "https://checkout.razorpay.com/v1/checkout.js"
    );

    if (!res) {
      alert(
        "Razorpay SDK failed to load. Please check your internet connection."
      );
      setIsProcessing(false);
      return;
    }

    // 2. Setup Options
    const options = {
      key: "rzp_test_RvTVPXYu2MB10d", // User provided Key ID
      amount: PRODUCT.price * 100, // Amount is in paise (499 * 100 = 49900)
      currency: "INR",
      name: "StudyPremium",
      description: PRODUCT.title,
      image: "https://cdn-icons-png.flaticon.com/512/337/337946.png", // Added a generic PDF logo
      handler: function (response: any) {
        // 3. Handle Success
        setIsProcessing(false);
        setShowCheckout(false);
        setView("success");
        window.scrollTo(0, 0);
        console.log("Payment ID: ", response.razorpay_payment_id);
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: "", // Left empty to let user fill in Razorpay popup if needed
      },
      notes: {
        address: "Razorpay Corporate Office",
      },
      theme: {
        color: "#2563eb", // Brand Blue
      },
      modal: {
        ondismiss: function() {
            setIsProcessing(false);
        }
      }
    };

    // 4. Open Razorpay
    try {
      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error) {
      console.error("Razorpay Error:", error);
      setIsProcessing(false);
      alert("Something went wrong with the payment gateway.");
    }
  };

  // --- VIEWS ---

  const Navbar = () => (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 font-bold text-xl text-slate-900 cursor-pointer"
          onClick={() => setView("home")}
        >
          <FileText className="text-blue-600" />
          <span>
            Study<span className="text-blue-600">Premium</span>
          </span>
        </div>
        <Button
          variant="primary"
          className="!py-2 !px-4 text-sm"
          onClick={handleBuyNow}
        >
          Buy Now
        </Button>
      </div>
    </nav>
  );

  const CheckoutModal = () => {
    if (!showCheckout) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-600" /> Secure Checkout
            </h3>
            <button
              onClick={() => setShowCheckout(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {isProcessing ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <h4 className="text-lg font-bold text-slate-900">
                  Processing Payment...
                </h4>
                <p className="text-slate-500 text-sm mt-2">
                  Connecting to Razorpay Secure Gateway
                </p>
                <p className="text-xs text-slate-400 mt-4">
                  Please check the pop-up window
                </p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                  <p className="text-sm text-blue-900 font-medium">
                    Order Summary
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-blue-900">
                      {PRODUCT.title}
                    </span>
                    <span className="font-bold text-blue-900">
                      ₹{PRODUCT.price}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your name"
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Where should we send the PDF?"
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Lock size={12} className="mr-1" /> No account needed.
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="razorpay" className="w-full">
                    Pay ₹{PRODUCT.price} via Razorpay
                  </Button>
                  <div className="text-center mt-3 text-xs text-slate-400">
                    UPI • Credit Card • Net Banking
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  const HeroSection = () => (
    <section className="bg-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <Badge>Instant Download</Badge>
        <h1 className="mt-6 text-4xl font-extrabold text-slate-900 sm:text-5xl md:text-6xl tracking-tight">
          {PRODUCT.title} <br />
          <span className="text-blue-600">Instant Access</span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500">
          {PRODUCT.description} Secure your copy today and start learning
          immediately. No login required.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-xl">
            <div className="bg-white rounded-xl p-8 w-full max-w-md">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <FileText size={48} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {PRODUCT.title}
              </h3>
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-3xl font-bold text-slate-900">
                  ₹{PRODUCT.price}
                </span>
                <span className="text-lg text-slate-400 line-through">
                  ₹{PRODUCT.originalPrice}
                </span>
                <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                  50% OFF
                </span>
              </div>

              <ul className="text-left space-y-3 mb-8">
                {PRODUCT.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-slate-600">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleBuyNow}
                className="w-full text-lg shadow-blue-500/25"
              >
                Buy Now
              </Button>
              <p className="text-xs text-slate-400 mt-3 flex items-center justify-center">
                <ShieldCheck size={12} className="mr-1" /> Pay securely via
                Razorpay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 mt-8 text-sm font-medium text-slate-500">
            <span className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-1 text-green-600" /> 100%
              Secure
            </span>
            <span className="flex items-center">
              <Download className="h-4 w-4 mr-1 text-green-600" /> Instant PDF
            </span>
            <span className="flex items-center">
              <Lock className="h-4 w-4 mr-1 text-green-600" /> No Login
            </span>
          </div>
        </div>
      </div>
    </section>
  );

  const SuccessPage = () => (
    <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
      <div className="max-w-lg w-full text-center">
        <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
          Payment Successful! 🎉
        </h1>
        <p className="text-slate-600 mb-8">
          Thank you, <strong>{customer.name}</strong>. Your payment was
          processed successfully.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8">
          <h3 className="font-bold text-slate-900 mb-4 text-lg">
            Your Download is Ready
          </h3>
          <a
            href={PRODUCT.downloadLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
          >
            <Download className="mr-2 h-5 w-5" />
            Download PDF Now
          </a>
          <p className="text-xs text-slate-400 mt-4">
            Link expires in 24 hours. Please save the file.
          </p>
        </div>

        <button
          onClick={() => setView("home")}
          className="text-slate-500 hover:text-blue-600 font-medium text-sm"
        >
          Return to Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Navbar />
      <CheckoutModal />

      <main>
        {view === "home" && (
          <>
            <HeroSection />

            {/* Simple FAQ / Trust Section */}
            <div className="bg-slate-50 py-16 px-4">
              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">
                    How do I receive the PDF?
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Immediately after payment, you will see a download button.
                    We also recommend saving the link.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-2">
                    Is payment secure?
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Yes, we use Razorpay (India's leading gateway) which
                    supports UPI, Credit Cards, and Net Banking securely.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {view === "success" && <SuccessPage />}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>&copy; 2024 StudyPremium. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <span className="cursor-pointer hover:text-white">
            Privacy Policy
          </span>
          <span className="cursor-pointer hover:text-white">
            Terms of Service
          </span>
          <span className="cursor-pointer hover:text-white">
            Contact Support
          </span>
        </div>
      </footer>
    </div>
  );
}
