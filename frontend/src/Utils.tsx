export const convertToUSD = (amount: number, unitPrice: number) => {
  return amount * unitPrice;
}

export const convertToETH = (amount: number, unitPrice: number) => {
  return amount / unitPrice;
}

export const getUSDCard = (amount: number) => {
  return (<>
    <div className="card">
      <h2>USDC</h2>
      <p>{amount}</p>
    </div>
    </>
  )
}
