'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, useMemo } from 'react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  canteen: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

// Map food items to simple emojis for quick recognition
const getFoodEmoji = (name: string): string => {
  const lowercaseName = name.toLowerCase();
  if (lowercaseName.includes('burger') || lowercaseName.includes('bun')) return '🍔';
  if (lowercaseName.includes('pizza')) return '🍕';
  if (lowercaseName.includes('noodle') || lowercaseName.includes('pasta') || lowercaseName.includes('chow')) return '🍝';
  if (lowercaseName.includes('rice') || lowercaseName.includes('biryani') || lowercaseName.includes('meals')) return '🍛';
  if (lowercaseName.includes('coffee') || lowercaseName.includes('tea') || lowercaseName.includes('drink') || lowercaseName.includes('beverage')) return '☕';
  if (lowercaseName.includes('sandwich') || lowercaseName.includes('toast')) return '🥪';
  if (lowercaseName.includes('fry') || lowercaseName.includes('fries') || lowercaseName.includes('snack') || lowercaseName.includes('samosa')) return '🍟';
  if (lowercaseName.includes('sweet') || lowercaseName.includes('dessert') || lowercaseName.includes('cake') || lowercaseName.includes('ice')) return '🍰';
  if (lowercaseName.includes('dosa') || lowercaseName.includes('roti') || lowercaseName.includes('nan') || lowercaseName.includes('paneer') || lowercaseName.includes('chappathi')) return '🫓';
  return '🍛';
};

