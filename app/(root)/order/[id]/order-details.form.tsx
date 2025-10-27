'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { approvePayPalOrder, createPayPalOrder } from '@/lib/actions/order.actions';
import type { Order } from '@/types';
import { toast } from '@/hooks/use-toast';

const OrderDetailsTable = ({
  order,
  paypalClientId,
}: {
  order: Order;
  paypalClientId: string;
}) => {
  const { isPaid, paymentMethod } = order;

  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();
    if (isPending) return <p>Loading PayPal...</p>;
    if (isRejected) return <p>Error in loading PayPal.</p>;
    return null;
  }

  // 🟦 Tạo PayPal order - PHẢI RETURN STRING!
  const handleCreatePayPalOrder = async () => {
    try {
      console.log('🔵 Creating PayPal order for:', order.id);
      
      const res = await createPayPalOrder(order.id);
      
      console.log('🔵 Server response:', res);
      
      if (!res.success) {
        toast({
          description: res.message || 'Failed to create PayPal order',
          variant: 'destructive',
        });
        throw new Error(res.message);
      }

      // 👇 QUAN TRỌNG: Phải return một STRING là PayPal order ID
      if (!res.data || typeof res.data !== 'string') {
        console.error('❌ Invalid order ID:', res.data);
        throw new Error('Invalid PayPal order ID received');
      }

      console.log('✅ PayPal order ID:', res.data);
      
      return res.data; // 👈 PHẢI là string kiểu "8JX12345ABC67890D"
      
    } catch (error) {
      console.error('❌ Error in handleCreatePayPalOrder:', error);
      toast({
        description: error instanceof Error ? error.message : 'Failed to create order',
        variant: 'destructive',
      });
      throw error; // PayPal SDK cần throw để hiển thị error
    }
  };

  // 🟨 Approve PayPal order
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    try {
      console.log('🟡 Approving PayPal order:', data.orderID);
      
      const res = await approvePayPalOrder(order.id, data);
      
      console.log('🟡 Approval response:', res);
      
      toast({
        description: res.message || (res.success ? 'Payment successful!' : 'Payment failed'),
        variant: res.success ? 'default' : 'destructive',
      });
      
      if (!res.success) {
        throw new Error(res.message);
      }

      // Redirect sau khi thanh toán thành công (optional)
      if (res.success) {
        setTimeout(() => {
          window.location.href = `/order/${order.id}`;
        }, 2000);
      }
      
    } catch (error) {
      console.error('❌ Error in handleApprovePayPalOrder:', error);
      toast({
        description: error instanceof Error ? error.message : 'Payment approval failed',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Order Info */}
        <div className="mb-6 space-y-2">
          <h2 className="text-xl font-bold">Order Details</h2>
          <p>Order ID: <span className="font-mono">{order.id}</span></p>
          <p>Payment Method: {paymentMethod}</p>
          <p>Status: {isPaid ? '✅ Paid' : '⏳ Unpaid'}</p>
          <p>Total: ${order.totalPrice?.toFixed(2)}</p>
        </div>

        {/* PayPal Payment */}
        {!isPaid && paymentMethod === 'PayPal' && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Complete Payment</h3>
            <PayPalScriptProvider 
              options={{ 
                clientId: paypalClientId,
                currency: 'USD',
                intent: 'capture',
              }}
            >
              <PrintLoadingState />
              <PayPalButtons
                style={{
                  layout: 'vertical',
                  color: 'gold',
                  shape: 'rect',
                  label: 'paypal',
                }}
                createOrder={handleCreatePayPalOrder}
                onApprove={handleApprovePayPalOrder}
                onError={(err) => {
                  console.error('💥 PayPal Button Error:', err);
                  toast({
                    description: 'An error occurred with PayPal',
                    variant: 'destructive',
                  });
                }}
                onCancel={() => {
                  console.log('⚠️ Payment cancelled by user');
                  toast({
                    description: 'Payment was cancelled',
                  });
                }}
              />
            </PayPalScriptProvider>
          </div>
        )}

        {isPaid && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-semibold">✅ This order has been paid</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderDetailsTable;