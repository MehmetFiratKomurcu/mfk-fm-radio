// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract MFKFM {
    uint256 totalVideos;
    uint256 private seed;

    event NewVideo(address indexed from, uint256 timestamp, string message);

    struct Video {
        address videoSender;
        string message;
        uint256 timestamp;
    }

    Video[] Videos;

    mapping(address => uint256) public lastSentVideos;

    constructor() payable {
        console.log("Hello world from the first smart contract :) ");
        seed = (block.timestamp + block.difficulty) % 100;
    }

    function AddVideo(string memory _message) public {
        require(
            lastSentVideos[msg.sender] + 180 days < block.timestamp,
            "Wait 180 days"
        );

        lastSentVideos[msg.sender] = block.timestamp;

        totalVideos += 1;
        console.log("%s has sent Video!", msg.sender);

        Videos.push(Video(msg.sender, _message, block.timestamp));

        seed = (block.difficulty + block.timestamp + seed) % 100;

        console.log("Random # generated: %d", seed);

        if (seed < 1) {
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }

        emit NewVideo(msg.sender, block.timestamp, _message);
    }

    function getAllVideos() public view returns (Video[] memory) {
        return Videos;
    }

    function getTotalVideos() public view returns (uint256) {
        console.log("We have %d total Videos!", totalVideos);
        return totalVideos;
    }
}
