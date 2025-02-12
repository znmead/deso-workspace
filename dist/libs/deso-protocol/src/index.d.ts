import { Identity } from './lib/identity/Identity';
import { MetaData } from './lib/meta-data/MetaData';
import { Miner } from './lib/miner/Miner';
import { Nft } from './lib/nft/Nft';
import { Notification } from './lib/notification/Notification';
import { Posts } from './lib/post/Posts';
import { Referral } from './lib/referral/Referral';
import { Social } from './lib/social/Social';
import { User } from './lib/user/User';
import { Node } from './lib/node/Node';
import { Wallet } from './lib/wallet/Wallet';
import { Transactions } from './lib/transaction/Transaction';
export declare class Deso {
    constructor();
    node: Node;
    identity: Identity;
    private admin;
    private media;
    metaData: MetaData;
    miner: Miner;
    nft: Nft;
    notification: Notification;
    user: User;
    social: Social;
    posts: Posts;
    transaction: typeof Transactions;
    wallet: Wallet;
    referral: Referral;
}
export default Deso;
