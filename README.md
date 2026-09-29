# Bastard Coin (BSTRD)

Bastard Coin is an early maritime community project for sailors, boaters and
marine tradespeople. Its planned use is to support voluntary exchanges of goods,
skills and services, with an emphasis on repair, reuse and care for the sea.
There is no established merchant network or operating marketplace yet. Holding
BSTRD does not fund a verified environmental programme or represent an offset.

This repository contains the deployed ERC-20 contract source, its public ABI,
deployment identifiers and tests that run on a temporary local blockchain.

| Property | Deployed value |
| --- | --- |
| Network | Arbitrum One, chain ID 42161 |
| Name and symbol | Bastard Coin, BSTRD |
| Total supply | 1,000,000 BSTRD |
| Decimals | 18 |
| Contract | `0x39bDbB2a4419C33C7032bDa8AFc604C9Ef9d2A86` |
| Uniswap v2 BSTRD/WETH pool | `0x34Dc72D488DAf9dbae02b962Ba0A9D87357142fE` |
| Deployment date | 28 September 2026 |

The contract has an exact creation and runtime source match on
[Sourcify](https://repo.sourcify.dev/42161/0x39bDbB2a4419C33C7032bDa8AFc604C9Ef9d2A86).
Source verification lets readers compare deployed code with source. It is not
an independent security audit or an endorsement.

## Contract behaviour

The constructor creates the entire supply for one initial holder. Its arguments
set the name, symbol, supply and initial holder. The deployed values are recorded
in [deployment.json](deployment.json). The contract inherits ordinary transfers
and allowances from OpenZeppelin Contracts 5.6.1.

There are no externally callable mint, burn, pause, freeze, blacklist, transfer
tax, owner or upgrade functions. The deployed name, symbol and supply cannot be
changed through this contract. The absence of administrator functions does not
remove risks from token concentration or liquidity ownership.

## Current limitations

- No independent security audit has been completed.
- The founder retains a large share of the supply. See the dated ownership
  snapshot on the [transparency page](https://mendesmachine.myaddr.tools/bastard-coin/transparency.html).
- The founder controls the issued pool liquidity position, with no voluntary
  liquidity lock. Liquidity can be removed and the market is very small.
- A pool quote is not a promise that a whole holding can be sold at that price.
  Even small trades can cause substantial price changes.
- No centralized exchange listing is confirmed. The project is not incorporated,
  and the applicable issuer and EU public-offer documentation remain unresolved.
- Planned maritime uses and sustainability goals are proposals, with no promise
  of adoption, income, redemption or investment returns.

## Build and test locally

Use Node.js 24 or a later supported even-numbered release and npm. Dependencies
are pinned in the lockfile. No wallet, private key or funded account is needed.

```sh
npm ci
npm test
```

The 12 tests cover fixed issuance, token metadata, ordinary and delegated
transfers, allowance revocation, invalid constructor inputs, invalid transfers
and rejection of attempted mint calls. They use an in-memory Hardhat chain and
send no public transactions. Passing these tests is not an audit.

Compilation uses Solidity 0.8.37, the Cancun EVM target and the optimizer with
200 runs. [hardhat.config.ts](hardhat.config.ts) uses the locally installed solc
package. Generated artifacts and dependencies are excluded from source control.
There is no deployment command in this public repository.

## Public information and contact

- [Project website](https://mendesmachine.myaddr.tools/bastard-coin/)
- [Transparency and dated ownership snapshot](https://mendesmachine.myaddr.tools/bastard-coin/transparency.html)
- [Token on Arbiscan](https://arbiscan.io/token/0x39bDbB2a4419C33C7032bDa8AFc604C9Ef9d2A86)
- [Contract source on Sourcify](https://repo.sourcify.dev/42161/0x39bDbB2a4419C33C7032bDa8AFc604C9Ef9d2A86)
- Project contact: bastardcoins@gmail.com

## License

Project-authored code and documentation are provided under the [MIT license](LICENSE).
Dependencies retain their own licenses. OpenZeppelin Contracts is MIT licensed
and is installed from npm rather than vendored into this repository. See
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
