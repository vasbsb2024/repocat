/**
 * RepoCat ($RCAT) - Local Mainnet Creator
 * Creates the token securely via local script using standard Solana libraries.
 */

const {
    Connection,
    Keypair,
    clusterApiUrl,
    LAMPORTS_PER_SOL
} = require('@solana/web3.js');
const {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    setAuthority,
    AuthorityType
} = require('@solana/spl-token');
const fs = require('fs');

async function main() {
    // Σύνδεση με το κανονικό δίκτυο Solana Mainnet
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
    
    // Έλεγχος ή δημιουργία τοπικού πορτοφόλιου (keypair) στον φάκελο σου
    let payer;
    const walletPath = './wallet.json';
    
    if (fs.existsSync(walletPath)) {
        const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath)));
        payer = Keypair.fromSecretKey(secretKey);
        console.log(`[RepoCat] Φορτώθηκε το τοπικό πορτοφόλι: ${payer.publicKey.toBase58()}`);
    } else {
        payer = Keypair.generate();
        fs.writeFileSync(walletPath, JSON.stringify(Array.from(payer.secretKey)));
        console.log(`[RepoCat] Δημιουργήθηκε νέο πορτοφόλι: ${payer.publicKey.toBase58()}`);
        console.log(`[RepoCat] ΠΡΟΣΟΧΗ: Αποθηκεύτηκε στο αρχείο wallet.json τοπικά.`);
    }

    // Έλεγχος υπολοίπου
    const balance = await connection.getBalance(payer.publicKey);
    console.log(`[RepoCat] Τρέχον υπόλοιπο πορτοφολιού: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.005 * LAMPORTS_PER_SOL) {
        console.log("\n⚠️ Χρειάζεστε τουλάχιστον 0.005 SOL στο παραπάνω πορτοφόλι για τα τέλη δικτύου.");
        console.log("Στείλτε λίγα SOL στη διεύθυνση:", payer.publicKey.toBase58());
        console.log("Και τρέξτε πάλι την εντολή: node create-token.js");
        return;
    }

    console.log('[RepoCat] Δημιουργία Token Mint στο Solana Mainnet...');
    const mint = await createMint(
        connection,
        payer,
        payer.publicKey,
        payer.publicKey,
        9 // Decimals
    );
    console.log(`🎉 Επιτυχία! Token Address: ${mint.toBase58()}`);

    // Δημιουργία account και minting της συνολικής ποσότητας (1 Δισεκατομμύριο)
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
        connection, payer, mint, payer.publicKey
    );
    
    const supply = 1000000000 * 10 ** 9;
    await mintTo(connection, payer, mint, tokenAccount.address, payer, supply);
    console.log('[RepoCat] Κόπηκε η συνολική ποσότητα (1,000,000,000 RCAT).');

    // Κλείδωμα Mint Authority για απόλυτη ασφάλεια
    await setAuthority(connection, payer, mint, payer.publicKey, AuthorityType.MintTokens, null);
    console.log('[RepoCat] Το Mint Authority κλείδωσε οριστικά! Κανείς δεν μπορεί να τυπώσει άλλα tokens.');
}

main().catch(console.error);