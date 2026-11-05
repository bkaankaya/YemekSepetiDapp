import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { yemAbi, YEMEKSEPETI_ADDRESS, escrowAbi, ESCROW_ADDRESS } from '../lib/contracts';
import { useToast } from './ToastProvider';

// Window.ethereum tipini tanımla
declare global {
  interface Window {
    ethereum: any;
  }
}

interface Order {
  id: string;
  customer: string;
  items: string[];
  quantities: number[];
  totalAmount: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  timestamp: number;
  paymentMethod: 'ETH' | 'TOKEN';
}

type FilterType = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const RestaurantPanel: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  const [accessError, setAccessError] = useState<string>('');
  const { showToast } = useToast();

  useEffect(() => {
    void checkWallet();
    const ethereum = window.ethereum;
    if (!ethereum?.on) return;
    const refresh = () => { setOrders([]); setWalletAddress(''); setAccessDenied(false); void checkWallet(); };
    ethereum.on('accountsChanged', refresh);
    ethereum.on('chainChanged', refresh);
    return () => {
      ethereum.removeListener?.('accountsChanged', refresh);
      ethereum.removeListener?.('chainChanged', refresh);
    };
  }, []);

  const checkWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      setAccessDenied(true);
      setAccessError('MetaMask bulunamadı. Restoran paneli için cüzdanını bağlamalısın.');
      return;
    }
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (!accounts.length) {
          setAccessDenied(true);
          setAccessError('Cüzdan bağlı değil. Üst menüden cüzdanını bağla ve paneli yeniden aç.');
          return;
        }
        if (accounts.length > 0) {
          const currentAddress = accounts[0];
          setWalletAddress(currentAddress);
          console.log('Kontrol edilen cüzdan:', currentAddress);
          console.log('Kullanılan kontrat adresi:', YEMEKSEPETI_ADDRESS);
          
          // Restoran olarak kayıtlı mı kontrol et
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const yem = new ethers.Contract(YEMEKSEPETI_ADDRESS, yemAbi, provider);
          
          try {
            console.log('🔍 Restoran verisi sorgulanıyor...');
            const restaurantData = await yem.restaurants(currentAddress);
            console.log('📋 Restoran verisi:', restaurantData);
            console.log('📋 walletAddress:', restaurantData.walletAddress);
            console.log('📋 AddressZero:', ethers.constants.AddressZero);
            
            if (restaurantData.walletAddress === "0x0000000000000000000000000000000000000000") {
              // Restoran olarak kayıtlı değil, müşteri olarak kayıtlı mı kontrol et
              const customerData = await yem.customers(currentAddress);
              if (customerData.walletAddress !== "0x0000000000000000000000000000000000000000") {
                // Bu bir müşteri cüzdanı! Erişimi engelle
                setAccessDenied(true);
                setAccessError('MÜŞTERİ CÜZDANI RESTORAN PANELİNE ERİŞEMEZ!');
                return;
              } else {
                // Hiç kayıtlı değil
                setAccessDenied(true);
                setAccessError('Bu hesap restoran olarak kayıtlı değil!');
                return;
              }
            }
            console.log('✅ Restoran erişimi onaylandı');
            // Erişim onaylandıktan sonra siparişleri yükle
            loadOrdersWithAddress(currentAddress);
          } catch (error) {
            console.error('Erişim kontrol hatası:', error);
            setAccessDenied(true);
            setAccessError('Erişim kontrolü sırasında hata oluştu!');
            return;
          }
        }
      } catch (error) {
        console.error('Cüzdan kontrol hatası:', error);
        setAccessDenied(true);
        setAccessError('Cüzdan bağlantısında hata oluştu!');
      }
    }
  };

  const loadOrders = async () => {
    if (walletAddress) {
      await loadOrdersWithAddress(walletAddress);
    }
  };

  const loadOrdersWithAddress = async (address: string) => {
    console.log('🚀 loadOrdersWithAddress() fonksiyonu başlatıldı');
    setLoading(true);
    try {
      // Gerçek blockchain'den siparişleri oku
      if (address && typeof window.ethereum !== 'undefined') {
        console.log('✅ Cüzdan ve ethereum kontrolü geçti');
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const yem = new ethers.Contract(YEMEKSEPETI_ADDRESS, yemAbi, provider);
        console.log('✅ Kontrat bağlantısı kuruldu');
        
        // Restoran için siparişleri oku
        console.log('🔍 getRestaurantOrders çağrılıyor...');
        const orderIds = await yem.getRestaurantOrders(address);
        console.log('📋 Bulunan sipariş ID\'leri:', orderIds);
        
        if (orderIds.length === 0) {
          setOrders([]);
          console.log('✅ Hiç sipariş bulunamadı');
          return;
        }
        
        // Her sipariş için detayları oku
        const realOrders: Order[] = [];
        
        for (let i = 0; i < orderIds.length; i++) {
          try {
            const orderId = orderIds[i];
            
            // Sipariş detaylarını oku
            const orderDetails = await yem.getOrder(orderId);
            const orderItems = await yem.getOrderItems(orderId);
            
            // OrderStatus enum'ını string'e çevir
            let status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
            switch (orderDetails.status) {
              case 0: // Placed
                status = 'pending';
                break;
              case 1: // Confirmed
                status = 'confirmed';
                break;
              case 2: // CancelReqByCustomer
                status = 'cancelled';
                break;
              case 3: // CancelReqByRestaurant
                status = 'cancelled';
                break;
              case 4: // Cancelled
                status = 'cancelled';
                break;
              case 5: // Completed
                status = 'completed';
                break;
              default:
                status = 'pending';
            }
            
            // getOrder doesn't expose the token; use the public orders getter.
            const fullOrder = await yem.orders(orderId);
            const paymentToken = fullOrder.paymentToken ?? fullOrder[5];
            const paymentMethod: 'ETH' | 'TOKEN' =
              String(paymentToken).toLowerCase() === ethers.constants.AddressZero.toLowerCase() ? 'ETH' : 'TOKEN';
            
            // Sipariş item'larını formatla
            const items = orderItems.map((item: any) => item.name);
            const quantities = orderItems.map((item: any) => item.qty.toNumber());
            
            // Toplam tutarı hesapla
            let totalAmount = '';
            if (paymentMethod === 'ETH') {
              totalAmount = ethers.utils.formatEther(orderDetails.price) + ' ETH';
            } else {
              totalAmount = orderDetails.price.toString() + ' FOOD';
            }
            
            const order: Order = {
              id: orderId.toString(),
              customer: orderDetails.customer,
              items: items,
              quantities: quantities,
              totalAmount: totalAmount,
              status: status,
              timestamp: 0, // Contract getter has no creation timestamp; do not invent one.
              paymentMethod: paymentMethod
            };
            
            realOrders.push(order);
            console.log(`✅ Sipariş ${orderId} yüklendi:`, order);
            
          } catch (error) {
            console.error('❌ Sipariş yükleme hatası:', error);
            console.error('❌ Hata detayı:', error instanceof Error ? error.message : 'Bilinmeyen hata');
            console.error('❌ Hata stack:', error instanceof Error ? error.stack : 'Stack yok');
            // Skip only the broken order; keep other successfully fetched entries.
          }
        }
        
        setOrders(realOrders);
        console.log(`✅ Toplam ${realOrders.length} sipariş yüklendi`);
        
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Sipariş yükleme hatası:', error);
      console.error('❌ Hata detayı:', error instanceof Error ? error.message : 'Bilinmeyen hata');
      console.error('❌ Hata stack:', error instanceof Error ? error.stack : 'Stack yok');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'confirm' | 'complete' | 'cancel') => {
    try {
      setLoading(true);
      console.log(`${action} işlemi yapılıyor: ${orderId}`);
      
      if (walletAddress && typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const yem = new ethers.Contract(YEMEKSEPETI_ADDRESS, yemAbi, signer);
        
        if (action === 'confirm') {
          // Siparişi onayla
          const order = orders.find(o => o.id === orderId);
          if (order && order.paymentMethod === 'ETH') {
            // ETH siparişi için escrow'dan holdAmount'u al
            const escrow = new ethers.Contract(ESCROW_ADDRESS, escrowAbi, signer);
            const holdAmount = await escrow.getHoldAmount(orderId);
            
            console.log('🔍 Hold Amount:', ethers.utils.formatEther(holdAmount), 'ETH');
            console.log('💰 Order Total:', order.totalAmount);
            
            const tx = await yem.confirmOrder(orderId, { value: holdAmount });
            await tx.wait();
            console.log('✅ Sipariş onaylandı:', tx.hash);
          } else {
            // Token siparişi için
            const tx = await yem.confirmOrder(orderId);
            await tx.wait();
            console.log('✅ Sipariş onaylandı:', tx.hash);
          }
        } else if (action === 'complete') {
          // Siparişi tamamla
          const tx = await yem.updateOrderStatus(orderId, 5); // 5 = Completed
          await tx.wait();
          console.log('✅ Sipariş tamamlandı:', tx.hash);
        } else if (action === 'cancel') {
          // Siparişi iptal et ve para iadesi yap
          console.log('🔄 Para iadesi ile birlikte sipariş iptal ediliyor...');
          
          let gasLimit;
          try {
            // Gas limit manuel olarak ayarla
            const gasEstimate = await yem.estimateGas.cancelOrder(orderId);
            gasLimit = gasEstimate.mul(120).div(100); // %20 buffer ekle
            console.log('⛽ Gas Estimate:', gasEstimate.toString());
            console.log('⛽ Gas Limit:', gasLimit.toString());
          } catch (gasError) {
            console.log('⚠️  Gas estimation başarısız, sabit limit kullanılıyor');
            gasLimit = ethers.BigNumber.from("200000"); // Sabit gas limit
          }
          
        const tx = await yem.cancelOrderAndRefund(orderId, {
            gasLimit: gasLimit
        });
          await tx.wait();
          console.log('✅ Sipariş iptal edildi ve para iade edildi:', tx.hash);
        }
        
      // Başarı mesajı
      showToast(
        `Sipariş ${action === 'confirm' ? 'onaylandı' : action === 'complete' ? 'tamamlandı' : 'iptal edildi ve para müşteriye iade edildi'}! (Blockchain işlemi yapıldı)`,
        'success',
        4000
      );
        
        // Siparişleri yeniden yükle (blockchain'den)
        await loadOrdersWithAddress(walletAddress);
      }
    } catch (error) {
      console.error('İşlem hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      showToast(`İşlem sırasında hata oluştu: ${errorMessage}`, 'error', 6000);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
  };

  const getFilteredOrders = () => {
    switch (activeFilter) {
      case 'pending':
        return orders.filter(order => order.status === 'pending');
      case 'confirmed':
        return orders.filter(order => order.status === 'confirmed');
      case 'completed':
        return orders.filter(order => order.status === 'completed');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  const getFilteredOrdersCount = (filter: FilterType) => {
    switch (filter) {
      case 'pending':
        return orders.filter(order => order.status === 'pending').length;
      case 'confirmed':
        return orders.filter(order => order.status === 'confirmed').length;
      case 'completed':
        return orders.filter(order => order.status === 'completed').length;
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled').length;
      default:
        return orders.length;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Bekliyor';
      case 'confirmed': return 'Onaylandı';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return 'Zaman bilgisi yok';
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Az önce';
    if (minutes < 60) return `${minutes} dakika önce`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  const getEmptyStateMessage = () => {
    switch (activeFilter) {
      case 'pending':
        return {
          icon: '⏳',
          title: 'Bekleyen sipariş yok',
          description: 'Şu anda bekleyen sipariş bulunmuyor. Tüm siparişler işlenmiş.'
        };
      case 'confirmed':
        return {
          icon: '✅',
          title: 'Onaylanan sipariş yok',
          description: 'Şu anda onaylanan sipariş bulunmuyor. Bekleyen siparişleri onaylayın.'
        };
      case 'completed':
        return {
          icon: '🎉',
          title: 'Tamamlanan sipariş yok',
          description: 'Şu anda tamamlanan sipariş bulunmuyor. Onaylanan siparişleri tamamlayın.'
        };
      case 'cancelled':
        return {
          icon: '❌',
          title: 'İptal edilen sipariş yok',
          description: 'Şu anda iptal edilen sipariş bulunmuyor. Tüm siparişler aktif durumda.'
        };
      default:
        return {
          icon: '🍽️',
          title: 'Henüz sipariş yok',
          description: 'Müşteriler sipariş vermeye başladığında burada görünecek'
        };
    }
  };

  // Ana menüye dön fonksiyonu
  const goToMainMenu = () => { window.location.assign('/'); };

  if (accessDenied) {
    return (
      <div className="restaurant-panel-container">
        <div className="panel-header">
          <button className="back-btn" onClick={goToMainMenu}>
            ← Ana Menüye Dön
          </button>
          <h1 className="panel-title">Restoran Paneli</h1>
        </div>
        
        <div className="panel-content">
          <div className="access-denied-message">
            <div className="access-denied-icon">⚠️</div>
            <h3 className="access-denied-title">Erişim Reddedildi</h3>
            <p className="access-denied-description">{accessError}</p>
            <button className="back-btn" onClick={goToMainMenu}>Ana Menüye Dön</button>
          </div>
        </div>
      </div>
    );
  }

  if (walletAddress === '') {
    return (
      <div className="restaurant-panel-container">
        <div className="panel-header">
          <button className="back-btn" onClick={goToMainMenu}>
            ← Ana Menüye Dön
          </button>
          <h1 className="panel-title">Restoran Paneli</h1>
        </div>
        
        <div className="panel-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Cüzdan bağlanıyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredOrders = getFilteredOrders();
  const emptyState = getEmptyStateMessage();

  return (
    <div className="restaurant-panel-container">
      {/* Panel Header */}
      <div className="panel-header">
        <div className="header-left">
          <button className="back-btn" onClick={goToMainMenu}>
            <span className="back-icon">←</span>
            Ana Menüye Dön
          </button>
        </div>
        
        <div className="header-center">
          <h1 className="panel-title">Restoran Paneli</h1>
          <p className="panel-subtitle">Siparişleri yönetin ve takip edin</p>
        </div>
        
        <div className="header-right">
        <button 
            className="refresh-btn" 
            onClick={() => loadOrdersWithAddress(walletAddress)} 
            disabled={loading}
          >
            <span className="refresh-icon">🔄</span>
            Yenile
          </button>

        </div>
      </div>

      {/* Panel Content */}
      <div className="panel-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-number">{orders.length}</h3>
              <p className="stat-label">Toplam Sipariş</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3 className="stat-number">{getFilteredOrdersCount('pending')}</h3>
              <p className="stat-label">Bekleyen</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-number">{getFilteredOrdersCount('confirmed')}</h3>
              <p className="stat-label">Onaylanan</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-content">
              <h3 className="stat-number">{getFilteredOrdersCount('completed')}</h3>
              <p className="stat-label">Tamamlanan</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="orders-section">
          <div className="section-header">
            <h2 className="section-title">Siparişler</h2>
            <div className="section-actions">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => handleFilterChange('all')}
              >
                Tümü ({orders.length})
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
                onClick={() => handleFilterChange('pending')}
              >
                Bekleyen ({getFilteredOrdersCount('pending')})
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'confirmed' ? 'active' : ''}`}
                onClick={() => handleFilterChange('confirmed')}
              >
                Onaylanan ({getFilteredOrdersCount('confirmed')})
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => handleFilterChange('completed')}
              >
                Tamamlanan ({getFilteredOrdersCount('completed')})
              </button>
              <button 
                className={`filter-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => handleFilterChange('cancelled')}
              >
                İptal Edilen ({getFilteredOrdersCount('cancelled')})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Siparişler yükleniyor...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{emptyState.icon}</div>
              <h3 className="empty-title">{emptyState.title}</h3>
              <p className="empty-description">{emptyState.description}</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map((order) => (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-id">{order.id}</h3>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    </div>
                    <div className="order-time">
                      {formatTime(order.timestamp)}
                    </div>
                  </div>
                  
                  <div className="order-details">
                    <div className="customer-info">
                      <span className="customer-label">Müşteri:</span>
                      <span className="customer-address">{order.customer}</span>
                    </div>
                    
                    <div className="items-list">
                      {order.items.map((item, index) => (
                        <div key={index} className="item-row">
                          <span className="item-name">{item}</span>
                          <span className="item-quantity">x{order.quantities[index]}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="order-summary">
                      <div className="payment-method">
                        <span className="method-label">Ödeme:</span>
                        <span className={`method-badge ${order.paymentMethod === 'ETH' ? 'eth' : 'token'}`}>
                          {order.paymentMethod === 'ETH' ? '💎 ETH' : '🪙 TOKEN'}
                        </span>
                      </div>
                      <div className="total-amount">
                        <span className="amount-label">Toplam:</span>
                        <span className="amount-value">{order.totalAmount}</span>
                      </div>
                    </div>
                </div>
                
                  <div className="order-actions">
                    {/* SADECE BEKLEYEN SİPARİŞLER İÇİN BUTONLAR GÖSTER */}
                    {order.status === 'pending' && (
                      <>
                        <button 
                          className="action-btn confirm-btn"
                          onClick={() => handleOrderAction(order.id, 'confirm')}
                          disabled={loading}
                        >
                          ✅ Onayla
                        </button>
                        <button 
                          className="action-btn cancel-btn"
                          onClick={() => handleOrderAction(order.id, 'cancel')}
                          disabled={loading}
                        >
                          ❌ İptal Et
                        </button>
                      </>
                    )}
                    
                    {/* SADECE ONAYLANAN SİPARİŞLER İÇİN TAMAMLA BUTONU */}
                    {order.status === 'confirmed' && (
                  <button
                        className="action-btn complete-btn"
                        onClick={() => handleOrderAction(order.id, 'complete')}
                    disabled={loading}
                      >
                        🎉 Tamamla
                  </button>
                )}
                    
                    {/* TAMAMLANAN SİPARİŞLER İÇİN BADGE */}
                    {order.status === 'completed' && (
                      <span className="completed-badge">✅ Tamamlandı</span>
                    )}
                    
                    {/* İPTAL EDİLEN SİPARİŞLER İÇİN BADGE - BUTON YOK! */}
                    {order.status === 'cancelled' && (
                      <span className="cancelled-badge">❌ İptal Edildi</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPanel;
