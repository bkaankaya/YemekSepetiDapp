import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useBalance, useDisconnect } from 'wagmi'
import './App.css'

function MyConnector({ network }: { network: string }) {
  const { disconnect } = useDisconnect()

  const { address } = useAccount();

  return (
    <div>
      <h1>My Connector ({network})</h1>
      <span>{address}</span>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

export default MyConnector
