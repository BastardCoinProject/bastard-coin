// SPDX-License-Identifier: MIT
pragma solidity 0.8.37;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice Fixed-supply ERC-20 for the Bastard Coin project.
/// @dev All tokens are created once, at deployment, for the initial holder.
contract BastardCoin is ERC20 {
    error EmptyName();
    error EmptySymbol();
    error ZeroSupply();

    /// @param initialSupply Supply in smallest units (18 decimals), not whole tokens.
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 initialSupply,
        address initialHolder
    ) ERC20(tokenName, tokenSymbol) {
        if (bytes(tokenName).length == 0) revert EmptyName();
        if (bytes(tokenSymbol).length == 0) revert EmptySymbol();
        if (initialSupply == 0) revert ZeroSupply();
        _mint(initialHolder, initialSupply);
    }
}
