import Account from '../ocean/Account'

const defaultFactoryABI = require('../datatokens/FactoryABI.json')
const defaultDatatokensABI = require('../datatokens/DatatokensABI.json')

/**
 * Provides a interface to DataTokens
 
 */
export class DataTokens {
    public factoryAddress: string
    public factoryABI: object
    public datatokensABI: object
    public web3: any

    /**
     * Instantiate DataTokens (independently of Ocean).
     * @param {String} factoryAddress
     * @param {Object} factoryABI
     * @param {Object} datatokensABI
     * @param {Object} web3 
     
     */
    constructor(
        factoryAddress: string,
        factoryABI: object,
        datatokensABI: object,
        web3: any
    ) {
        this.factoryAddress = factoryAddress

        this.factoryABI = factoryABI || defaultFactoryABI
        this.datatokensABI = datatokensABI || defaultDatatokensABI
        this.web3 = web3
    }

    /**
     * Create new datatoken
     * @param {String} metaDataStoreURI
     * @param {Account} account
     * @param {String} name
     * @param {String} symbol
     * @param {Number} cap
     * @return {Promise<string>} datatoken address
     */
    public async create(
        metaDataStoreURI: string,
        account: Account,
        name?: string,
        symbol?: string,
        cap?: number
    ): Promise<string> {
        // TODO  - Autogenerate name, symbol & cap if missing
        if (!name) name = 'DTTest1'
        if (!symbol) symbol = 'DT1'
        if (!cap) cap = 1000000
        // Create factory contract object
        const factory = new this.web3.eth.Contract(this.factoryABI, this.factoryAddress, {
            from: account.getId()
        })
        // Invoke createToken function of the contract
        const trxReceipt = await factory.methods
            .createToken(name, symbol, cap, metaDataStoreURI, account.getId())
            .send()
        let tokenAddress = null
        try {
            tokenAddress = trxReceipt.events.TokenCreated.returnValues[0]
        } catch (e) {
            console.error(e)
        }
        return tokenAddress
    }

    /**
     * Approve
     * @param {String} dataTokenAddress
     * @param {String} toAddress
     * @param {Number} amount
     * @param {Account} account
     * @return {Promise<string>} transactionId
     */
    public async approve(
        dataTokenAddress: string,
        spender: string,
        amount: number,
        account: Account
    ): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.approve(spender, amount).send()
        return trxReceipt
    }

    /**
     * Approve & Lock for a specified number of blocks (reverts after that if not used)
     * @param {String} dataTokenAddress
     * @param {String} toAddress
     * @param {Number} amount
     * @param {Number} blocks
     * @param {Account} account
     * @return {Promise<string>} transactionId
     */
    public async approveAndLock(
        dataTokenAddress: string,
        toAddress: string,
        amount: number,
        blocks: number,
        account: Account
    ): Promise<string> {
        // TO DO
        return ''
    }

    /**
     * Mint
     * @param {String} dataTokenAddress
     * @param {Account} account
     * @param {Number} amount
     * @param {String} toAddress   - only if toAddress is different from the minter
     * @return {Promise<string>} transactionId
     */
    public async mint(
        dataTokenAddress: string,
        account: Account,
        amount: number,
        toAddress?: string
    ): Promise<string> {
        const address = toAddress || account.getId()
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.mint(address, amount).send()
        return trxReceipt
    }

    /**
     * Transfer from Account to Address
     * @param {String} dataTokenAddress
     * @param {String} toAddress
     * @param {Number} amount
     * @param {Account} account
     * @return {Promise<string>} transactionId
     */
    public async transfer(
        dataTokenAddress: string,
        toAddress: string,
        amount: number,
        account: Account
    ): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.transfer(toAddress, amount).send()
        return trxReceipt
    }

    /**
     * Transfer from Address to Account  (needs an Approve operation before)
     * @param {String} dataTokenAddress
     * @param {String} fromAddress
     * @param {Number} amount
     * @param {Account} account
     * @return {Promise<string>} transactionId
     */
    public async transferFrom(
        dataTokenAddress: string,
        fromAddress: string,
        amount: number,
        account: Account
    ): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods
            .transferFrom(fromAddress, account.getId(), amount)
            .send()
        return trxReceipt
    }

    /**
     * Get Account Balance for datatoken
     * @param {String} dataTokenAddress
     * @param {Account} account
     * @return {Promise<number>} balance
     */
    public async balance(dataTokenAddress: string, account: Account): Promise<number> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.balanceOf(account.getId()).call()
        return trxReceipt
    }

    /** Get Blob
     * @param {String} dataTokenAddress
     * @param {Account} account
     * @return {Promise<string>} string
     */
    public async getBlob(dataTokenAddress: string, account: Account): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.blob().call()
        return trxReceipt
    }

    /** Get Name
     * @param {String} dataTokenAddress
     * @param {Account} account
     * @return {Promise<string>} string
     */
    public async getName(dataTokenAddress: string, account: Account): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.name().call()
        return trxReceipt
    }

    /** Get Symbol
     * @param {String} dataTokenAddress
     * @param {Account} account
     * @return {Promise<string>} string
     */
    public async getSymbol(dataTokenAddress: string, account: Account): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.symbol().call()
        return trxReceipt
    }

    /** Get Cap
     * @param {String} dataTokenAddress
     * @param {Account} account
     * @return {Promise<string>} string
     */
    public async getCap(dataTokenAddress: string, account: Account): Promise<string> {
        const datatoken = new this.web3.eth.Contract(
            this.datatokensABI,
            dataTokenAddress,
            { from: account.getId() }
        )
        const trxReceipt = await datatoken.methods.cap().call()
        return trxReceipt
    }
}
