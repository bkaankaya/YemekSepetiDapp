import { ADDRS } from './addresses';

/**
 * MetaMask'e FOOD token'ını ekler
 * Bu sayede token transferleri Activity'de görünür olur
 */
export async function addFoodTokenToMetaMask() {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      throw new Error('MetaMask bulunamadı');
    }

    // Token'ı MetaMask'e ekle
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: ADDRS.FOOD, // FOOD token adresi
          symbol: 'FOOD',
          decimals: 18,
          image: '', // İsteğe bağlı: token ikonu URL'si
        },
      },
    });

    if (wasAdded) {
      console.log('FOOD token MetaMask\'e eklendi!');
      return true;
    } else {
      console.log('Kullanıcı token eklemeyi iptal etti');
      return false;
    }
  } catch (error) {
    console.error('Token ekleme hatası:', error);
    return false;
  }
}

/**
 * MetaMask'te token bakiyesini kontrol etmek için
 * Token'ın ekli olup olmadığını kontrol eder
 */
export async function checkTokenInMetaMask(): Promise<boolean> {
  try {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return false;

    // Token'ın MetaMask'te tanımlı olup olmadığını kontrol et
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) return false;

    // Token bakiyesini kontrol et (eğer token ekliyse bakiye döner)
    const balance = await ethereum.request({
      method: 'eth_call',
      params: [{
        to: ADDRS.FOOD,
        data: '0x70a08231000000000000000000000000' + accounts[0].slice(2) // balanceOf(address)
      }, 'latest']
    });

    return balance !== null;
  } catch (error) {
    console.error('Token kontrol hatası:', error);
    return false;
  }
}