export default function Home() {
  const { data: menuItems, isLoading, error } = useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      const response = await fetch('/api/menu');
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    },
  });

  // UI States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCanteen, setSelectedCanteen] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [orderToken, setOrderToken] = useState('');

  // Derive unique canteens dynamically
  const canteensList = useMemo(() => {
    if (!menuItems) return ['All'];
    const unique = Array.from(new Set(menuItems.map((item) => item.canteen)));
    return ['All', ...unique];
  }, [menuItems]);

  // Filter menu items based on search and canteen tab
  const filteredMenuItems = useMemo(() => {
    if (!menuItems) return [];
    return menuItems.filter((item) => {
      const matchesCanteen = selectedCanteen === 'All' || item.canteen === selectedCanteen;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCanteen && matchesSearch;
    });
  }, [menuItems, selectedCanteen, searchQuery]);

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === item.id);
      if (existing) {
        return prevCart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prevCart.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i));
      }
      return prevCart.filter((i) => i.id !== itemId);
    });
  };

  const clearItemFromCart = (itemId: number) => {
    setCart((prevCart) => prevCart.filter((i) => i.id !== itemId));
  };

  // Cart helper calculations
  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const packagingFee = subtotalPrice > 0 ? 5 : 0; // standard parcel container charge
  const cgst = subtotalPrice * 0.025; // 2.5% CGST
  const sgst = subtotalPrice * 0.025; // 2.5% SGST
  const grandTotal = subtotalPrice + packagingFee + cgst + sgst;

  const handleCheckout = () => {
    // Generate simple student collection token
    const tokenNum = `CB-${Math.floor(100 + Math.random() * 900)}`;
    setOrderToken(tokenNum);
    setIsCheckoutSuccess(true);
    setCart([]);
  };

  const closeCheckoutState = () => {
    setIsCheckoutSuccess(false);
    setIsCartOpen(false);
    setOrderToken('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold text-sm tracking-wide">Loading Campus Database...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
        <div className="bg-slate-900/60 p-8 rounded-2xl border border-red-500/30 max-w-md shadow-2xl backdrop-blur">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-xl font-black text-red-400 mt-4">Database Offline</h2>
          <p className="text-slate-400 mt-2 text-sm">Could not establish contact with SQLite database. Re-check prisma client or environment setup.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 pb-24 text-slate-100 relative">
      {/* STICKY GLASS NAVBAR */}
      <nav className="sticky top-0 z-40 w-full glass border-b border-slate-900 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          {/* Logo with sleek cloche icon */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-primary-950/40 rounded-lg border border-primary-900/40 text-primary-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M3 19h18" />
                <path d="M5 19a7 7 0 0 1 14 0" />
                <path d="M12 5V3" />
                <circle cx="12" cy="3" r="1" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-100 leading-none">
                CampusByte
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Student Dining Dashboard</p>
            </div>
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="group relative flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-bold transition-all duration-150 active:scale-95 cursor-pointer text-xs"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
            <span>Cart</span>
            {totalCartCount > 0 && (
              <span className="bg-white text-primary-900 text-[10px] font-black min-w-4.5 h-4.5 rounded px-1 flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* DASHBOARD HEADER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4 relative z-10">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 leading-none">
            Canteen Menu & Pre-Ordering
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Search live menu items, select dining outlets, and submit items to generate your collection token.
          </p>

          {/* SEARCH BAR */}
          <div className="pt-4 max-w-xl">
            <div className="relative flex items-center bg-slate-900/60 rounded-xl border border-slate-800 shadow-inner p-1">
              <div className="pl-3 text-slate-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search food items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent py-1.5 px-2.5 text-slate-200 placeholder-slate-500 text-xs font-medium focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & MENU GRID SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 relative z-10">
        {/* Dynamic Canteen Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-900 pb-4 mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {canteensList.map((canteen) => {
              const isActive = selectedCanteen === canteen;
              return (
                <button
                  key={canteen}
                  onClick={() => setSelectedCanteen(canteen)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-100 cursor-pointer border ${
                    isActive
                      ? 'bg-primary-600 text-white border-primary-500'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {canteen === 'All' ? '🏢 All Outlets' : canteen}
                </button>
              );
            })}
          </div>
        </div>

        {/* FOOD CARD LISTING */}
        {filteredMenuItems.length === 0 ? (
          <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 text-center max-w-sm mx-auto space-y-3">
            <span className="text-3xl block">🍽️</span>
            <h4 className="text-sm font-bold text-slate-300">No matching items found</h4>
            <p className="text-slate-500 text-xs font-medium">
              Try adjusting your query or selecting other dining counters.
            </p>
            {(searchQuery || selectedCanteen !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCanteen('All');
                }}
                className="bg-primary-950/60 hover:bg-primary-950 text-primary-300 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-primary-900/40 cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMenuItems.map((item) => {
              const cartItem = cart.find((i) => i.id === item.id);
              const hasQuantity = (cartItem?.quantity ?? 0) > 0;

              return (
                <div
                  key={item.id}
                  className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-800 transition-all duration-150 relative"
                >
                  <div className="space-y-3">
                    {/* Header Tag */}
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] bg-slate-900 text-slate-400 font-extrabold px-2 py-0.5 rounded border border-slate-800">
                        {item.canteen}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-900/20">
                        Available
                      </span>
                    </div>

                    {/* Food Name & Visual Emoji */}
                    <div className="flex gap-3 items-center">
                      <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-800">
                        {getFoodEmoji(item.name)}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-200 leading-snug">
                        {item.name}
                      </h4>
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-slate-500 text-[8px] font-bold uppercase tracking-wider">Price</span>
                      <span className="text-base font-black text-slate-100">₹{item.price.toFixed(0)}</span>
                    </div>

                    {hasQuantity ? (
                      <div className="flex items-center bg-primary-600 text-white rounded-lg overflow-hidden border border-primary-700">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="px-2.5 py-1.5 hover:bg-primary-700 transition cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                          </svg>
                        </button>
                        <span className="px-2 text-xs font-black w-6 text-center">{cartItem?.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="px-2.5 py-1.5 hover:bg-primary-700 transition cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-slate-800 hover:bg-primary-600 text-slate-100 text-xs px-3.5 py-1.5 rounded-lg font-bold transition cursor-pointer"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CART DRAWER SIDEBAR & BACKDROP OVERLAY */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => {
              if (isCheckoutSuccess) {
                closeCheckoutState();
              } else {
                setIsCartOpen(false);
              }
            }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col justify-between animate-slide-in relative">
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-slate-900 flex justify-between items-center bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🛒</span>
                  <h3 className="text-sm font-bold text-slate-100">Order List</h3>
                  {totalCartCount > 0 && (
                    <span className="bg-primary-950 text-primary-300 border border-primary-900/30 text-[9px] font-bold px-2 py-0.5 rounded">
                      {totalCartCount} items
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (isCheckoutSuccess) {
                      closeCheckoutState();
                    } else {
                      setIsCartOpen(false);
                    }
                  }}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Body content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {isCheckoutSuccess ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-fade-in text-slate-100">
                    <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-xl">
                      ✓
                    </div>
                    <h4 className="text-lg font-black text-emerald-400">Order Token Generated</h4>
                    <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-xl shadow-inner my-2">
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Collection Code</p>
                      <p className="text-3xl font-black text-primary-400 tracking-wider mt-1">{orderToken}</p>
                    </div>
                    <p className="text-slate-400 font-medium text-xs max-w-xs leading-relaxed">
                      Please show this token code at the canteen billing counter to pay and collect your items.
                    </p>
                    <button
                      onClick={closeCheckoutState}
                      className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2 rounded-lg border border-slate-800 cursor-pointer mt-4"
                    >
                      Done / Close
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                    <span className="text-4xl text-slate-600">🛒</span>
                    <h4 className="text-sm font-bold text-slate-400">Your basket is empty</h4>
                    <p className="text-slate-500 text-xs max-w-xs">
                      Select items from the canteen listing to request an order token.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-900">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center pt-4 first:pt-0">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-1 bg-slate-900 rounded border border-slate-800">{getFoodEmoji(item.name)}</span>
                          <div>
                            <h5 className="font-bold text-slate-200 text-xs leading-snug">{item.name}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded uppercase font-extrabold">
                                {item.canteen}
                              </span>
                              <span className="text-slate-500 text-xs font-bold">₹{item.price}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Quantity control inside cart */}
                          <div className="flex items-center border border-slate-800 rounded overflow-hidden bg-slate-900/50">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="px-2 py-0.5 text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                              </svg>
                            </button>
                            <span className="px-1.5 text-xs font-black text-slate-200 min-w-3 text-center">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="px-2 py-0.5 text-slate-400 hover:bg-slate-800 transition cursor-pointer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Trash button */}
                          <button
                            onClick={() => clearItemFromCart(item.id)}
                            className="p-1 hover:bg-red-950/20 text-slate-500 hover:text-red-400 rounded transition cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drawer Footer summary */}
              {!isCheckoutSuccess && cart.length > 0 && (
                <div className="border-t border-slate-900 bg-slate-900/20 px-6 py-4 space-y-4">
                  <div className="space-y-1.5 text-xs text-slate-400 font-medium">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-200">₹{subtotalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Parcel Container Fee</span>
                      <span className="font-bold text-slate-200">₹{packagingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CGST (2.5%)</span>
                      <span className="font-bold text-slate-200">₹{cgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (2.5%)</span>
                      <span className="font-bold text-slate-200">₹{sgst.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 text-xs font-black text-slate-200">
                      <span>Total Amount</span>
                      <span className="text-primary-400 text-sm">₹{grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 rounded-xl transition duration-150 active:scale-98 cursor-pointer text-center text-xs block"
                  >
                    Generate Order Token (₹{grandTotal.toFixed(0)})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
