import axios from 'axios';
import { AppDataSource } from '../config/database.js';
import { Order, Customer, Restaurant, MenuItem, PriceUpdate } from '../entities/index.js';
import { logger } from '../utils/logger.js';

export class SubgraphService {
  private subgraphEndpoint: string;

  constructor() {
    this.subgraphEndpoint = process.env.SUBGRAPH_ENDPOINT || 'http://localhost:8000/subgraphs/name/yemeksepeti-subgraph';
  }

  async syncAllData() {
    try {
      logger.info('🔄 Subgraph verilerini senkronize etmeye başlıyorum...');
      
      await this.syncCustomers();
      await this.syncRestaurants();
      await this.syncMenuItems();
      await this.syncOrders();
      await this.syncPriceUpdates();
      
      logger.info('✅ Tüm veriler başarıyla senkronize edildi');
    } catch (error) {
      logger.error('❌ Veri senkronizasyon hatası:', error);
      throw error;
    }
  }

  private async querySubgraph(query: string, variables?: any) {
    try {
      const response = await axios.post(this.subgraphEndpoint, {
        query,
        variables,
      });

      if (response.data.errors) {
        throw new Error(`GraphQL Error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.data;
    } catch (error) {
      logger.error('Subgraph sorgu hatası:', error);
      throw error;
    }
  }

  private async syncCustomers() {
    const query = `
      query {
        customers {
          id
          walletAddress
          realWorldAddress
        }
      }
    `;

    const data = await this.querySubgraph(query);
    if (!data?.customers) return;

    const customerRepository = AppDataSource.getRepository(Customer);
    
    for (const customerData of data.customers) {
      const existingCustomer = await customerRepository.findOne({
        where: { walletAddress: customerData.walletAddress }
      });

      if (!existingCustomer) {
        const customer = customerRepository.create({
          walletAddress: customerData.walletAddress,
          realWorldAddress: customerData.realWorldAddress || ''
        });
        await customerRepository.save(customer);
        logger.info(`👤 Yeni müşteri eklendi: ${customerData.walletAddress}`);
      }
    }
  }

  private async syncRestaurants() {
    const query = `
      query {
        restaurants {
          id
          walletAddress
          realWorldAddress
          defaultSlippageBps
        }
      }
    `;

    const data = await this.querySubgraph(query);
    if (!data?.restaurants) return;

    const restaurantRepository = AppDataSource.getRepository(Restaurant);
    
    for (const restaurantData of data.restaurants) {
      const existingRestaurant = await restaurantRepository.findOne({
        where: { walletAddress: restaurantData.walletAddress }
      });

      if (!existingRestaurant) {
        const restaurant = restaurantRepository.create({
          walletAddress: restaurantData.walletAddress,
          realWorldAddress: restaurantData.realWorldAddress || '',
          defaultSlippageBps: restaurantData.defaultSlippageBps || 0
        });
        await restaurantRepository.save(restaurant);
        logger.info(`🍕 Yeni restoran eklendi: ${restaurantData.walletAddress}`);
      }
    }
  }

  private async syncMenuItems() {
    const query = `
      query {
        menuItems {
          id
          name
          restaurant {
            walletAddress
          }
          priceQuote
          priceQuoteDecimals
          acceptedTokens
        }
      }
    `;

    const data = await this.querySubgraph(query);
    if (!data?.menuItems) return;

    const menuItemRepository = AppDataSource.getRepository(MenuItem);
    const restaurantRepository = AppDataSource.getRepository(Restaurant);
    
    for (const menuItemData of data.menuItems) {
      const restaurant = await restaurantRepository.findOne({
        where: { walletAddress: menuItemData.restaurant.walletAddress }
      });

      if (restaurant) {
        const existingMenuItem = await menuItemRepository.findOne({
          where: { 
            name: menuItemData.name,
            restaurant: { id: restaurant.id }
          }
        });

        if (!existingMenuItem) {
          const menuItem = menuItemRepository.create({
            name: menuItemData.name,
            restaurant,
            priceQuote: parseFloat(menuItemData.priceQuote) / Math.pow(10, menuItemData.priceQuoteDecimals),
            priceQuoteDecimals: menuItemData.priceQuoteDecimals,
            acceptedTokens: menuItemData.acceptedTokens || []
          });
          await menuItemRepository.save(menuItem);
          logger.info(`🍽️ Yeni menü öğesi eklendi: ${menuItemData.name}`);
        }
      }
    }
  }

  private async syncOrders() {
    const query = `
      query {
        orders {
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

    const data = await this.querySubgraph(query);
    if (!data?.orders) return;

    const orderRepository = AppDataSource.getRepository(Order);
    const customerRepository = AppDataSource.getRepository(Customer);
    const restaurantRepository = AppDataSource.getRepository(Restaurant);
    
    for (const orderData of data.orders) {
      const existingOrder = await orderRepository.findOne({
        where: { orderId: orderData.orderId }
      });

      if (!existingOrder) {
        const customer = await customerRepository.findOne({
          where: { walletAddress: orderData.customer.walletAddress }
        });

        const restaurant = await restaurantRepository.findOne({
          where: { walletAddress: orderData.restaurant.walletAddress }
        });

        if (customer && restaurant) {
          const order = orderRepository.create({
            orderId: orderData.orderId,
            customer,
            restaurant,
            itemName: orderData.itemName,
            price: parseFloat(orderData.price) / Math.pow(10, 18),
            paymentToken: orderData.paymentToken,
            status: orderData.status,
            blockNumber: orderData.blockNumber,
            transactionHash: orderData.transactionHash
          });
          await orderRepository.save(order);
          logger.info(`📦 Yeni sipariş eklendi: ${orderData.orderId}`);
        }
      }
    }
  }

  private async syncPriceUpdates() {
    const query = `
      query {
        priceUpdates {
          id
          itemName
          oldPrice
          newPrice
          timestamp
          blockNumber
          transactionHash
        }
      }
    `;

    const data = await this.querySubgraph(query);
    if (!data?.priceUpdates) return;

    const priceUpdateRepository = AppDataSource.getRepository(PriceUpdate);
    
    for (const priceUpdateData of data.priceUpdates) {
      const existingPriceUpdate = await priceUpdateRepository.findOne({
        where: { 
          itemName: priceUpdateData.itemName,
          transactionHash: priceUpdateData.transactionHash
        }
      });

      if (!existingPriceUpdate) {
        const priceUpdate = priceUpdateRepository.create({
          itemName: priceUpdateData.itemName,
          oldPrice: parseFloat(priceUpdateData.oldPrice) / Math.pow(10, 18),
          newPrice: parseFloat(priceUpdateData.newPrice) / Math.pow(10, 18),
          blockNumber: priceUpdateData.blockNumber,
          transactionHash: priceUpdateData.transactionHash
        });
        await priceUpdateRepository.save(priceUpdate);
        logger.info(`💰 Yeni fiyat güncellemesi eklendi: ${priceUpdateData.itemName}`);
      }
    }
  }
}
