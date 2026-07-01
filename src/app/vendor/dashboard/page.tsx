'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OrderItem {
  id: number;
  quantity: number;
  menuItem: { name: string };
}

interface Order {
  id: number;
  orderNumber: string;
  student: { name: string; studentId: number };
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function VendorDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check auth
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/warden/check');
        const data = await res.json();
        if (res.ok && data.authenticated && data.warden.role === 'VENDOR_ADMIN') {
          setAdminName(data.warden.name);
          fetchOrders();
        } else {
          router.push('/warden/login');
        }
      } catch (err) {
        router.push('/warden/login');
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  // Poll orders
  useEffect(() => {
    if (checkingAuth) return;
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000); // 10s poll
    return () => clearInterval(interval);
  }, [checkingAuth]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/vendor/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleUpdateStatus = async (orderId: number, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'Pending') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'PickedUp';
    else return;

    try {
      const res = await fetch('/api/vendor/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus })
      });
      if (res.ok) {
        toast.success(`Order marked as ${nextStatus}`);
        fetchOrders();
      } else {
        toast.error('Failed to update status');
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/warden/logout', { method: 'POST' });
    router.push('/warden/login');
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-100 font-bold text-lg bg-zinc-950">
        Verifying session...
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'Pending');
  const readyOrders = orders.filter((o) => o.status === 'Ready');
  const pickedUpOrders = orders.filter((o) => o.status === 'PickedUp');

  return (
    <main className="min-h-screen pb-24 text-zinc-100 relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto px-4 pt-6 flex justify-between items-center gap-4">
        <span className="text-sm text-zinc-400 font-medium">Active: {adminName}</span>
        <button onClick={handleLogout} className="px-4 py-2 bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer">
          Sign Out
        </button>
      </div>

      <section className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        <div className="flex flex-col gap-4 border-b border-zinc-900 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white font-sans">Vendor Portal.</h1>
            <p className="text-xs text-zinc-500 mt-1 font-medium">
              Manage incoming pre-orders in real-time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* PENDING */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-300 flex justify-between items-center">
              Pending 
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-1 rounded-md">{pendingOrders.length}</span>
            </h2>
            <div className="space-y-4">
              {pendingOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdate={handleUpdateStatus} />
              ))}
              {pendingOrders.length === 0 && <p className="text-sm text-zinc-500">No pending orders.</p>}
            </div>
          </div>

          {/* READY */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-emerald-400 flex justify-between items-center">
              Ready 
              <span className="bg-emerald-950 text-emerald-500 text-xs px-2 py-1 rounded-md border border-emerald-900">{readyOrders.length}</span>
            </h2>
            <div className="space-y-4">
              {readyOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdate={handleUpdateStatus} />
              ))}
              {readyOrders.length === 0 && <p className="text-sm text-zinc-500">No ready orders.</p>}
            </div>
          </div>

          {/* PICKED UP (History) */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-zinc-500 flex justify-between items-center">
              Picked Up 
              <span className="bg-zinc-900 text-zinc-600 text-xs px-2 py-1 rounded-md">{pickedUpOrders.length}</span>
            </h2>
            <div className="space-y-4 opacity-75">
              {pickedUpOrders.map(order => (
                <OrderCard key={order.id} order={order} onUpdate={handleUpdateStatus} disabled />
              ))}
              {pickedUpOrders.length === 0 && <p className="text-sm text-zinc-500">No recent history.</p>}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}

function OrderCard({ order, onUpdate, disabled = false }: { order: Order; onUpdate: (id: number, status: string) => void; disabled?: boolean }) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-zinc-800 space-y-4 shadow-lg animate-fade-in">
      <div className="flex justify-between items-start border-b border-zinc-800 pb-3">
        <div>
          <p className="text-xl font-mono font-bold text-zinc-100">{order.orderNumber}</p>
          <p className="text-xs text-zinc-400 mt-1">{order.student.name} ({order.student.studentId})</p>
        </div>
        <p className="text-sm font-bold text-zinc-300">₹{order.totalAmount}</p>
      </div>
      
      <ul className="space-y-2">
        {order.items.map(item => (
          <li key={item.id} className="text-sm text-zinc-300 flex justify-between">
            <span>{item.quantity}x {item.menuItem.name}</span>
          </li>
        ))}
      </ul>

      {!disabled && (
        <button
          onClick={() => onUpdate(order.id, order.status)}
          className={`w-full py-3 mt-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md ${
            order.status === 'Pending' 
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' 
              : 'bg-zinc-200 text-zinc-900 hover:bg-white'
          }`}
        >
          {order.status === 'Pending' ? 'Mark as Ready' : 'Mark as Picked Up'}
        </button>
      )}
    </div>
  );
}
