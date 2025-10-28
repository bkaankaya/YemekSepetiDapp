import axios from 'axios';
import { logger } from '../utils/logger.js';
import { CustomerRepository, RestaurantRepository, MenuItemRepository, OrderRepository } from '../data/repositories/index.js';
import { LOG_MESSAGES } from '../constants/index.js';
import { 
  SubgraphResponse, 
  SubgraphCustomer, 
  SubgraphRestaurant, 
  SubgraphMenuItem, 
  SubgraphOrder,
  PaginationParams 
} from '../types/index.js';
import { Customer, Restaurant, MenuItem, Order, OrderStatus } from '../data/types.js';

export class SubgraphService {
  private subgraphEndpoint: string;
  private customerRepository = new CustomerRepository();
  private restaurantRepository = new RestaurantRepository();
  private menuItemRepository = new MenuItemRepository();
  private orderRepository = new OrderRepository();

  constructor() {
    this.subgraphEndpoint = process.env.SUBGRAPH_ENDPOINT || 'http://localhost:8000/subgraphs/name/yemeksepeti-subgraph';
    logger.info('SubgraphService başlatıldı', { endpoint: this.subgraphEndpoint });
  }

  // Tüm verileri senkronize et
  async syncAllData(): Promise<void> {
    try {
      logger.info(LOG_MESSAGES.SYNC_STARTED);

      await Promise.all([
        this.syncCustomers(),
        this.syncRestaurants(),
        this.syncMenuItems(),
        this.syncOrders()
      ]);

      logger.info(LOG_MESSAGES.SYNC_COMPLETED);
    } catch (error) {
      logger.error(LOG_MESSAGES.SYNC_ERROR, { error: (error as Error).message });
      throw error;
    }
  }

  // Müşterileri senkronize et
  async syncCustomers(): Promise<void> {
    try {
      const query = `
        query GetCustomers($first: Int!, $skip: Int!) {
          customers(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            walletAddress
            realWorldAddress
            createdAt
            updatedAt
          }
        }
      `;

      const customers = await this.querySubgraph<SubgraphCustomer[]>(query, { first: 1000, skip: 0 });
      
      if (customers && customers.length > 0) {
        for (const subgraphCustomer of customers) {
          await this.upsertCustomer(subgraphCustomer);
        }
        
        logger.info('Müşteriler senkronize edildi', { count: customers.length });
      }
    } catch (error) {
      logger.error('Müşteri senkronizasyon hatası', { error: (error as Error).message });
    }
  }

  // Restoranları senkronize et
  async syncRestaurants(): Promise<void> {
    try {
      const query = `
        query GetRestaurants($first: Int!, $skip: Int!) {
          restaurants(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            walletAddress
            realWorldAddress
            defaultSlippageBps
            createdAt
            updatedAt
          }
        }
      `;

      const restaurants = await this.querySubgraph<SubgraphRestaurant[]>(query, { first: 1000, skip: 0 });
      
      if (restaurants && restaurants.length > 0) {
        for (const subgraphRestaurant of restaurants) {
          await this.upsertRestaurant(subgraphRestaurant);
        }
        
        logger.info('Restoranlar senkronize edildi', { count: restaurants.length });
      }
    } catch (error) {
      logger.error('Restoran senkronizasyon hatası', { error: (error as Error).message });
    }
  }

  // Menü öğelerini senkronize et
  async syncMenuItems(): Promise<void> {
    try {
      const query = `
        query GetMenuItems($first: Int!, $skip: Int!) {
          menuItems(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            name
            restaurant {
              walletAddress
            }
            priceQuote
            priceQuoteDecimals
            acceptedTokens
            createdAt
            updatedAt
          }
        }
      `;

      const menuItems = await this.querySubgraph<SubgraphMenuItem[]>(query, { first: 1000, skip: 0 });
      
      if (menuItems && menuItems.length > 0) {
        for (const subgraphMenuItem of menuItems) {
          await this.upsertMenuItem(subgraphMenuItem);
        }
        
        logger.info('Menü öğeleri senkronize edildi', { count: menuItems.length });
      }
    } catch (error) {
      logger.error('Menü öğesi senkronizasyon hatası', { error: (error as Error).message });
    }
  }

