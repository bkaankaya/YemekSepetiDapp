export declare class SubgraphService {
    private subgraphEndpoint;
    private customerRepository;
    private restaurantRepository;
    private menuItemRepository;
    private orderRepository;
    constructor();
    syncAllData(): Promise<void>;
    syncCustomers(): Promise<void>;
    syncRestaurants(): Promise<void>;
    syncMenuItems(): Promise<void>;
    syncOrders(): Promise<void>;
    private querySubgraph;
    private upsertCustomer;
    private upsertRestaurant;
    private upsertMenuItem;
    private upsertOrder;
    private generateId;
    checkSubgraphHealth(): Promise<boolean>;
    getSyncStats(): Promise<{
        customers: number;
        restaurants: number;
        menuItems: number;
        orders: number;
        lastSync: Date | null;
    }>;
    private getLastSyncTime;
    syncDataSince(date: Date): Promise<void>;
    private mapOrderStatus;
    private mapPaymentMethod;
}
//# sourceMappingURL=SubgraphService.d.ts.map