// Script para verificar nombres de wallets en la base de datos
import { orm } from '../shared/db/orm.js';
import { Wallet } from '../wallet/wallet.entity.js';

async function checkWallets() {
  try {
    const em = orm.em.fork();
    const wallets = await em.find(Wallet, {});
    
    console.log('\n📋 Wallets en la base de datos:');
    console.log('='.repeat(50));
    
    wallets.forEach((wallet, index) => {
      console.log(`${index + 1}. "${wallet.name}"`);
    });
    
    console.log('='.repeat(50));
    console.log(`\nTotal: ${wallets.length} wallets encontradas\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
}

checkWallets();
