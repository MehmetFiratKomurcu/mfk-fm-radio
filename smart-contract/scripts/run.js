const main = async () => {
    const mfkFMFactory = await hre.ethers.getContractFactory("MFKFM");
    const mfkFMContract = await mfkFMFactory.deploy({
      value: hre.ethers.utils.parseEther("0.1"),
    });
    await mfkFMContract.deployed();
    console.log("Contract addy:", mfkFMContract.address);
  
    let contractBalance = await hre.ethers.provider.getBalance(
      mfkFMContract.address
    );
    console.log(
      "Contract balance:",
      hre.ethers.utils.formatEther(contractBalance)
    );
  
    /*
     * Let's try two videos now
     */
    const videoTxn = await mfkFMContract.AddVideo("This is video #1");
    await videoTxn.wait();
  
    const videoTxn2 = await mfkFMContract.AddVideo("This is video #2");
    await videoTxn2.wait();
  
    contractBalance = await hre.ethers.provider.getBalance(mfkFMContract.address);
    console.log(
      "Contract balance:",
      hre.ethers.utils.formatEther(contractBalance)
    );
  
    let allvideos = await mfkFMContract.getAllVideos();
    console.log(allvideos);
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