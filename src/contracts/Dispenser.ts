import { AbiItem } from 'web3-utils'
import Decimal from 'decimal.js'
import DispenserAbi from '@oceanprotocol/contracts/artifacts/contracts/pools/dispenser/Dispenser.sol/Dispenser.json'
import { calculateEstimatedGas, sendTx } from '../utils'
import { Datatoken } from './Datatoken'
import { SmartContractWithAddress } from './SmartContractWithAddress'
import { DispenserToken, ReceiptOrEstimate } from '../@types'

export class Dispenser extends SmartContractWithAddress {
  getDefaultAbi(): AbiItem | AbiItem[] {
    return DispenserAbi.abi as AbiItem[]
  }

  /**
   * Get information about a datatoken dispenser
   * @param {String} dtAddress
   * @return {Promise<FixedPricedExchange>} Exchange details
   */
  public async status(dtAdress: string): Promise<DispenserToken> {
    const status: DispenserToken = await this.contract.methods.status(dtAdress).call()
    if (!status) {
      throw new Error(`Np dispenser found for the given datatoken address`)
    }
    status.maxTokens = this.web3.utils.fromWei(status.maxTokens)
    status.maxBalance = this.web3.utils.fromWei(status.maxBalance)
    status.balance = this.web3.utils.fromWei(status.balance)
    return status
  }

  /**
   * Creates a new Dispenser
   * @param {String} dtAddress Datatoken address
   * @param {String} address Owner address
   * @param {String} maxTokens max tokens to dispense
   * @param {String} maxBalance max balance of requester
   * @param {String} allowedSwapper  only account that can ask tokens. set address(0) if not required
   * @return {Promise<ReceiptOrEstimate>} transactionId
   */
  public async create<G extends boolean = false>(
    dtAddress: string,
    address: string,
    maxTokens: string,
    maxBalance: string,
    allowedSwapper: string,
    estimateGas?: G
  ): Promise<ReceiptOrEstimate<G>> {
    const estGas = await calculateEstimatedGas(
      address,
      this.contract.methods.create,
      dtAddress,
      this.web3.utils.toWei(maxTokens),
      this.web3.utils.toWei(maxBalance),
      address,
      allowedSwapper
    )
    if (estimateGas) return <ReceiptOrEstimate<G>>estGas

    // Call createFixedRate contract method
    const trxReceipt = await sendTx(
      address,
      estGas + 1,
      this.web3,
      this.config?.gasFeeMultiplier,
      this.contract.methods.create,
      dtAddress,
      this.web3.utils.toWei(maxTokens),
      this.web3.utils.toWei(maxBalance),
      address,
      allowedSwapper
    )

    return <ReceiptOrEstimate<G>>trxReceipt
  }

  /**
   * Activates a new dispener.
   * @param {String} dtAddress refers to datatoken address.
   * @param {Number} maxTokens max amount of tokens to dispense
   * @param {Number} maxBalance max balance of user. If user balance is >, then dispense will be rejected
   * @param {String} address User address (must be owner of the datatoken)
   * @return {Promise<ReceiptOrEstimate>} TransactionReceipt
   */
  public async activate<G extends boolean = false>(
    dtAddress: string,
    maxTokens: string,
    maxBalance: string,
    address: string,
    estimateGas?: G
  ): Promise<ReceiptOrEstimate<G>> {
    const estGas = await calculateEstimatedGas(
      address,
      this.contract.methods.activate,
      dtAddress,
      this.web3.utils.toWei(maxTokens),
      this.web3.utils.toWei(maxBalance)
    )
    if (estimateGas) return <ReceiptOrEstimate<G>>estGas

    const trxReceipt = await sendTx(
      address,
      estGas + 1,
      this.web3,
      this.config?.gasFeeMultiplier,
      this.contract.methods.activate,
      dtAddress,
      this.web3.utils.toWei(maxTokens),
      this.web3.utils.toWei(maxBalance)
    )

    return <ReceiptOrEstimate<G>>trxReceipt
  }

  /**
   * Deactivate an existing dispenser.
   * @param {String} dtAddress refers to datatoken address.
   * @param {String} address User address (must be owner of the datatoken)
   * @return {Promise<ReceiptOrEstimate>} TransactionReceipt
   */
  public async deactivate<G extends boolean = false>(
    dtAddress: string,
    address: string,
    estimateGas?: G
  ): Promise<ReceiptOrEstimate<G>> {
    const estGas = await calculateEstimatedGas(
      address,
      this.contract.methods.deactivate,
      dtAddress
    )
    if (estimateGas) return <ReceiptOrEstimate<G>>estGas

    const trxReceipt = await sendTx(
      address,
      estGas + 1,
      this.web3,
      this.config?.gasFeeMultiplier,
      this.contract.methods.deactivate,
      dtAddress
    )

    return <ReceiptOrEstimate<G>>trxReceipt
  }

