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
  tag?: string; // Optional tag for UI
}

interface Customer {
  name: string;
  email: string;
}

// --- PRODUCT CONFIGURATION (3 PDFs) ---
const PRODUCTS: Product[] = [
  {
    id: "PDF-001",
    title: "Complete DSA Guide",
    description: "Master Data Structures & Algorithms with 500+ solved problems and patterns.",
    price: 499,
    originalPrice: 999,
    rating: 4.9,
    reviews: 1542,
    downloadLink: "https://drive.google.com/file/d/16XL0NWy7SkXPaMXWpzx68pLqgF3S0se3/view",
    features: ["500+ Solved Problems", "Pattern Recognition", "System Design Basics"],
    tag: "Best Seller"
  },
  {
    id: "PDF-002",
    title: "React.js Interview Notes",
    description: "Handwritten notes covering Hooks, Redux, Performance, and Interview Q&A.",
    price: 299,
    originalPrice: 599,
    rating: 4.8,
    reviews: 850,
    downloadLink: "https://drive.google.com/file/d/16XL0NWy7SkXPaMXWpzx68pLqgF3S0se3/view", // Replace with real link
    features: ["Handwritten Diagrams", "Cheatsheets", "Project Ideas"],
    tag: "Popular"
  },
  {
    id: "PDF-003",
    title: "System Design Primer",
    description: "The ultimate guide to scaling systems. Perfect for SDE-2 and SDE-3 interviews.",
    price: 399,
    originalPrice: 799,
    rating: 4.9,
    reviews: 420,
    downloadLink: "https://drive.google.com/file/d/16XL0NWy7SkXPaMXWpzx68pLqgF3S0se3/view", // Replace with real link
    features: ["HLD & LLD Examples", "Real-world Case Studies", "Diagram Templates"],
  }
];

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
    razorpay: "bg-[#0c238a] text-white hover:bg-[#0e2aa0] shadow-md",
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
  
  // New state to track which product is being purchased
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- HANDLERS ---

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setShowCheckout(true);
  };

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => { resolve(true); };
      script.onerror = () => { resolve(false); };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setIsProcessing(true);

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: "rzp_test_RvTVPXYu2MB10d",
      amount: selectedProduct.price * 100,
      currency: "INR",
      name: "StudyPremium",
      description: selectedProduct.title,
      image: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
      handler: function (response: any) {
        setIsProcessing(false);
        setShowCheckout(false);
        setView("success");
        window.scrollTo(0, 0);
        console.log("Payment ID: ", response.razorpay_payment_id);
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: "",
      },
      theme: { color: "#2563eb" },
      modal: {
        ondismiss: function() { setIsProcessing(false); }
      }
    };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div
          className="flex items-center gap-2 font-bold text-xl text-slate-900 cursor-pointer"
          onClick={() => setView("home")}
        >
          <FileText className="text-blue-600" />
          <span>Study<span className="text-blue-600">Premium</span></span>
        </div>
        <div className="text-sm font-medium text-slate-500 hidden sm:block">
          Trusted by 10,000+ Students
        </div>
      </div>
    </nav>
  );

  const CheckoutModal = () => {
    if (!showCheckout || !selectedProduct) return null;

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
                <h4 className="text-lg font-bold text-slate-900">Processing Payment...</h4>
                <p className="text-slate-500 text-sm mt-2">Connecting to Razorpay Secure Gateway</p>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                  <p className="text-sm text-blue-900 font-medium">Order Summary</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-bold text-blue-900 truncate pr-2">{selectedProduct.title}</span>
                    <span className="font-bold text-blue-900 shrink-0">₹{selectedProduct.price}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    required
                    type="text"
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your name"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    required
                    type="email"
                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Where should we send the PDF?"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  />
                  <p className="text-xs text-slate-500 mt-1 flex items-center">
                    <Lock size={12} className="mr-1" /> No account needed.
                  </p>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="razorpay" className="w-full">
                    Pay ₹{selectedProduct.price} via Razorpay
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
    <div className="bg-slate-50 border-b border-slate-200">
       <div className="max-w-5xl mx-auto text-center py-16 px-4">
          <Badge>Premium Resources</Badge>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
             Master Your Tech Career with <br />
             <span className="text-blue-600">High-Quality PDFs</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-500">
             Instant download study guides, interview notes, and cheat sheets used by top engineers.
          </p>
       </div>
    </div>
  );

  const ProductList = () => (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
            {product.tag && (
               <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
                 {product.tag}
               </div>
            )}
            
            <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50/50 flex flex-col items-center justify-center border-b border-slate-100">
               <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600 mb-4">
                  <FileText size={32} />
               </div>
               <h3 className="text-xl font-bold text-slate-900 text-center">{product.title}</h3>
               <div className="flex items-center gap-2 mt-2">
                 <span className="text-2xl font-bold text-slate-900">₹{product.price}</span>
                 <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
               </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <p className="text-slate-600 text-sm mb-6 flex-1">{product.description}</p>
              
              <ul className="space-y-3 mb-8">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-slate-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button onClick={() => handleBuyNow(product)} className="w-full">
                Buy Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const SuccessPage = () => {
    if (!selectedProduct) return null; // Should not happen ideally

    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-white px-4">
        <div className="max-w-lg w-full text-center">
          <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-slate-600 mb-8">
            Thank you, <strong>{customer.name}</strong>. Your payment for <strong>{selectedProduct.title}</strong> was successful.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8">
            <h3 className="font-bold text-slate-900 mb-4 text-lg">
              Your Download is Ready
            </h3>
            <a
              href={selectedProduct.downloadLink}
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
            Return to Store
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Navbar />
      <CheckoutModal />

      <main>
        {view === "home" && (
          <>
            <HeroSection />
            <ProductList />

            {/* Simple Trust Section */}
            <div className="bg-slate-50 py-12 px-4 border-t border-slate-200">
              <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                    <ShieldCheck className="h-8 w-8 text-blue-600 mb-3"/>
                    <h3 className="font-bold text-slate-900">100% Secure</h3>
                    <p className="text-sm text-slate-500">Payments via Razorpay</p>
                </div>
                <div className="flex flex-col items-center">
                    <Download className="h-8 w-8 text-blue-600 mb-3"/>
                    <h3 className="font-bold text-slate-900">Instant Access</h3>
                    <p className="text-sm text-slate-500">Download immediately</p>
                </div>
                <div className="flex flex-col items-center">
                    <Star className="h-8 w-8 text-blue-600 mb-3"/>
                    <h3 className="font-bold text-slate-900">Top Rated</h3>
                    <p className="text-sm text-slate-500">Loved by students</p>
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
          <span className="cursor-pointer hover:text-white">Privacy Policy</span>
          <span className="cursor-pointer hover:text-white">Terms of Service</span>
          <span className="cursor-pointer hover:text-white">Contact Support</span>
        </div>
      </footer>
    </div>
  );
}
