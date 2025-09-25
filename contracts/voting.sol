// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    address public owner;
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    uint public candidatesCount;

    event VoteCasted(address voter, uint candidateId);
    event CandidateAdded(uint id, string name, string party);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        _addCandidate("Alice Johnson", "Party A");
        _addCandidate("Bob Smith", "Party B");
        _addCandidate("Charlie Brown", "Party C");
    }

    function _addCandidate(string memory _name, string memory _party) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);
        emit CandidateAdded(candidatesCount, _name, _party);
    }

    function addCandidate(string memory _name, string memory _party) external onlyOwner {
        _addCandidate(_name, _party);
    }

    function vote(uint _candidateId) public {
        require(!hasVoted[msg.sender], "You have already voted!");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate");

        candidates[_candidateId].voteCount++;
        hasVoted[msg.sender] = true;

        emit VoteCasted(msg.sender, _candidateId);
    }

    function getCandidate(uint _id) public view returns (Candidate memory) {
        return candidates[_id];
    }
}
