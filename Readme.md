# Bitcoin Address Indexing Service
Bitcoin Address Indexing Service is a web service providing Bitcoin address-related APIs for queries.

## Table of Contents
- [Bitcoin Address Indexing Service](#bitcoin-address-indexing-service)
  - [Table of Contents](#table-of-contents)
  - [How does it work](#how-does-it-work)
  - [Prerequisite](#prerequisite)
  - [Building and test](#building-and-test)
  - [Run](#run)
  - [Available APIs](#available-apis)
      - [`/addr/address:/balance`](#addraddressbalance)
      - [`/addr/address:/tx`](#addraddresstx)
      - [`/addr/address:/utxo`](#addraddressutxo)
  - [Author](#author)
  - [License](#license)

How does it work
-----
All address relevant information is powered by [btcd](https://github.com/btcsuite/btcd) node with method `searchrawtransactions`.  
By taking advantaging of caching technique solutions such as `Redis`, `MongoDB`, it makes a lot improvements on performance for faster response time compared to `btcd`.  
`RabbitMQ` takes a role of messaging broker, exchanging messages between `btcd-address-indexing-worker` and `btcd-address-web-service`.  
`btcd-address-indexing-worker` leverages with above technique solutions to index additional address relevant information for performance optimization.

**Disclaimer: It is still in very early stage for development. For personal purposes only. It takes no responsiblity on working in commercial purpose.**

Prerequisite
-----
* Go >= v1.12
* btcd >= 0.12-beta
* MongoDB >= v3.5
* RabbitMQ >= 0.09
* Redis >= 0.5
* `btcd-address-indexing-worker`

Building and test
-----

* Build
  
```bash
$ yarn install --frozen-lockfile
```

Run
-----

* For development

```bash
$ yarn start
```

Available APIs
-----

#### `/addr/address:/balance`

#### `/addr/address:/tx`

#### `/addr/address:/utxo`

Author
-----
Jeremy Li

License
-----
MIT License