import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { network } from "hardhat";

describe("BastardCoin", () => {
  let connection;
  let ethers;
  let deployer;
  let holder;
  let recipient;
  let spender;
  let factory;
  let supply;

  before(async () => {
    connection = await network.create("localSimulation");
    ethers = connection.ethers;
    [deployer, holder, recipient, spender] = await ethers.getSigners();
    factory = await ethers.getContractFactory("BastardCoin", deployer);
    supply = ethers.parseUnits("1000000", 18);
  });

  after(async () => {
    await connection?.close();
  });

  async function deploy() {
    const token = await factory.deploy(
      "Example Prototype",
      "EXAMPLE",
      supply,
      holder.address,
    );
    await token.waitForDeployment();
    return token;
  }

  async function expectRevert(action, errorName) {
    await assert.rejects(async () => {
      const result = await action();
      if (typeof result.wait === "function") await result.wait();
      if (typeof result.waitForDeployment === "function") {
        await result.waitForDeployment();
      }
    }, (error) => {
      const data = typeof error.data === "string"
        ? error.data
        : typeof error.error?.data === "string"
          ? error.error.data
          : undefined;
      if (data) {
        assert.equal(data.slice(0, 10), factory.interface.getError(errorName).selector);
      } else {
        assert.match(String(error.message), new RegExp(errorName));
      }
      return true;
    });
  }

  it("creates the complete fixed supply for the designated holder, not the deployer", async () => {
    const token = await deploy();
    assert.notEqual(holder.address, deployer.address);
    assert.equal(await token.totalSupply(), supply);
    assert.equal(await token.balanceOf(holder.address), supply);
    assert.equal(await token.balanceOf(deployer.address), 0n);
    assert.equal(await token.balanceOf(recipient.address), 0n);
  });

  it("reports the configured name and symbol with 18 decimals", async () => {
    const token = await deploy();
    assert.equal(await token.name(), "Example Prototype");
    assert.equal(await token.symbol(), "EXAMPLE");
    assert.equal(await token.decimals(), 18n);
  });

  it("transfers fractional tokens while conserving the supply", async () => {
    const token = await deploy();
    const amount = ethers.parseUnits("123.456789", 18);
    await (await token.connect(holder).transfer(recipient.address, amount)).wait();
    const holderBalance = await token.balanceOf(holder.address);
    const recipientBalance = await token.balanceOf(recipient.address);
    assert.equal(holderBalance, supply - amount);
    assert.equal(recipientBalance, amount);
    assert.equal(holderBalance + recipientBalance, supply);
    assert.equal(await token.totalSupply(), supply);
  });

  it("rejects an overspend without changing balances or supply", async () => {
    const token = await deploy();
    await expectRevert(
      () => token.connect(holder).transfer(recipient.address, supply + 1n),
      "ERC20InsufficientBalance",
    );
    assert.equal(await token.balanceOf(holder.address), supply);
    assert.equal(await token.balanceOf(recipient.address), 0n);
    assert.equal(await token.totalSupply(), supply);
  });

  it("rejects transfers to the zero address without destroying tokens", async () => {
    const token = await deploy();
    await expectRevert(
      () => token.connect(holder).transfer(ethers.ZeroAddress, 1n),
      "ERC20InvalidReceiver",
    );
    assert.equal(await token.balanceOf(holder.address), supply);
    assert.equal(await token.balanceOf(ethers.ZeroAddress), 0n);
    assert.equal(await token.totalSupply(), supply);
  });

  it("permits delegated spending only within the remaining allowance", async () => {
    const token = await deploy();
    const allowance = ethers.parseUnits("100", 18);
    const spent = ethers.parseUnits("40", 18);
    await (await token.connect(holder).approve(spender.address, allowance)).wait();
    assert.equal(await token.allowance(holder.address, spender.address), allowance);

    await (await token.connect(spender).transferFrom(
      holder.address,
      recipient.address,
      spent,
    )).wait();
    assert.equal(await token.allowance(holder.address, spender.address), allowance - spent);
    assert.equal(await token.balanceOf(holder.address), supply - spent);
    assert.equal(await token.balanceOf(recipient.address), spent);

    await expectRevert(
      () => token.connect(spender).transferFrom(
        holder.address,
        recipient.address,
        allowance - spent + 1n,
      ),
      "ERC20InsufficientAllowance",
    );
    assert.equal(await token.allowance(holder.address, spender.address), allowance - spent);
    assert.equal(await token.balanceOf(recipient.address), spent);
    assert.equal(await token.totalSupply(), supply);
  });

  it("lets the holder revoke an allowance and blocks subsequent delegated spending", async () => {
    const token = await deploy();
    await (await token.connect(holder).approve(spender.address, 100n)).wait();
    await (await token.connect(holder).approve(spender.address, 0n)).wait();
    assert.equal(await token.allowance(holder.address, spender.address), 0n);
    await expectRevert(
      () => token.connect(spender).transferFrom(holder.address, recipient.address, 1n),
      "ERC20InsufficientAllowance",
    );
    assert.equal(await token.balanceOf(holder.address), supply);
    assert.equal(await token.balanceOf(recipient.address), 0n);
  });

  it("rejects an empty name", async () => {
    await expectRevert(
      () => factory.deploy("", "EXAMPLE", supply, holder.address),
      "EmptyName",
    );
  });

  it("rejects an empty symbol", async () => {
    await expectRevert(
      () => factory.deploy("Example Prototype", "", supply, holder.address),
      "EmptySymbol",
    );
  });

  it("rejects a zero initial supply", async () => {
    await expectRevert(
      () => factory.deploy("Example Prototype", "EXAMPLE", 0n, holder.address),
      "ZeroSupply",
    );
  });

  it("rejects a zero-address initial holder", async () => {
    await expectRevert(
      () => factory.deploy("Example Prototype", "EXAMPLE", supply, ethers.ZeroAddress),
      "ERC20InvalidReceiver",
    );
  });

  it("exposes no mint function and rejects attempted mint calls after deployment", async () => {
    const token = await deploy();
    const functions = token.interface.fragments.filter((fragment) => fragment.type === "function");
    assert.equal(functions.some((fragment) => /mint/i.test(fragment.name)), false);
    const mintInterface = new ethers.Interface(["function mint(address account, uint256 amount)"]);
    const request = {
      to: await token.getAddress(),
      data: mintInterface.encodeFunctionData("mint", [recipient.address, 1n]),
    };
    for (const signer of [deployer, holder]) {
      await assert.rejects(async () => {
        await (await signer.sendTransaction(request)).wait();
      });
    }
    assert.equal(await token.totalSupply(), supply);
    assert.equal(await token.balanceOf(holder.address), supply);
    assert.equal(await token.balanceOf(recipient.address), 0n);
  });
});
