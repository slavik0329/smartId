// (c) Steve Dakh 2017
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

pragma solidity ^0.4.0;

contract Identity {
    // Identity contract owner address
    address public owner;

    // Mapping of allowed to attest addresses
    mapping(address => AllowListItem) public attestAllowedList;

    // Count of attestations
    uint public numAttestations;

    // Public user data
    string public publicUserData;
    uint public lastPublicUserDataChange;

    // Hashed user data
    string public hashedUserData;
    uint public lastHashedUserDataChange;

    Attestation[] public attestations;

    struct AllowListItem {
        string category;
        bool allowed;
    }

    // Structure of each attestation
    struct Attestation {
        address from; // Who attested
        uint time; // When attested
        string category; // Category of attestation
        string data; // Additional data field
        uint expirationTime;
        uint revokeTime;
    }

    modifier isOwner {
        if (msg.sender != owner) throw;
        _;
    }

    // Only allow an allowed address to attest. Don't allow owner to attest for himself
    modifier isAllowedToAttest {
        AllowListItem _allowedListItem = attestAllowedList[msg.sender];

        if (_allowedListItem.allowed != true || msg.sender == owner) throw;
        _;
    }

    event AttestationAuthorized(address authorizedAddress, string category);
    event AttestationCreated(address from, uint attestationID, string data);
    event PublicUserDataChanged(string from, string to);
    event HashedUserDataChanged(string from, string to);

    function setPublicUserData (string data) isOwner {
        PublicUserDataChanged(publicUserData, data);

        publicUserData = data;
        lastPublicUserDataChange = now;
    }

    function setHashedUserData (string data) isOwner {
        HashedUserDataChanged(hashedUserData, data);

        hashedUserData = data;
        lastHashedUserDataChange = now;
    }

    function authorizeAttestation (address allowedAddress, string category) isOwner {
        AllowListItem _allowedListItem = attestAllowedList[allowedAddress];
        _allowedListItem.allowed = true;
        _allowedListItem.category = category;

        AttestationAuthorized(allowedAddress, category);
    }

    function attest (string data, uint expirationTime) isAllowedToAttest {
        AllowListItem _allowedListItem = attestAllowedList[msg.sender];

        var attestationID = attestations.length++;
        Attestation a = attestations[attestationID];
        a.from = msg.sender;
        a.time = now;
        a.data = data;
        a.expirationTime = expirationTime;
        a.category = _allowedListItem.category;
        numAttestations = attestationID + 1;

        _allowedListItem.allowed = false;

        AttestationCreated(msg.sender, attestationID, data);
    }

    function Identity(
        address _owner
    ) {
        owner = _owner;
    }
}