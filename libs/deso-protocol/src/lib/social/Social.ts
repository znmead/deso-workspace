import {
  CreateFollowTxnStatelessRequest,
  CreateFollowTxnStatelessResponse,
  CreateLikeStatelessRequest,
  CreateLikeStatelessResponse,
  GetDecryptMessagesResponse,
  GetDiamondsForPublicKeyRequest,
  GetDiamondsForPublicKeyResponse,
  GetFollowsResponse,
  GetFollowsStatelessRequest,
  GetHodlersForPublicKeyRequest,
  GetHodlersForPublicKeyResponse,
  GetMessagesResponse,
  GetMessagesStatelessRequest,
  IsFolllowingPublicKeyResponse,
  IsFollowingPublicKeyRequest,
  IsHodlingPublicKeyRequest,
  IsHodlingPublicKeyResponse,
  MessageContactResponse,
  SendDiamondsRequest,
  SendDiamondsResponse,
  SendMessageStatelessRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from 'deso-protocol-types';
import axios from 'axios';
import { Identity } from '../identity/Identity';
import { Node } from '../node/Node';
import { User } from '../user/User';

export class Social {
  private node: Node;
  private identity: Identity;
  user: User;

  constructor(node: Node, identity: Identity, user: User) {
    this.user = user;
    this.node = node;
    this.identity = identity;
  }

  public async sendMessage(request: Partial<SendMessageStatelessRequest>) {
    const encryptedMessage = await this.identity.encrypt(request);
    request.EncryptedMessageText = encryptedMessage;
    if (!request.MinFeeRateNanosPerKB) {
      request.MinFeeRateNanosPerKB = 1000;
    }
    const response = (
      await axios.post(`${this.node.getUri()}/send-message-stateless`, request)
    ).data;
    return await this.identity.submitTransaction(response.TransactionHex);
  }

  public async createFollowTxnStateless(
    request: CreateFollowTxnStatelessRequest
  ): Promise<CreateFollowTxnStatelessResponse> {
    if (!request.FollowerPublicKeyBase58Check) {
      throw Error('FollowerPublicKeyBase58Check is undefined');
    }
    if (!request.FollowedPublicKeyBase58Check) {
      throw Error('FollowedPublicKeyBase58Check is undefined');
    }
    if ((request.IsUnfollow as any) instanceof Boolean) {
      throw Error('IsUnfollow is undefined');
    }
    request = { ...{ MinFeeRateNanosPerKB: 1000 }, ...request };
    const response = (
      await axios.post<CreateFollowTxnStatelessResponse>(
        `${this.node.getUri()}/create-follow-txn-stateless`,
        request
      )
    ).data;
    return await this.identity.submitTransaction(response.TransactionHex);
  }

  public async getFollowsStateless(
    request: Partial<GetFollowsStatelessRequest>
  ): Promise<GetFollowsResponse> {
    const endpoint = 'get-follows-stateless';
    const response: GetFollowsResponse = (
      await axios.post(`${this.node.getUri()}/${endpoint}`, request)
    ).data;
    return response;
  }

  public async getMessagesStateless(
    request: GetMessagesStatelessRequest
  ): Promise<GetDecryptMessagesResponse[]> {
    const response: GetMessagesResponse = (
      await axios.post(`${this.node.getUri()}/get-messages-stateless`, request)
    ).data;
    const encryptedMessages = (
      response.OrderedContactsWithMessages as MessageContactResponse[]
    )
      .map((thread) => {
        if (thread.Messages === null) {
          return [];
        }
        return thread.Messages.map((message) => ({
          EncryptedHex: message.EncryptedText,
          PublicKey: message.IsSender
            ? message.RecipientPublicKeyBase58Check
            : message.SenderPublicKeyBase58Check,
          IsSender: message.IsSender,
          Legacy: !message.V2 && (!message.Version || message.Version < 2),
          Version: message.Version,
          SenderMessagingPublicKey: message.SenderMessagingPublicKey,
          SenderMessagingGroupKeyName: message.SenderMessagingGroupKeyName,
          RecipientMessagingPublicKey: message.RecipientMessagingPublicKey,
          RecipientMessagingGroupKeyName:
            message.RecipientMessagingGroupKeyName,
        }));
      })
      .flat();
    return this.identity.decrypt(encryptedMessages);
  }

  public async getHodlersForPublicKey(
    request: Partial<GetHodlersForPublicKeyRequest>
  ): Promise<GetHodlersForPublicKeyResponse> {
    const endpoint = 'get-hodlers-for-public-key';
    return await axios.post(`${this.node.getUri()}/${endpoint}`, request);
  }

  public async getDiamondsForPublicKey(
    request: Partial<GetDiamondsForPublicKeyRequest>
  ): Promise<GetDiamondsForPublicKeyResponse> {
    const endpoint = 'get-diamonds-for-public-key';
    return await axios.post(`${this.node.getUri()}/${endpoint}`, request);
  }

  public async isFollowingPublicKey(
    request: Partial<IsFollowingPublicKeyRequest>
  ): Promise<IsFolllowingPublicKeyResponse> {
    const endpoint = 'is-following-public-key';
    return await axios.post(`${this.node.getUri()}/${endpoint}`, request);
  }

  public async isHodlingPublicKey(
    request: Partial<IsHodlingPublicKeyRequest>
  ): Promise<IsHodlingPublicKeyResponse> {
    const endpoint = 'is-hodling-public-key';
    return await axios.post(`${this.node.getUri()}/${endpoint}`, request);
  }

  public async updateProfile(
    request: Partial<UpdateProfileRequest>
  ): Promise<UpdateProfileResponse> {
    throw Error('todo');
    const endpoint = 'update-profile';
    const response: UpdateProfileResponse = (
      await axios.post(`${this.node.getUri()}/${endpoint}`, request)
    ).data;
    // const profile = (await this.user.getSingleProfile({
    //   PublicKeyBase58Check: request.ProfilePublicKeyBase58Check,
    // })).Profile;
    //   const oy = {
    // NewUsername: profile?.Username,
    // NewDescription: profile?.Description,
    // // NewProfilePic: profile.,
    // NewCreatorBasisPoints: profile.,
    // MinFeeRateNanosPerKB: 1000
    //   }
    response.TransactionHex;
    return await this.identity
      .submitTransaction(response.TransactionHex)
      .then(() => response)
      .catch(() => {
        throw Error('something went wrong while signing');
      });
  }

  public async sendDiamonds(
    request: Partial<SendDiamondsRequest>
  ): Promise<SendDiamondsResponse> {
    const endpoint = 'send-diamonds';
    const response = (
      await axios.post(`${this.node.getUri()}/${endpoint}`, request)
    ).data;
    return await this.identity
      .submitTransaction(response.TransactionHex)
      .then(() => response)
      .catch(() => {
        throw Error('something went wrong while signing');
      });
  }

  public async createLikeStateless(
    request: Partial<CreateLikeStatelessRequest>
  ): Promise<CreateLikeStatelessResponse> {
    const endpoint = 'create-like-stateless';
    const response = await (
      await axios.post(`${this.node.getUri()}/${endpoint}`, request)
    ).data;
    return await this.identity
      .submitTransaction(response.TransactionHex)
      .then(() => response)
      .catch(() => {
        throw Error('something went wrong while signing');
      });
  }
}
