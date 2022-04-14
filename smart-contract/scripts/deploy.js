const main = async () => {
    const [deployer] = await hre.ethers.getSigners();
    const accountBalance = await deployer.getBalance();
  
    console.log("Deploying contracts with account: ", deployer.address);
    console.log("Account balance: ", accountBalance.toString());
  
    const mfkFMCFactory = await hre.ethers.getContractFactory("MFKFM");
    const mfkFMContract = await mfkFMCFactory.deploy({
      value: hre.ethers.utils.parseEther("0.001"),
    });
    
    await mfkFMContract.deployed();
  
    console.log("MFKFM address: ", mfkFMContract.address);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();