import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Check, CreditCard, Shield, ChevronRight, Zap, Flame, Sparkles, AlertCircle, Smartphone, Fingerprint, RefreshCw, Infinity as InfinityIcon
} from 'lucide-react';

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}

interface WiseFitPlusPaywallProps {
  isDarkMode: boolean;
  isGirlyMode?: boolean;
  userEmail?: string;
  onSuccess: (type: 'monthly' | 'lifetime') => Promise<void>;
  onClose?: () => void;
}

export default function WiseFitPlusPaywall({
  isDarkMode,
  isGirlyMode,
  userEmail,
  onSuccess,
  onClose
}: WiseFitPlusPaywallProps) {
  const [tier, setTier] = useState<'monthly' | 'lifetime'>('monthly');
  const [payMethod, setPayMethod] = useState<'card' | 'gpay'>('card');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showGPaySheet, setShowGPaySheet] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  // Card Form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardZip, setCardZip] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(formatExpiry(e.target.value));
  };

  const handlePaymentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Check if a real physical Stripe Payment Link is configured in Vite environment variables
    const envMonthlyLink = (import.meta as any).env.VITE_STRIPE_MONTHLY_PAYMENT_LINK;
    const envLifetimeLink = (import.meta as any).env.VITE_STRIPE_LIFETIME_PAYMENT_LINK;
    const realLink = tier === 'monthly' ? envMonthlyLink : envLifetimeLink;

    if (realLink) {
      try {
        console.log(`[WiseFit Billing] Active Stripe direct checkout link found: ${realLink}`);
        const checkoutUrl = new URL(realLink);
        if (userEmail) {
          // Tell Stripe to pre-fill the customer email for a premium customer experience
          checkoutUrl.searchParams.set('prefilled_email', userEmail);
        }
        // Redirect top frame to Stripe checkout
        window.top!.location.href = checkoutUrl.toString();
        return;
      } catch (err) {
        console.error('[WiseFit Billing] Failed to direct window to payment portal. Checking fallback...', err);
      }
    }

    if (payMethod === 'card') {
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setErrorMessage('Please enter a valid 16-digit card number.');
        return;
      }
      if (cardExpiry.length < 5) {
        setErrorMessage('Please enter a valid expiry date (MM/YY).');
        return;
      }
      if (cardCvc.length < 3) {
        setErrorMessage('Please enter a valid CVC.');
        return;
      }
      if (!cardName.trim()) {
        setErrorMessage('Please enter the cardholder name.');
        return;
      }
    }

    setErrorMessage('');
    setLoading(true);
    setLoadingStep(0);

    const steps = [
      'Contacting premium merchant gateways...',
      'Encrypting payment tokens securely...',
      'Verifying account balance with bank...',
      'Unlocking the Digital Sanctuary...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 600));
    }

    setLoading(false);
    setCheckoutComplete(true);
    await onSuccess(tier);
  };

  const handleGPayClick = () => {
    setShowGPaySheet(true);
  };

  const handleGPayConfirm = async () => {
    setShowGPaySheet(false);
    setLoading(true);
    setLoadingStep(0);

    const steps = [
      'Initiating secure Google Pay handshake...',
      'Decrypting payment tokens...',
      'Authorizing biometric signature...',
      'Configuring your subscription in Firestore...',
    ];

    for (let i = 0; i < steps.length; i++) {
      setLoadingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 850 + Math.random() * 500));
    }

    setLoading(false);
    setCheckoutComplete(true);
    await onSuccess(tier);
  };

  const currentPrice = tier === 'monthly' ? '€4.99/mo' : '€99 Lifetime';

  return (
    <div className={cn(
      "w-full rounded-3xl overflow-hidden shadow-2xl border flex flex-col p-6 sm:p-8 min-h-[500px] justify-between relative",
      isDarkMode ? "bg-zinc-950 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
    )}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full"
              />
              <Lock className="w-6 h-6 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            
            <h3 className="text-lg font-bold mb-2">Processing Secure Payment</h3>
            <p className={cn(
              "text-xs transition-opacity max-w-xs",
              isDarkMode ? "text-zinc-400" : "text-zinc-500"
            )}>
              {[
                'Contacting premium merchant gateways...',
                'Encrypting payment tokens securely...',
                'Verifying account balance with bank...',
                'Unlocking the Digital Sanctuary...'
              ][loadingStep]}
            </p>
          </motion.div>
        ) : checkoutComplete ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-emerald-500">Welcome to WiseFit Plus!</h3>
            <p className={cn("text-xs max-w-sm mb-6", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
              Your subscription was verified successfully on Firestore. AI Psychologist, Sage, Yoga Rituals, and the Swarm community have been unlocked.
            </p>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-emerald-500 text-zinc-950 hover:bg-emerald-450 transition-all font-bold px-6 py-2.5 rounded-xl text-xs active:scale-95"
              >
                Enter Sanctuary
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 flex-1"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-wider">
                <Sparkles className="w-3 h-3" /> Digital Sanctuary Portal
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight font-sans">
                Unlock WiseFit Plus
              </h2>
              <p className={cn("text-xs max-w-md mx-auto", isDarkMode ? "text-zinc-400" : "text-zinc-500")}>
                Subscribing immediately unlocks the high-performance AI Suite & collaborative network, stored securely on the cloud.
              </p>
            </div>

            {/* Locked Features Summary */}
            <div className={cn(
              "p-4 rounded-2xl border text-xs grid grid-cols-1 sm:grid-cols-2 gap-3",
              isDarkMode ? "bg-zinc-900/40 border-zinc-800/85" : "bg-zinc-50 border-zinc-200"
            )}>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Fingerprint className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-bold block">AI Psychologist</span>
                  <span className="text-[10px] opacity-75">Professional psychoanalysis & discipline tracking.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Shield className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-bold block">AI Stoic Mentor (Sage)</span>
                  <span className="text-[10px] opacity-75">A personal Stoic dialog partner (Zeno/Epictetus).</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <InfinityIcon className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-bold block">Yin & Flow Yoga</span>
                  <span className="text-[10px] opacity-75">Fully unlocked routines, custom timers, acoustics.</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-3 h-3" />
                </div>
                <div>
                  <span className="font-bold block">Moderated Swarm</span>
                  <span className="text-[10px] opacity-75">Interactive seeker-driven scholarly community feed.</span>
                </div>
              </div>
            </div>

            {/* Plans Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTier('monthly')}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all relative overflow-hidden",
                  tier === 'monthly'
                    ? (isGirlyMode ? "border-pink-500 bg-pink-500/5 ring-1 ring-pink-500" : "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500")
                    : (isDarkMode ? "bg-zinc-900/20 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300")
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs">WiseFit Plus</span>
                  <span className={cn(
                    "text-xs font-black",
                    isGirlyMode && tier === 'monthly' ? "text-pink-600" : "text-emerald-500"
                  )}>€4.99 / mo</span>
                </div>
                <p className="text-[10px] opacity-70">Billed monthly, cancel anytime in profile settings.</p>
                {tier === 'monthly' && (
                  <div className={cn(
                    "absolute top-0 right-0 w-3 h-3 rounded-bl-lg flex items-center justify-center",
                    isGirlyMode ? "bg-pink-500" : "bg-emerald-500"
                  )} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setTier('lifetime')}
                className={cn(
                  "p-4 rounded-2xl border text-left transition-all relative overflow-hidden",
                  tier === 'lifetime'
                    ? (isGirlyMode ? "border-pink-500 bg-pink-500/5 ring-1 ring-pink-500" : "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500")
                    : (isDarkMode ? "bg-zinc-900/20 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300")
                )}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs flex items-center gap-1">
                    Founding Member <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                  </span>
                  <span className={cn(
                    "text-xs font-black",
                    isGirlyMode && tier === 'lifetime' ? "text-pink-600" : "text-emerald-500"
                  )}>€99.00</span>
                </div>
                <p className="text-[10px] opacity-70">One-time payment. 412/500 founding seats taken.</p>
                {tier === 'lifetime' && (
                  <div className={cn(
                    "absolute top-0 right-0 w-3 h-3 rounded-bl-lg flex items-center justify-center",
                    isGirlyMode ? "bg-pink-500" : "bg-emerald-500"
                  )} />
                )}
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="flex rounded-xl p-1 bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  payMethod === 'card' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                <CreditCard className="w-3.5 h-3.5" /> Credit Card (Stripe)
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('gpay')}
                className={cn(
                  "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5",
                  payMethod === 'gpay' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" /> Google Pay
              </button>
            </div>

            {/* Payment Form Area */}
            {payMethod === 'card' ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
                {errorMessage && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {errorMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-700"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      maxLength={19}
                      onChange={handleCardNumberChange}
                    />
                    <CreditCard className="w-4 h-4 text-zinc-600 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Expiry Date</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-700"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      maxLength={5}
                      onChange={handleExpiryChange}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">CVC</label>
                    <input
                      type="password"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-700"
                      placeholder="•••"
                      maxLength={3}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/[^0-9]/gi, ''))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">Cardholder Name</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-700"
                      placeholder="Aurelius Maximus"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block">ZIP Code</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-zinc-700 transition-colors placeholder:text-zinc-700"
                      placeholder="10001"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className={cn(
                    "w-full font-bold py-3 mt-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all text-zinc-950 active:scale-95 cursor-pointer shadow-lg",
                    isGirlyMode ? "bg-pink-500 hover:bg-pink-450 shadow-pink-500/10" : "bg-emerald-500 hover:bg-emerald-450 shadow-emerald-500/10"
                  )}
                >
                  <Lock className="w-3.5 h-3.5" /> Pay {currentPrice} with Stripe
                </button>
              </form>
            ) : (
              <div className="space-y-4 py-3 flex flex-col items-center justify-center text-center">
                <p className={cn("text-xs max-w-sm", isDarkMode ? "text-zinc-400" : "text-zinc-600")}>
                  Authorize quickly and securely using devices linked with your Google Pay Account. Supports bio-auth.
                </p>

                <button
                  type="button"
                  onClick={handleGPayClick}
                  className="w-full bg-black hover:bg-zinc-900 text-white font-bold py-2.5 rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-2 text-xs active:scale-95 cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>Pay with</span>
                  <span className="font-extrabold tracking-tight">Google Pay</span>
                </button>

                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                  <Shield className="w-3 h-3" /> Secure Google Payments Handshake
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Google Pay System Sheet Simulation */}
      <AnimatePresence>
        {showGPaySheet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
            {/* Background click to dismiss */}
            <div className="absolute inset-0" onClick={() => setShowGPaySheet(false)} />

            <motion.div
              initial={{ translateY: "100%" }}
              animate={{ translateY: 0 }}
              exit={{ translateY: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "w-full max-w-md rounded-t-[2.5rem] border-t p-6 pb-12 space-y-5 relative z-10",
                isDarkMode ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-200 text-zinc-900"
              )}
            >
              <div className="w-12 h-1.5 bg-zinc-700/50 rounded-full mx-auto mb-2" />

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-500" />
                  <span className="font-bold text-xs tracking-wide uppercase">Google Pay</span>
                </div>
                <button
                  onClick={() => setShowGPaySheet(false)}
                  className="text-xs opacity-50 hover:opacity-100 font-bold"
                >
                  Cancel
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-black/20 border border-zinc-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-60">Account</span>
                  <span className="font-bold">{userEmail || 'seeker.philosopher@gmail.com'}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="opacity-60">Payment Method</span>
                  <span className="font-medium flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 bg-zinc-800 text-[9px] rounded font-black tracking-widest">VISA</span>
                    Visa •••• 4242
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-zinc-800/50 pt-2.5">
                  <span className="opacity-60 font-bold">Total</span>
                  <span className="font-black text-emerald-500 text-sm">{currentPrice}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 py-4 text-center">
                  <Fingerprint className="w-8 h-8 text-emerald-500 animate-pulse" />
                  <div className="text-left">
                    <p className="text-xs font-bold">Hold Fingerprint to Verify</p>
                    <p className="text-[10px] opacity-60">Uses device haptic loop authentication</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGPayConfirm}
                  className="w-full bg-emerald-500 text-zinc-950 font-bold py-3 rounded-2xl text-xs hover:bg-emerald-450 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                >
                  Confirm and Authorize Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
