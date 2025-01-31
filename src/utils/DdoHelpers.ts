import sha256 from 'crypto-js/sha256'
import Web3 from 'web3'

export function generateDid(nftAddress: string, chainId: number): string {
  nftAddress = Web3.utils.toChecksumAddress(nftAddress)
  const checksum = sha256(nftAddress + chainId.toString(10))
  return `did:op:${checksum.toString()}`
}

export function getHash(data: any): string {
  return sha256(data).toString()
}
