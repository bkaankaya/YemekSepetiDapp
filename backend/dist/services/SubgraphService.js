import axios from 'axios';
import { logger } from '../utils/logger.js';
import { CustomerRepository, RestaurantRepository, MenuItemRepository, OrderRepository } from '../data/repositories/index.js';
import { LOG_MESSAGES } from '../constants/index.js';
import { OrderStatus, PaymentMethod } from '../data/types.js';
export class SubgraphService {
    constructor() {
        this.customerRepository = new CustomerRepository();
        this.restaurantRepository = new RestaurantRepository();
        this.menuItemRepository = new MenuItemRepository();
        this.orderRepository = new OrderRepository();
        this.subgraphEndpoint = process.env.SUBGRAPH_ENDPOINT || 'http://localhost:8000/subgraphs/name/yemeksepeti-subgraph';
        logger.info('SubgraphService başlatıldı', { endpoint: this.subgraphEndpoint });
    }
    // Tüm verileri senkronize et
    async syncAllData() {
        try {
            logger.info(LOG_MESSAGES.SYNC_STARTED);
            await Promise.all([
                this.syncCustomers(),
                this.syncRestaurants(),
                this.syncMenuItems(),
                this.syncOrders()
            ]);
            logger.info(LOG_MESSAGES.SYNC_COMPLETED);
        }
        catch (error) {
            logger.error(LOG_MESSAGES.SYNC_ERROR, { error: error.message });
            throw error;
        }
    }
    // Müşterileri senkronize et
    async syncCustomers() {
        try {
            const query = `
        query GetCustomers($first: Int!, $skip: Int!) {
          customers(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            address
            name
            email
            phone
            createdAt
            updatedAt
          }
        }
      `;
            const customers = await this.querySubgraph(query, { first: 1000, skip: 0 });
            if (customers && customers.length > 0) {
                for (const subgraphCustomer of customers) {
                    await this.upsertCustomer(subgraphCustomer);
                }
                logger.info('Müşteriler senkronize edildi', { count: customers.length });
            }
        }
        catch (error) {
            logger.error('Müşteri senkronizasyon hatası', { error: error.message });
        }
    }
    // Restoranları senkronize et
    async syncRestaurants() {
        try {
            const query = `
        query GetRestaurants($first: Int!, $skip: Int!) {
          restaurants(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            address
            name
            description
            cuisine
            rating
            isActive
            acceptsTokens
            slippage
            createdAt
            updatedAt
          }
        }
      `;
            const restaurants = await this.querySubgraph(query, { first: 1000, skip: 0 });
            if (restaurants && restaurants.length > 0) {
                for (const subgraphRestaurant of restaurants) {
                    await this.upsertRestaurant(subgraphRestaurant);
                }
                logger.info('Restoranlar senkronize edildi', { count: restaurants.length });
            }
        }
        catch (error) {
            logger.error('Restoran senkronizasyon hatası', { error: error.message });
        }
    }
    // Menü öğelerini senkronize et
    async syncMenuItems() {
        try {
            const query = `
        query GetMenuItems($first: Int!, $skip: Int!) {
          menuItems(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            restaurant {
              id
            }
            name
            description
            price
            priceUSD
            category
            isAvailable
            createdAt
            updatedAt
          }
        }
      `;
            const menuItems = await this.querySubgraph(query, { first: 1000, skip: 0 });
            if (menuItems && menuItems.length > 0) {
                for (const subgraphMenuItem of menuItems) {
                    await this.upsertMenuItem(subgraphMenuItem);
                }
                logger.info('Menü öğeleri senkronize edildi', { count: menuItems.length });
            }
        }
        catch (error) {
            logger.error('Menü öğesi senkronizasyon hatası', { error: error.message });
        }
    }
    // Siparişleri senkronize et
    async syncOrders() {
        try {
            const query = `
        query GetOrders($first: Int!, $skip: Int!) {
          orders(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            customer {
              id
            }
            restaurant {
              id
            }
            items {
              menuItem {
                id
              }
              quantity
              unitPrice
              totalPrice
            }
            totalAmount
            totalAmountUSD
            status
            paymentMethod
            createdAt
            updatedAt
          }
        }
      `;
            const orders = await this.querySubgraph(query, { first: 1000, skip: 0 });
            if (orders && orders.length > 0) {
                for (const subgraphOrder of orders) {
                    await this.upsertOrder(subgraphOrder);
                }
                logger.info('Siparişler senkronize edildi', { count: orders.length });
            }
        }
        catch (error) {
            logger.error('Sipariş senkronizasyon hatası', { error: error.message });
        }
    }
    // Subgraph'e GraphQL sorgusu gönder
    async querySubgraph(query, variables = {}) {
        try {
            const response = await axios.post(this.subgraphEndpoint, { query, variables }, {
                timeout: 30000,
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.data.errors) {
                logger.error('Subgraph GraphQL hatası', { errors: response.data.errors });
                return null;
            }
            return response.data.data;
        }
        catch (error) {
            logger.error('Subgraph sorgu hatası', {
                error: error.message,
                query: query.substring(0, 100) + '...'
            });
            return null;
        }
    }
    // Müşteri upsert
    async upsertCustomer(subgraphCustomer) {
        try {
            const existingCustomer = await this.customerRepository.findByAddress(subgraphCustomer.address);
            if (existingCustomer) {
                // Güncelle
                existingCustomer.name = subgraphCustomer.name || '';
                existingCustomer.email = subgraphCustomer.email || '';
                existingCustomer.phone = subgraphCustomer.phone || '';
                existingCustomer.updatedAt = new Date();
                await this.customerRepository.save(existingCustomer);
            }
            else {
                // Yeni oluştur
                const customer = {
                    id: subgraphCustomer.id,
                    address: subgraphCustomer.address,
                    name: subgraphCustomer.name || '',
                    email: subgraphCustomer.email || '',
                    phone: subgraphCustomer.phone || '',
                    createdAt: new Date(subgraphCustomer.createdAt),
                    updatedAt: new Date(subgraphCustomer.updatedAt)
                };
                await this.customerRepository.save(customer);
            }
        }
        catch (error) {
            logger.error('Müşteri upsert hatası', {
                error: error.message,
                address: subgraphCustomer.address
            });
        }
    }
    // Restoran upsert
    async upsertRestaurant(subgraphRestaurant) {
        try {
            const existingRestaurant = await this.restaurantRepository.findByAddress(subgraphRestaurant.address);
            if (existingRestaurant) {
                // Güncelle
                existingRestaurant.name = subgraphRestaurant.name;
                existingRestaurant.description = subgraphRestaurant.description || '';
                existingRestaurant.cuisine = subgraphRestaurant.cuisine || '';
                existingRestaurant.rating = subgraphRestaurant.rating || 0;
                existingRestaurant.isActive = subgraphRestaurant.isActive;
                existingRestaurant.acceptsTokens = subgraphRestaurant.acceptsTokens;
                existingRestaurant.slippage = subgraphRestaurant.slippage;
                existingRestaurant.updatedAt = new Date();
                await this.restaurantRepository.save(existingRestaurant);
            }
            else {
                // Yeni oluştur
                const restaurant = {
                    id: subgraphRestaurant.id,
                    address: subgraphRestaurant.address,
                    name: subgraphRestaurant.name,
                    description: subgraphRestaurant.description || '',
                    cuisine: subgraphRestaurant.cuisine || '',
                    rating: subgraphRestaurant.rating || 0,
                    isActive: subgraphRestaurant.isActive,
                    acceptsTokens: subgraphRestaurant.acceptsTokens,
                    slippage: subgraphRestaurant.slippage,
                    createdAt: new Date(subgraphRestaurant.createdAt),
                    updatedAt: new Date(subgraphRestaurant.updatedAt)
                };
                await this.restaurantRepository.save(restaurant);
            }
        }
        catch (error) {
            logger.error('Restoran upsert hatası', {
                error: error.message,
                address: subgraphRestaurant.address
            });
        }
    }
    // Menü öğesi upsert
    async upsertMenuItem(subgraphMenuItem) {
        try {
            const existingMenuItem = await this.menuItemRepository.findById(subgraphMenuItem.id);
            if (existingMenuItem) {
                // Güncelle
                existingMenuItem.name = subgraphMenuItem.name;
                existingMenuItem.description = subgraphMenuItem.description || '';
                existingMenuItem.price = subgraphMenuItem.price;
                existingMenuItem.priceUSD = subgraphMenuItem.priceUSD;
                existingMenuItem.category = subgraphMenuItem.category || '';
                existingMenuItem.isAvailable = subgraphMenuItem.isAvailable;
                existingMenuItem.updatedAt = new Date();
                await this.menuItemRepository.save(existingMenuItem);
            }
            else {
                // Yeni oluştur
                const menuItem = {
                    id: subgraphMenuItem.id,
                    restaurantId: subgraphMenuItem.restaurant.id,
                    name: subgraphMenuItem.name,
                    description: subgraphMenuItem.description || '',
                    price: subgraphMenuItem.price,
                    priceUSD: subgraphMenuItem.priceUSD,
                    category: subgraphMenuItem.category || '',
                    isAvailable: subgraphMenuItem.isAvailable,
                    createdAt: new Date(subgraphMenuItem.createdAt),
                    updatedAt: new Date(subgraphMenuItem.updatedAt)
                };
                await this.menuItemRepository.save(menuItem);
            }
        }
        catch (error) {
            logger.error('Menü öğesi upsert hatası', {
                error: error.message,
                id: subgraphMenuItem.id
            });
        }
    }
    // Sipariş upsert
    async upsertOrder(subgraphOrder) {
        try {
            const existingOrder = await this.orderRepository.findById(subgraphOrder.id);
            if (existingOrder) {
                // Güncelle
                existingOrder.totalAmount = subgraphOrder.totalAmount;
                existingOrder.totalAmountUSD = subgraphOrder.totalAmountUSD;
                existingOrder.status = this.mapOrderStatus(subgraphOrder.status);
                existingOrder.paymentMethod = this.mapPaymentMethod(subgraphOrder.paymentMethod);
                existingOrder.updatedAt = new Date();
                await this.orderRepository.save(existingOrder);
            }
            else {
                // Yeni oluştur
                const order = {
                    id: subgraphOrder.id,
                    customerId: subgraphOrder.customer.id,
                    restaurantId: subgraphOrder.restaurant.id,
                    totalAmount: subgraphOrder.totalAmount,
                    totalAmountUSD: subgraphOrder.totalAmountUSD,
                    status: this.mapOrderStatus(subgraphOrder.status),
                    paymentMethod: this.mapPaymentMethod(subgraphOrder.paymentMethod),
                    createdAt: new Date(subgraphOrder.createdAt),
                    updatedAt: new Date(subgraphOrder.updatedAt),
                    items: []
                };
                await this.orderRepository.save(order);
                // Sipariş öğelerini oluştur
                for (const item of subgraphOrder.items) {
                    const orderItem = {
                        id: this.generateId(),
                        menuItemId: item.menuItem.id,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice
                    };
                    order.items.push(orderItem);
                }
                // Siparişi güncelle
                await this.orderRepository.save(order);
            }
        }
        catch (error) {
            logger.error('Sipariş upsert hatası', {
                error: error.message,
                id: subgraphOrder.id
            });
        }
    }
    // Basit ID generator
    generateId() {
        return `order_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    // Subgraph durumunu kontrol et
    async checkSubgraphHealth() {
        try {
            const query = `
        query HealthCheck {
          _meta {
            hasIndexingErrors
            block {
              number
            }
          }
        }
      `;
            const result = await this.querySubgraph(query);
            return result !== null;
        }
        catch (error) {
            logger.error('Subgraph health check başarısız', { error: error.message });
            return false;
        }
    }
    // Senkronizasyon istatistikleri
    async getSyncStats() {
        try {
            const [customers, restaurants, menuItems, orders] = await Promise.all([
                this.customerRepository.count(),
                this.restaurantRepository.count(),
                this.menuItemRepository.count(),
                this.orderRepository.count()
            ]);
            const lastSync = await this.getLastSyncTime();
            return {
                customers,
                restaurants,
                menuItems,
                orders,
                lastSync
            };
        }
        catch (error) {
            logger.error('Senkronizasyon istatistikleri alınamadı', { error: error.message });
            return {
                customers: 0,
                restaurants: 0,
                menuItems: 0,
                orders: 0,
                lastSync: null
            };
        }
    }
    // Son senkronizasyon zamanını al
    async getLastSyncTime() {
        try {
            const lastOrder = await this.orderRepository.findById('latest');
            return lastOrder?.updatedAt || null;
        }
        catch (error) {
            return null;
        }
    }
    // Belirli bir tarihten sonraki verileri senkronize et
    async syncDataSince(date) {
        try {
            logger.info('Belirli tarihten sonraki veriler senkronize ediliyor', { since: date });
            // Bu fonksiyon daha gelişmiş filtreleme için kullanılabilir
            // Şimdilik tüm verileri senkronize ediyoruz
            await this.syncAllData();
        }
        catch (error) {
            logger.error('Tarih bazlı senkronizasyon hatası', { error: error.message, date });
            throw error;
        }
    }
    // OrderStatus mapping
    mapOrderStatus(status) {
        switch (status) {
            case 'PENDING': return OrderStatus.PENDING;
            case 'CONFIRMED': return OrderStatus.CONFIRMED;
            case 'PREPARING': return OrderStatus.PREPARING;
            case 'READY': return OrderStatus.READY;
            case 'DELIVERED': return OrderStatus.DELIVERED;
            case 'CANCELLED': return OrderStatus.CANCELLED;
            default: return OrderStatus.PENDING;
        }
    }
    // PaymentMethod mapping
    mapPaymentMethod(method) {
        switch (method) {
            case 'ETH': return PaymentMethod.ETH;
            case 'FOOD_TOKEN': return PaymentMethod.FOOD_TOKEN;
            case 'FIAT': return PaymentMethod.FIAT;
            default: return PaymentMethod.ETH;
        }
    }
}
//# sourceMappingURL=SubgraphService.js.map