pragma solidity ^0.5.0;

contract Docu {
  string docuHash;

  function record(string memory _docuHash) public {
    docuHash = _docuHash;
  }

  function play() public view returns (string memory) {
    return docuHash;
  }
}
