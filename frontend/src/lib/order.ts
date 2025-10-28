import { readContract, writeContract, waitForTransaction } from 'wagmi/actions';
import { type Hash } from 'viem';
import { YEMEKSEPETI_ADDRESS, ESCROW_ADDRESS, FOOD_ADDRESS, yemAbi } from './contracts';
import { erc20ABI } from 'wagmi';

type PayMethod = 'ETH' | 'TOKEN'; // PayMethod tipi sadece 'ETH' veya 'TOKEN' stringlerinden biri olabilir

export async function quote(restaurant: `0x${string}`, item: string, method: PayMethod) {
  const token = method === 'ETH' ? '0x0000000000000000000000000000000000000000' : FOOD_ADDRESS;
  const [amountToPay, mode] = await readContract({
    address: YEMEKSEPETI_ADDRESS,
    abi: yemAbi as any,
    functionName: 'getRequiredPaymentMany',
    args: [restaurant, [item], [1], token]
  }) as unknown as readonly [bigint, number];

  return { amount: amountToPay, mode, token: token as `0x${string}` }
}

export async function checkoutETH(restaurant: `0x${string}`, item: string) {
  const { amount } = await quote(restaurant, item, 'ETH'); // wei
  const { hash } = await writeContract({
    address: YEMEKSEPETI_ADDRESS,
    abi: yemAbi as any,
    functionName: 'createOrderETHDynamicMany',
    args: [restaurant, [item], [1]],
    value: amount
  });
  return hash as Hash;
}

export async function checkoutToken(restaurant: `0x${string}`, item: string) {
  const { amount } = await quote(restaurant, item, 'TOKEN'); // token amount (FOOD)
  // 1) approve Escrow
  const { hash: approveHash } = await writeContract({
    address: FOOD_ADDRESS,
    abi: erc20ABI as any,
    functionName: 'approve',
    args: [ESCROW_ADDRESS, amount]
  });
  await waitForTransaction({ hash: approveHash });

  // 2) create order (token) - YENİ: expectedAmountPerItem parametresi yok
  const { hash } = await writeContract({
    address: YEMEKSEPETI_ADDRESS,
    abi: yemAbi as any,
    functionName: 'createOrderTokenDynamicMany',
    args: [restaurant, [item], [1], FOOD_ADDRESS] // [restaurant, items, qtys, token]
  });
  return hash as Hash;
}
