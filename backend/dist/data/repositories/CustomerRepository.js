import { BaseRepository } from './BaseRepository.js';
import { redisDatabase } from '../../config/database.js';
import { logger } from '../../utils/logger.js';
export class CustomerRepository extends BaseRepository {
    constructor() {
        super(...arguments);
        this.entityKey = 'customer';
        this.entityName = 'Customer';
    }
    matchesSearchPattern(entity, pattern) {
        const searchPattern = pattern.toLowerCase();
        return (entity.name.toLowerCase().includes(searchPattern) ||
            entity.email.toLowerCase().includes(searchPattern) ||
            entity.address.toLowerCase().includes(searchPattern) ||
            entity.phone.includes(searchPattern));
    }
    // Find customer by address
    async findByAddress(address) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            for (const id of allIds) {
                const customer = await this.findById(id);
                if (customer && customer.address.toLowerCase() === address.toLowerCase()) {
                    return customer;
                }
            }
            return null;
        }
        catch (error) {
            logger.error('Customer adres ile bulma hatası', { error: error.message, address });
            return null;
        }
    }
    // Find customer by email
    async findByEmail(email) {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            for (const id of allIds) {
                const customer = await this.findById(id);
                if (customer && customer.email.toLowerCase() === email.toLowerCase()) {
                    return customer;
                }
            }
            return null;
        }
        catch (error) {
            logger.error('Customer email ile bulma hatası', { error: error.message, email });
            return null;
        }
    }
    // Find customers with filters
    async findWithFilters(filters, params) {
        try {
            if (filters.search) {
                return await this.search(filters.search, params);
            }
            return await this.findAll(params);
        }
        catch (error) {
            logger.error('Customer filtre ile bulma hatası', { error: error.message, filters });
            throw error;
        }
    }
    // Get customer statistics
    async getStats() {
        try {
            const indexKey = this.getIndexKey();
            const allIds = await redisDatabase.getClient().sMembers(indexKey);
            let lastCreated = null;
            for (const id of allIds) {
                const customer = await this.findById(id);
                if (customer) {
                    if (!lastCreated || customer.createdAt > lastCreated) {
                        lastCreated = customer.createdAt;
                    }
                }
            }
            return {
                total: allIds.length,
                active: allIds.length, // All customers are considered active
                lastCreated
            };
        }
        catch (error) {
            logger.error('Customer istatistik hatası', { error: error.message });
            return {
                total: 0,
                active: 0,
                lastCreated: null
            };
        }
    }
}
//# sourceMappingURL=CustomerRepository.js.map