  /**
   * Sets a new allowedSwapper.
   * @param {String} dtAddress refers to datatoken address.
   * @param {String} address User address (must be owner of the datatoken)
   * @param {String} newAllowedSwapper refers to the new allowedSwapper
   * @return {Promise<ReceiptOrEstimate>} TransactionReceipt
   */
  public async setAllowedSwapper<G extends boolean = false>(
    dtAddress: string,
    address: string,
    newAllowedSwapper: string,
    estimateGas?: G
  ): Promise<ReceiptOrEstimate<G>> {
    const estGas = await calculateEstimatedGas(
      address,
      this.contract.methods.setAllowedSwapper,
      dtAddress,
      newAllowedSwapper
    )
    if (estimateGas) return <ReceiptOrEstimate<G>>estGas

    const trxReceipt = await sendTx(
      address,
      estGas + 1,
      this.web3,
      this.config?.gasFeeMultiplier,
      this.contract.methods.setAllowedSwapper,
      dtAddress,
      newAllowedSwapper
    )
    return <ReceiptOrEstimate<G>>trxReceipt
  }

  /**
   * Dispense datatokens to caller.
   * The dispenser must be active, hold enough DT (or be able to mint more)
   * and respect maxTokens/maxBalance requirements
   * @param {String} dtAddress refers to datatoken address.
   * @param {String} address User address
   * @param {String} amount amount of datatokens required.
   * @param {String} destination who will receive the tokens
   * @return {Promise<ReceiptOrEstimate>} TransactionReceipt
   */
  public async dispense<G extends boolean = false>(
    dtAddress: string,
    address: string,
    amount: string = '1',
    destination: string,
    estimateGas?: G
  ): Promise<ReceiptOrEstimate<G>> {
    const estGas = await calculateEstimatedGas(
      address,
      this.contract.methods.dispense,
      dtAddress,
      this.web3.utils.toWei(amount),
      destination
    )
    if (estimateGas) return <ReceiptOrEstimate<G>>estGas

    const trxReceipt = await sendTx(
      address,
      estGas + 1,
      this.web3,
      this.config?.gasFeeMultiplier,
      this.contract.methods.dispense,
      dtAddress,
      this.web3.utils.toWei(amount),
      destination
    )
    return <ReceiptOrEstimate<G>>trxReceipt
  }

  /**
   * Withdraw all tokens from the dispenser
   * @param {String} dtAddress refers to datatoken address.
   * @param {String} address User address (must be owner of the dispenser)
   * @return {Promise<ReceiptOrEstimate>} TransactionReceipt
   */
  public async ownerWithdraw<G extends boolean = false>(
    dtAddress: string,
    address: string,
    estimateGas?: G
  ): Promise<ReceiptOrEstimate<G>> {
    const estGas = await calculateEstimatedGas(
      address,
      this.contract.methods.ownerWithdraw,
      dtAddress
    )
    if (estimateGas) return <ReceiptOrEstimate<G>>estGas

    const trxReceipt = await sendTx(
      address,
      estGas + 1,
      this.web3,
      this.config?.gasFeeMultiplier,
      this.contract.methods.ownerWithdraw,
      dtAddress
    )

    return <ReceiptOrEstimate<G>>trxReceipt
  }

  /**
   * Check if tokens can be dispensed
   * @param {String} dtAddress
   * @param {String} address User address that will receive datatokens
   * @param {String} amount amount of datatokens required.
   * @return {Promise<Boolean>}
   */
  public async isDispensable(
    dtAddress: string,
    datatoken: Datatoken,
    address: string,
    amount: string = '1'
  ): Promise<Boolean> {
    const status = await this.status(dtAddress)
    if (!status) return false
    // check active
    if (status.active === false) return false
    // check maxBalance
    const userBalance = new Decimal(await datatoken.balance(dtAddress, address))
    if (userBalance.greaterThanOrEqualTo(status.maxBalance)) return false
    // check maxAmount
    if (new Decimal(String(amount)).greaterThan(status.maxTokens)) return false
    // check dispenser balance
    const contractBalance = new Decimal(status.balance)
    if (contractBalance.greaterThanOrEqualTo(amount) || status.isMinter === true)
      return true
    return false
  }
}
