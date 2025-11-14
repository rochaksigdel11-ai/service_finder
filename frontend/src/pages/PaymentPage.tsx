import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, CreditCard, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';

type PaymentMethod = 'esewa' | 'khalti' | null;

export default function PaymentPage() {
  const { user, notify } = useApp();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const selectedService = { title: 'Sample Service', provider: 'Sample Provider' };  // From state/props

  const initiatePayment = () => {
    if (!paymentMethod) {
      notify('Please select a payment method', 'error');
      return;
    }

    // Mock API call (replace with axios POST /api/payments/initiate/)
    const paymentData = {
      amount: paymentAmount,
      method: paymentMethod,
      service_id: 1,  // From props/state
    };

    console.log('Initiating payment:', paymentData);
    notify(`Payment of Rs. ${paymentAmount} initiated via ${paymentMethod.toUpperCase()}!`, 'success');
    
    // Redirect to success or external payment URL
    window.location.href = '/dashboard';
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-300">Please log in to make payment.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="bg-slate-800 shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center text-slate-300 hover:text-white">
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-white">Payment</h1>
            <div className="w-10"></div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-slate-800 rounded-lg p-6 space-y-6">
          <h2 className="text-2xl font-bold text-white">Payment for {selectedService.title}</h2>
          <p className="text-slate-300">Provider: {selectedService.provider}</p>
          <p className="text-slate-300">Amount: Rs. {paymentAmount || 0}</p>

          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="esewa"
                checked={paymentMethod === 'esewa'}
                onChange={() => setPaymentMethod('esewa')}
                className="accent-violet-500"
              />
              <span>eSewa (Sandbox)</span>
            </label>
            <label className="flex items-center space-x-3">
              <input
                type="radio"
                name="paymentMethod"
                value="khalti"
                checked={paymentMethod === 'khalti'}
                onChange={() => setPaymentMethod('khalti')}
                className="accent-violet-500"
              />
              <span>Khalti (Sandbox)</span>
            </label>
          </div>

          <button
            onClick={initiatePayment}
            className="w-full bg-violet-600 hover:bg-violet-700 py-3 rounded-lg font-semibold transition"
          >
            <CreditCard className="w-5 h-5 inline mr-2" />
            Pay Now
          </button>

          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-slate-700 hover:bg-slate-600 py-2 rounded-lg font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}