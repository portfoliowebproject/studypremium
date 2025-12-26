import React, { useState } from "react";
import {
  Download,
  ShieldCheck,
  CheckCircle,
  Lock,
  FileBarChart,
  BarChart3,
  PieChart,
  TrendingUp,
  X,
  Menu,
  Zap,
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
  downloadLink: string;
  features: string[];
  tag?: string;
}

// --- DATA ANALYTICS PRODUCT CONFIGURATION ---
const PRODUCTS: Product[] = [
  {
    id: "DA-001",
    title: "Introduction to Data Analytics",
    description: "The perfect starting point. Learn the core concepts, lifecycle, and tools used in modern data analytics.",
    price: 9,
    originalPrice: 49,
    downloadLink: "https://drive.google.com/file/d/103dZ6E5EB-dQb_oBYAE5aaqub6KrD-il/view",
    features: ["Analytics Lifecycle", "Key Terminology", "Tools Overview"],
    tag: "Essential"
  },
  {
    id: "DA-002",
    title: "Basic Mathematics for Data Analytics",
    description: "Brush up on the essential math needed for data science without getting lost in complex theory.",
    price: 9,
    originalPrice: 49,
    downloadLink: "https://drive.google.com/file/d/1XjKuok3mZdePr5AZ4CcUzqHJ47-9a9Cr/view",
    features: ["Linear Algebra Basics", "Probability", "Calculus for ML"],
    tag: "Best Value"
  },
  {
    id: "DA-003",
    title: "Statistics for Data Analysis",
    description: "Master descriptive and inferential statistics to draw meaningful insights from your datasets.",
    price: 9,
    originalPrice: 49,
    downloadLink: "https://drive.google.com/file/d/1pHcInT93ComnDQvhqA6MAKOjM5ALORXA/view",
    features: ["Hypothesis Testing", "Distributions", "Regression Analysis"],
    tag: "Advanced"
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- HANDLERS ---

  const loadScript = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => { resolve(true); };
      script.onerror = () => { resolve(false); };
      document.body.appendChild(script);
    });
  };

  const handleBuyNow = async (product: Product) => {
    setIsProcessing(true);
    setSelectedProduct(product);

    const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!res) {
      alert("Razorpay SDK failed to load. Please check your internet connection.");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: "rzp_live_RwIGdcj8CinSNy", 
      amount: product.price * 100, // Amount in paise
      currency: "INR",
      name: "Data Analytics Store",
      description: product.title,
      image: "https://cdn-icons-png.flaticon.com/512/2703/2703511.png",
      handler: function (response: any) {
        setIsProcessing(false);
        setView("success");
        window.scrollTo(0, 0);
        console.log("Payment Success:", response);
      },
      // Removed manual prefill to let Razorpay ask for details if needed,
      // or rely on user's saved Razorpay info.
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
          <BarChart3 className="text-blue-600" />
          <span>Data<span className="text-blue-600">Foundations</span></span>
        </div>
        <div className="text-sm font-medium text-slate-500 hidden sm:block">
          Launch Offer: All PDFs @ ₹9
        </div>
      </div>
    </nav>
  );

  const HeroSection = () => (
    <div className="bg-white border-b border-slate-200">
       <div className="max-w-5xl mx-auto text-center py-20 px-4">
          <Badge>Limited Time Offer</Badge>
          <h1 className="mt-6 text-4xl font-extrabold text-slate-900 sm:text-6xl tracking-tight">
             Data Analytics Foundations <br />
             <span className="text-blue-600">PDFs at Just ₹9</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-500">
             Start your data journey today. High-quality study materials covering Math, Stats, and Core Analytics concepts.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm font-medium text-slate-500">
             <span className="flex items-center"><Download className="h-4 w-4 mr-1 text-green-600"/> Instant Download</span>
             <span className="flex items-center"><ShieldCheck className="h-4 w-4 mr-1 text-green-600"/> Secure Payment</span>
             <span className="flex items-center"><Lock className="h-4 w-4 mr-1 text-green-600"/> No Login Required</span>
          </div>
       </div>
    </div>
  );

  const ProductList = () => (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTS.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10">
              {product.tag}
            </div>
            
            <div className="p-8 bg-white border-b border-slate-100 flex flex-col items-center text-center group-hover:bg-blue-50/30 transition-colors">
               <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                  {product.id === 'DA-001' && <FileBarChart size={32} />}
                  {product.id === 'DA-002' && <TrendingUp size={32} />}
                  {product.id === 'DA-003' && <PieChart size={32} />}
               </div>
               <h3 className="text-lg font-bold text-slate-900 min-h-[56px] flex items-center">{product.title}</h3>
               <div className="flex items-center gap-2 mt-4">
                 <span className="text-3xl font-black text-slate-900">₹{product.price}</span>
                 <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
               </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <p className="text-slate-600 text-sm mb-6 flex-1">{product.description}</p>
              
              <ul className="space-y-3 mb-8">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-xs font-medium text-slate-500">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button onClick={() => handleBuyNow(product)} className="w-full">
                {isProcessing && selectedProduct?.id === product.id ? "Processing..." : "Buy Now"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const SuccessPage = () => {
    if (!selectedProduct) return null;

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
            Thank you! Your PDF is ready.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-8">
            <h3 className="font-bold text-slate-900 mb-2 text-lg">
              {selectedProduct.title}
            </h3>
            <p className="text-sm text-slate-500 mb-6">Format: PDF (Digital Download)</p>
            
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
              Please save this link for future access.
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

  const LoadingOverlay = () => {
    if (!isProcessing) return null;
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
             <div className="text-center">
                 <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                 <p className="text-slate-600 font-medium">Loading Secure Payment...</p>
             </div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Navbar />
      <LoadingOverlay />

      <main>
        {view === "home" && (
          <>
            <HeroSection />
            <ProductList />
          </>
        )}

        {view === "success" && <SuccessPage />}
      </main>

      <footer className="bg-white border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <p>&copy; 2024 DataFoundations. All rights reserved.</p>
        <div className="flex justify-center gap-4 mt-4">
          <span className="hover:text-slate-600 cursor-pointer">Privacy</span>
          <span className="hover:text-slate-600 cursor-pointer">Terms</span>
          <span className="hover:text-slate-600 cursor-pointer">Support</span>
        </div>
      </footer>
    </div>
  );
}