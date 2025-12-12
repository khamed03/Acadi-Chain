// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Added from your edited version
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CertificateRegistry (Merged Version)
 * @notice Combines:
 *  - Original advanced registry (specialId, expiry, revoke, indexing)
 *  - Modified version (CID/IPFS metadata, name/degree/major/year, verification)
 *  - Adds onlyOwner issuer/verifier control
 */
contract CertificateRegistry is Ownable, ReentrancyGuard {

    // -----------------------------------------------------
    // Struct Definition (Merged)
    // -----------------------------------------------------
    struct Certificate {
        // From original
        string specialId;
        string issuerName;
        address issuer;
        string studentName;
        address student;
        string courseName;
        uint64 expiry;
        uint64 issuedAt;
        bool revoked;
        bool exists;

        // From edited version
        string cid;        // IPFS file
        string degree;
        string major;
        string year;
        bool valid;        // verified by admin
    }

    // -----------------------------------------------------
    // Storage
    // -----------------------------------------------------
    mapping(bytes32 => Certificate) private _certs;
    mapping(address => string[]) private _byStudent;
    mapping(bytes32 => string[]) private _byCourse;
    mapping(string => bool) private issuedCid; // prevent reissuing same CID

    uint256 private _counter;

    // -----------------------------------------------------
    // Events
    // -----------------------------------------------------
    event CertificateIssued(
        string specialId,
        address indexed issuer,
        string cid
    );

    event CertificateVerified(
        string specialId,
        address verifier
    );

    event CertificateRevoked(
        string specialId,
        address issuer
    );

    // -----------------------------------------------------
    // Modifiers
    // -----------------------------------------------------
    modifier onlyIssuer() {
        require(msg.sender == owner(), "Not authorized: issuer only");
        _;
    }

    modifier onlyVerifier() {
        require(msg.sender == owner(), "Not authorized: verifier only");
        _;
    }

    // -----------------------------------------------------
    // Issue Certificate (Merged Function)
    // -----------------------------------------------------
    function issueCertificate(
        string calldata issuerName,
        string calldata studentName,
        address student,
        string calldata courseName,
        uint64 expiry,
        string calldata cid,          // Added
        string calldata degree,       // Added
        string calldata major,        // Added
        string calldata year          // Added
    ) external onlyIssuer nonReentrant returns (string memory specialId) {

        require(student != address(0), "Invalid student address");
        require(bytes(cid).length != 0, "CID required");
        require(!issuedCid[cid], "CID already issued");

        _counter++;
        specialId = _generateId(_counter);

        bytes32 key = _toKey(specialId);
        require(!_certs[key].exists, "SpecialId already exists");

        Certificate memory cert = Certificate({
            specialId: specialId,
            issuerName: issuerName,
            issuer: msg.sender,
            studentName: studentName,
            student: student,
            courseName: courseName,
            expiry: expiry,
            issuedAt: uint64(block.timestamp),
            revoked: false,
            exists: true,
            cid: cid,
            degree: degree,
            major: major,
            year: year,
            valid: false
        });

        _certs[key] = cert;
        _byStudent[student].push(specialId);
        _byCourse[_toKey(courseName)].push(specialId);
        issuedCid[cid] = true;

        emit CertificateIssued(specialId, msg.sender, cid);
    }

    // -----------------------------------------------------
    // Verification
    // -----------------------------------------------------
    function verifyCertificate(string memory specialId)
        external
        onlyVerifier
    {
        bytes32 key = _toKey(specialId);
        Certificate storage c = _certs[key];
        require(c.exists, "Certificate not found");
        require(!c.valid, "Already verified");

        c.valid = true;
        emit CertificateVerified(specialId, msg.sender);
    }

    // -----------------------------------------------------
    // Get Certificate
    // -----------------------------------------------------
    function getCertificate(string calldata specialId)
        external
        view
        returns (Certificate memory)
    {
        return _mustGet(specialId);
    }

    // -----------------------------------------------------
    // List certificates for a student
    // -----------------------------------------------------
    function listCertificatesByStudent(address student)
        external
        view
        returns (Certificate[] memory)
    {
        string[] storage ids = _byStudent[student];
        Certificate[] memory arr = new Certificate[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            arr[i] = _mustGet(ids[i]);
        }
        return arr;
    }

    // -----------------------------------------------------
    // Revocation (original functionality kept)
    // -----------------------------------------------------
    function revokeStudentCertificate(
        address student,
        string calldata specialId
    ) external {
        Certificate storage c = _mustGetStorage(specialId);
        require(c.student == student, "Student mismatch");

        if (!c.revoked) {
            c.revoked = true;
            emit CertificateRevoked(specialId, c.issuer);
        }
    }

    // -----------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------
    function _mustGet(string memory specialId)
        internal
        view
        returns (Certificate memory)
    {
        Certificate storage c = _mustGetStorage(specialId);
        return c;
    }

    function _mustGetStorage(string memory specialId)
        internal
        view
        returns (Certificate storage)
    {
        bytes32 key = _toKey(specialId);
        Certificate storage c = _certs[key];
        require(c.exists, "Certificate does not exist");
        return c;
    }

    function _toKey(string memory s) internal pure returns (bytes32) {
        return keccak256(bytes(s));
    }

    function _generateId(uint256 num)
        internal
        pure
        returns (string memory)
    {
        if (num == 0) return "AC-0";

        uint256 temp = num;
        uint256 digits = 0;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buf = new bytes(digits);
        while (num != 0) {
            digits--;
            buf[digits] = bytes1(uint8(48 + num % 10));
            num /= 10;
        }

        return string(abi.encodePacked("AC-", string(buf)));
    }
}