  // Siparişleri senkronize et
  async syncOrders(): Promise<void> {
    try {
      const query = `
        query GetOrders($first: Int!, $skip: Int!) {
          orders(first: $first, skip: $skip, orderBy: createdAt, orderDirection: desc) {
            id
            orderId
            customer {
              walletAddress
            }
            restaurant {
              walletAddress
            }
            itemName
            price
            paymentToken
            status
            createdAt
            updatedAt
            blockNumber
            transactionHash
          }
        }
      `;

      const orders = await this.querySubgraph<SubgraphOrder[]>(query, { first: 1000, skip: 0 });
      
      if (orders && orders.length > 0) {
        for (const subgraphOrder of orders) {
          await this.upsertOrder(subgraphOrder);
        }
        
        logger.info('Siparişler senkronize edildi', { count: orders.length });
      }
    } catch (error) {
      logger.error('Sipariş senkronizasyon hatası', { error: (error as Error).message });
    }
  }

  // Subgraph'e GraphQL sorgusu gönder
  private async querySubgraph<T>(query: string, variables: any = {}): Promise<T | null> {
    try {
      const response = await axios.post(
        this.subgraphEndpoint,
        { query, variables },
        { 
          timeout: 30000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data.errors) {
        logger.error('Subgraph GraphQL hatası', { errors: response.data.errors });
        return null;
      }

      return response.data.data;
    } catch (error) {
      logger.error('Subgraph sorgu hatası', { 
        error: (error as Error).message, 
        query: query.substring(0, 100) + '...' 
      });
      return null;
    }
  }

  // Müşteri upsert
  private async upsertCustomer(subgraphCustomer: SubgraphCustomer): Promise<void> {
    try {
      const existingCustomer = await this.customerRepository.findByWalletAddress(subgraphCustomer.walletAddress);

      if (existingCustomer) {
        // Güncelle
        existingCustomer.realWorldAddress = subgraphCustomer.realWorldAddress;
        existingCustomer.updatedAt = new Date();
        await this.customerRepository.save(existingCustomer);
      } else {
        // Yeni oluştur
        const customer: Customer = {
          id: subgraphCustomer.id,
          walletAddress: subgraphCustomer.walletAddress,
          realWorldAddress: subgraphCustomer.realWorldAddress,
          createdAt: new Date(subgraphCustomer.createdAt),
          updatedAt: new Date(subgraphCustomer.updatedAt)
        };
        await this.customerRepository.save(customer);
      }
    } catch (error) {
      logger.error('Müşteri upsert hatası', { 
        error: (error as Error).message, 
        walletAddress: subgraphCustomer.walletAddress 
      });
    }
  }

  // Restoran upsert
  private async upsertRestaurant(subgraphRestaurant: SubgraphRestaurant): Promise<void> {
    try {
      const existingRestaurant = await this.restaurantRepository.findByWalletAddress(subgraphRestaurant.walletAddress);

      if (existingRestaurant) {
        // Güncelle
        existingRestaurant.realWorldAddress = subgraphRestaurant.realWorldAddress;
        existingRestaurant.defaultSlippageBps = subgraphRestaurant.defaultSlippageBps;
        existingRestaurant.updatedAt = new Date();
        await this.restaurantRepository.save(existingRestaurant);
      } else {
        // Yeni oluştur
        const restaurant: Restaurant = {
          id: subgraphRestaurant.id,
          walletAddress: subgraphRestaurant.walletAddress,
          realWorldAddress: subgraphRestaurant.realWorldAddress,
          defaultSlippageBps: subgraphRestaurant.defaultSlippageBps,
          createdAt: new Date(subgraphRestaurant.createdAt),
          updatedAt: new Date(subgraphRestaurant.updatedAt)
        };
        await this.restaurantRepository.save(restaurant);
      }
    } catch (error) {
      logger.error('Restoran upsert hatası', { 
        error: (error as Error).message, 
        walletAddress: subgraphRestaurant.walletAddress 
      });
    }
  }

  // Menü öğesi upsert
  private async upsertMenuItem(subgraphMenuItem: SubgraphMenuItem): Promise<void> {
    try {
      const existingMenuItem = await this.menuItemRepository.findById(subgraphMenuItem.id);

      if (existingMenuItem) {
        // Güncelle
        existingMenuItem.name = subgraphMenuItem.name;
        existingMenuItem.restaurant = subgraphMenuItem.restaurant.walletAddress;
        existingMenuItem.priceQuote = subgraphMenuItem.priceQuote;
        existingMenuItem.priceQuoteDecimals = subgraphMenuItem.priceQuoteDecimals;
        existingMenuItem.acceptedTokens = subgraphMenuItem.acceptedTokens;
        existingMenuItem.updatedAt = new Date();
        await this.menuItemRepository.save(existingMenuItem);
      } else {
        // Yeni oluştur
        const menuItem: MenuItem = {
          id: subgraphMenuItem.id,
          name: subgraphMenuItem.name,
          restaurant: subgraphMenuItem.restaurant.walletAddress,
          priceQuote: subgraphMenuItem.priceQuote,
          priceQuoteDecimals: subgraphMenuItem.priceQuoteDecimals,
          acceptedTokens: subgraphMenuItem.acceptedTokens,
          createdAt: new Date(subgraphMenuItem.createdAt),
          updatedAt: new Date(subgraphMenuItem.updatedAt)
        };
        await this.menuItemRepository.save(menuItem);
      }
    } catch (error) {
      logger.error('Menü öğesi upsert hatası', { 
        error: (error as Error).message, 
        id: subgraphMenuItem.id 
      });
    }
  }

  // Sipariş upsert
  private async upsertOrder(subgraphOrder: SubgraphOrder): Promise<void> {
    try {
      const existingOrder = await this.orderRepository.findById(subgraphOrder.id);

      if (existingOrder) {
        // Güncelle
        existingOrder.orderId = subgraphOrder.orderId;
        existingOrder.customer = subgraphOrder.customer.walletAddress;
        existingOrder.restaurant = subgraphOrder.restaurant.walletAddress;
        existingOrder.itemName = subgraphOrder.itemName;
        existingOrder.price = subgraphOrder.price;
        existingOrder.paymentToken = subgraphOrder.paymentToken;
        existingOrder.status = this.mapOrderStatus(subgraphOrder.status);
        existingOrder.updatedAt = new Date();
        await this.orderRepository.save(existingOrder);
      } else {
        // Yeni oluştur
        const order: Order = {
          id: subgraphOrder.id,
          orderId: subgraphOrder.orderId,
          customer: subgraphOrder.customer.walletAddress,
          restaurant: subgraphOrder.restaurant.walletAddress,
          itemName: subgraphOrder.itemName,
          price: subgraphOrder.price,
          paymentToken: subgraphOrder.paymentToken,
          status: this.mapOrderStatus(subgraphOrder.status),
          blockNumber: subgraphOrder.blockNumber,
          transactionHash: subgraphOrder.transactionHash,
          createdAt: new Date(subgraphOrder.createdAt),
          updatedAt: new Date(subgraphOrder.updatedAt)
        };
        await this.orderRepository.save(order);
      }
    } catch (error) {
      logger.error('Sipariş upsert hatası', { 
        error: (error as Error).message, 
        id: subgraphOrder.id 
      });
    }
  }

  // Order status mapping
  private mapOrderStatus(status: string): OrderStatus {
    switch (status) {
      case 'Placed': return OrderStatus.Placed;
      case 'Confirmed': return OrderStatus.Confirmed;
      case 'CancelReqByCustomer': return OrderStatus.CancelReqByCustomer;
      case 'CancelReqByRestaurant': return OrderStatus.CancelReqByRestaurant;
      case 'Cancelled': return OrderStatus.Cancelled;
      case 'Completed': return OrderStatus.Completed;
      default: return OrderStatus.Placed;
    }
  }
}
