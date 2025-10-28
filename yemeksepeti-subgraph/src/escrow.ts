import { BigInt } from "@graphprotocol/graph-ts"
import {
  Deposited,
  Refunded
} from "../generated/Escrow/Escrow"
import { Payment, Refund } from "../generated/schema"

export function handleDeposited(event: Deposited): void {
  let entity = new Payment(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.customer = event.params.payer.toHexString()
  entity.orderId = event.params.orderId
  entity.amount = event.params.amount
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}

export function handleRefunded(event: Refunded): void {
  let entity = new Refund(
    event.transaction.hash.concatI32(event.logIndex.toI32()).toHexString()
  )
  entity.customer = event.params.to.toHexString()
  entity.orderId = event.params.orderId
  entity.amount = event.params.amount
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.transactionHash = event.transaction.hash.toHexString()

  entity.save()
}
