const ethers = require("ethers");

const IconService = require('icon-sdk-js');
const { IconWallet } = IconService;

const EC = require("elliptic").ec;
const TonWeb = require("tonweb");

const ec = new EC("secp256k1");
const nacl = TonWeb.utils.nacl;

const DEFAULT_WALLET_VERSION = "v3R2";

const mainnetRpc = "https://toncenter.com/api/v2/jsonRPC";
const testnetRpc = "https://testnet.toncenter.com/api/v2/jsonRPC";

const apiKey = "";
const isTestnet = false;

(async () => {
    let ton = new TonWeb(
        new TonWeb.HttpProvider(isTestnet ? testnetRpc : mainnetRpc, {
            apiKey: apiKey,
        })
    );

    if(!process.argv[2]) {
        console.log("[[private key not found]]")
        return
    }

    const evmPK = process.argv[2].replace("0x", "");

    if(evmPK.length !== 64) {
        console.log("[[pk length must be 64]]")
        return
    }
    const key = ec.keyFromPrivate(evmPK);
    const tonPK = Buffer.from(evmPK, "hex").toString(
        "base64"
    );

    const keyPair = nacl.sign.keyPair.fromSeed(
        TonWeb.utils.base64ToBytes(tonPK)
    );
    const walletVersion = DEFAULT_WALLET_VERSION;
    const WalletClass = ton.wallet.all[walletVersion];
    walletContract = new WalletClass(ton.provider, {
        publicKey: keyPair.publicKey,
        wc: 0,
    });
    
    const addr = await walletContract.getAddress();
    const tonV3R2Address = addr.toString(true, true, true);
    const wallet = await IconWallet.loadPrivateKey(evmPK);
    console.log({
        eth_address: ethers.utils.computeAddress(
            `0x${key.getPublic().encode("hex")}`
        ),
        tonV3R2Address,
        ethPublic: `0x${key.getPublic().encode("hex")}`,
        tonPublic: `0x${Buffer.from(keyPair.publicKey).toString("hex")}`,
        icon_address: wallet.getAddress()
    });
})();
