import { useState, useMemo } from 'react'
import {
  useContractRead, //Kontrattan veri okur
  usePrepareContractWrite, // Transaction hazırlığı yapar
  useContractWrite, // Transaction'ı gönderir
  useWaitForTransaction, //Transaction'ın onaylanmasını bekler
} from 'wagmi'
import { parseUnits, formatUnits, isAddress } from 'viem'

const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// Sepolia USDC
const USDC_ADDRESS = '0xA0b86a33E6417C00B2516B0B3B50C9D7C72bb40b' as `0x${string}` //TypeScriptte type casting yapıyoruz
const USDC_DECIMALS = 6

interface ContractInteractionProps {
  userAddress: string
}

export function ContractInteraction({ userAddress }: ContractInteractionProps) {
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')

  // ----- READ: balanceOf -----
  const {
    data: balanceRaw,
    refetch: refetchBalance,
    isLoading: reading,
    error: readError,
  } = useContractRead({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [userAddress as `0x${string}`],
    watch: true, // yeni bloklarda otomatik güncelle
  })

  const balance = useMemo(
    () => (balanceRaw ? formatUnits(balanceRaw as bigint, USDC_DECIMALS) : '0'),
    [balanceRaw]
  )

  // ----- WRITE: transfer -----
  const amountBN = useMemo(() => {
    try {
      return parseUnits(transferAmount || '0', USDC_DECIMALS)
    } catch {
      return undefined
    }
  }, [transferAmount])

  const writeEnabled =
    isAddress(transferTo) && !!amountBN && (amountBN as bigint) > 0n

  // v0.x: önce prepare, sonra write
  const { config } = usePrepareContractWrite({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [transferTo as `0x${string}`, amountBN as bigint],
    enabled: writeEnabled,
  })

  const {
    write, // çağrılacak fonksiyon
    data: txData, // { hash } içerir
    isLoading: isWriting,
    error: writeError,
  } = useContractWrite(config)

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: waitError,
  } = useWaitForTransaction({ hash: txData?.hash })

  const handleTransfer = () => {
    if (!writeEnabled || !write) return
    write()
  }

  return (
    <div className="contract-interaction">
      <h3>Contract Interaction Example</h3>

      <div className="balance-section">
        <h4>USDC Balance (Sepolia)</h4>
        <p>
          {reading ? 'Yükleniyor…' : `${balance} USDC`}
          {readError && (
            <span style={{ color: 'tomato' }}> • Hata: {readError.message}</span>
          )}
        </p>
        <button onClick={() => refetchBalance()}>Refresh Balance</button>
      </div>

      <div className="transfer-section" style={{ marginTop: 16 }}>
        <h4>Transfer USDC</h4>

        <div className="form-group">
          <label>
            To Address:
            <input
              type="text"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="0x…"
              style={{ width: '100%' }}
            />
          </label>
        </div>

        <div className="form-group" style={{ marginTop: 8 }}>
          <label>
            Amount:
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.0"
              step="0.000001"
              style={{ width: '100%' }}
            />
          </label>
        </div>

        {!isAddress(transferTo) && transferTo.length > 0 && (
          <div style={{ color: 'tomato', marginTop: 6 }}>Geçersiz adres</div>
        )}

        {writeError && (
          <div style={{ color: 'tomato', marginTop: 6 }}>
            Yazma hatası: {writeError.message}
          </div>
        )}
        {waitError && (
          <div style={{ color: 'tomato', marginTop: 6 }}>
            Onay hatası: {waitError.message}
          </div>
        )}

        <button
          onClick={handleTransfer}
          disabled={!writeEnabled || isWriting || isConfirming || !write}
          style={{ marginTop: 10 }}
        >
          {isWriting
            ? 'İmza bekleniyor…'
            : isConfirming
            ? 'İşlem onaylanıyor…'
            : 'Transfer'}
        </button>

        {txData?.hash && (
          <div className="transaction-status" style={{ marginTop: 8 }}>
            <div>Tx: {txData.hash}</div>
            {isConfirmed && (
              <div style={{ color: 'green' }}>İşlem onaylandı ✓</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
