import { BigInt, Address } from "@graphprotocol/graph-ts"
import {
  OrderCreated,
  OrderConfirmed,
  OrderCancelled,
  OrderStatusUpdated,
  DefaultSlippageUpdated,
  ItemSlippageUpdated
} from "../generated/YemekSepeti/YemekSepeti"
import { Order, Restaurant, Customer, MenuItem, ItemSlippage, SlippageUpdate } from "../generated/schema"

export function handleOrderCreated(event: OrderCreated): void {
  let order = new Order(event.params.orderId.toString())
  order.orderId = event.params.orderId
  order.customer = event.params.customer.toHexString()
  order.restaurant = event.params.restaurant.toHexString()
  order.itemName = event.params.itemName
  order.price = BigInt.fromI32(0) // Price will be set later when order is confirmed
  order.paymentToken = "0x0000000000000000000000000000000000000000" // Default to ETH
  order.status = "CREATED"
  order.createdAt = event.block.timestamp
  order.updatedAt = event.block.timestamp
  order.blockNumber = event.block.number
  order.transactionHash = event.transaction.hash.toHexString()
  
  // Customer entity'sini oluştur/güncelle
  let customerId = event.params.customer.toHexString()
  let customer = Customer.load(customerId)
  if (!customer) {
    customer = new Customer(customerId)
    customer.walletAddress = event.params.customer.toHexString()
    customer.realWorldAddress = "Unknown" // Kontrat'ta event yok
  }
  customer.save()
  
  // Restaurant entity'sini oluştur/güncelle
  let restaurantId = event.params.restaurant.toHexString()
  let restaurant = Restaurant.load(restaurantId)
  if (!restaurant) {
    restaurant = new Restaurant(restaurantId)
    restaurant.walletAddress = event.params.restaurant.toHexString()
    restaurant.realWorldAddress = "Unknown" // Kontrat'ta event yok
    restaurant.defaultSlippageBps = 0
  }
  restaurant.save()
  
  // MenuItem entity'sini oluştur/güncelle
  let menuItemId = restaurantId + "-" + event.params.itemName
  let menuItem = MenuItem.load(menuItemId)
  if (!menuItem) {
    menuItem = new MenuItem(menuItemId)
    menuItem.name = event.params.itemName
    menuItem.restaurant = restaurantId
    menuItem.priceQuote = BigInt.fromI32(0) // Kontrat'ta event yok
    menuItem.priceQuoteDecimals = 0
    menuItem.acceptedTokens = []
  }
  menuItem.save()
  
  order.save()
}

export function handleOrderConfirmed(event: OrderConfirmed): void {
  let order = Order.load(event.params.orderId.toString())
  if (order) {
    order.status = "CONFIRMED"
    order.updatedAt = event.block.timestamp
    order.save()
  }
}

export function handleOrderCancelled(event: OrderCancelled): void {
  let order = Order.load(event.params.orderId.toString())
  if (order) {
    order.status = "CANCELLED"
    order.updatedAt = event.block.timestamp
    order.save()
  }
}

export function handleOrderStatusUpdated(event: OrderStatusUpdated): void {
  let order = Order.load(event.params.orderId.toString())
  if (order) {
    // OrderStatus enum değerlerini string'e çevir
    let status = "UNKNOWN"
    if (event.params.newStatus == 0) status = "PENDING"
    else if (event.params.newStatus == 1) status = "CONFIRMED"
    else if (event.params.newStatus == 2) status = "CANCELLED"
    else if (event.params.newStatus == 3) status = "COMPLETED"
    
    order.status = status
    order.updatedAt = event.block.timestamp
    order.save()
  }
}

export function handleDefaultSlippageUpdated(event: DefaultSlippageUpdated): void {
  let restaurantId = event.params.restaurant.toHexString()
  let restaurant = Restaurant.load(restaurantId)
  
  if (!restaurant) {
    restaurant = new Restaurant(restaurantId)
    restaurant.walletAddress = event.params.restaurant.toHexString()
    restaurant.realWorldAddress = "Unknown"
    restaurant.defaultSlippageBps = 0
  }
  
  restaurant.defaultSlippageBps = event.params.bps
  restaurant.save()
}

export function handleItemSlippageUpdated(event: ItemSlippageUpdated): void {
  let restaurantId = event.params.restaurant.toHexString()
  let itemSlippageId = restaurantId + "-" + event.params.item
  
  let itemSlippage = ItemSlippage.load(itemSlippageId)
  if (!itemSlippage) {
    itemSlippage = new ItemSlippage(itemSlippageId)
    itemSlippage.restaurant = restaurantId
    itemSlippage.itemName = event.params.item
  }
  
  itemSlippage.slippageBps = event.params.bps
  itemSlippage.save()
  
  // SlippageUpdate entity'sine kaydet
  let slippageUpdateId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  let slippageUpdate = new SlippageUpdate(slippageUpdateId)
  slippageUpdate.restaurant = restaurantId
  slippageUpdate.itemName = event.params.item
  slippageUpdate.slippageBps = event.params.bps
  slippageUpdate.timestamp = event.block.timestamp
  slippageUpdate.blockNumber = event.block.number
  slippageUpdate.transactionHash = event.transaction.hash.toHexString()
  slippageUpdate.save()
}
