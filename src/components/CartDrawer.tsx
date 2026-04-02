import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, clearCart, totalPrice, getProduct } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const cartItems = items.map(i => ({
        product_id: i.productId,
        quantity: i.quantity,
      }));

      const { data, error } = await supabase.functions.invoke('create-store-checkout', {
        body: { cart_items: cartItems },
      });

      if (error || !data?.url) throw new Error(error?.message || 'Could not create checkout session');
      clearCart();
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-[380px] sm:w-[420px] bg-white border-l border-gray-200 flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-anton text-xl uppercase tracking-tight text-gray-900">Your Cart</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <ShoppingBag className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">Your cart is empty</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map(item => {
                const product = getProduct(item.productId);
                if (!product) return null;
                return (
                  <div key={item.productId} className="flex gap-3 border-b border-gray-100 pb-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{product.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {product.isBundle ? 'Bundle' : product.isService ? 'Service' : 'Template'}
                      </p>
                      <p className="text-sm font-display text-maroon mt-1">${product.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`Remove ${product.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2 border border-gray-200 rounded">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-medium w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">Total</span>
                <span className="text-xl font-display text-maroon">${totalPrice}</span>
              </div>
              <Button
                variant="maroon"
                className="w-full"
                onClick={handleCheckout}
                disabled={checkingOut}
              >
                {checkingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Checkout — ${totalPrice}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs text-gray-500"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
