
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './service-account.json' assert { type: 'json' };

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

const keywords = "crypto, transfer, deposit, winner, prize, investment, bank account, card details, 匯款, 投資, 虛擬貨幣, 獲獎, 轉帳, 獎金, 兼職, 振込, 当選, 仮想通貨, 口座, 송금, 당첨, 가상화폐, 계좌, transferencia, premio, cuenta bancaria, inversión, bonifico, vincitore, conto bancario";

async function seed() {
    console.log('Seeding configuration/settings...');
    await db.doc('configuration/settings').set({
        custom_scam_keywords: keywords
    }, { merge: true });
    console.log('Done.');
}

seed();
