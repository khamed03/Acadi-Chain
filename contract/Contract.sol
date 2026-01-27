// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

contract CertificateRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE  = keccak256("ISSUER_ROLE");
    bytes32 public constant STUDENT_ROLE = keccak256("STUDENT_ROLE");

    struct Certificate {
        string specialId;
        string issuerName;
        string studentName;
        address student;     // student public key (wallet address)
        string courseName;
        uint64 expiry;       // unix timestamp; 0 => no expiry
        uint64 issuedAt;     // block timestamp at issuance
        bool revoked;
        bool exists;
    }

    mapping(bytes32 => Certificate) private _certs;
    mapping(address => string[]) private _byStudent;
    string[] private _allIds;

    uint256 private _counter;

    event CertificateIssued(
        string specialId,
        string issuerName,
        string studentName,
        address indexed student,
        string courseName,
        uint64 expiry
    );

    event CertificateRevoked(string specialId, string issuerName);

    event StudentRegistered(address indexed student);
    event IssuerAdded(address indexed issuer);
    event AdminAdded(address indexed adminAddr);

    // Optional: emit when a student "generates" their key (registers their wallet)
    event StudentKeyGenerated(address indexed student);

    error CertificateAlreadyExists(string specialId);
    error CertificateNotFound(string specialId);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "ADMIN_ONLY");
        _;
    }

    modifier onlyIssuerOrAdmin() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(ISSUER_ROLE, msg.sender),
            "ISSUER_OR_ADMIN_ONLY"
        );
        _;
    }

    // -----------------------------
    // ✅ STUDENT: "GENERATE" PUBLIC KEY (REGISTER WALLET)
    // -----------------------------
    // NOTE: A real keypair cannot be generated on-chain.
    // This function registers msg.sender (wallet address) as the student's public key.
    function generateStudentPublicKey() external returns (address studentKey) {
        studentKey = msg.sender;
        _registerStudent(studentKey);
        emit StudentKeyGenerated(studentKey);
        return studentKey;
    }

    // -----------------------------
    // ADMIN MANAGEMENT (ADMIN ONLY)
    // -----------------------------

    function addAdmin(address adminAddr) external onlyAdmin {
        require(adminAddr != address(0), "ZERO_ADDR");
        _grantRole(DEFAULT_ADMIN_ROLE, adminAddr);
        emit AdminAdded(adminAddr);
    }

    function addIssuer(address issuer) external onlyAdmin {
        require(issuer != address(0), "ZERO_ADDR");
        _grantRole(ISSUER_ROLE, issuer);
        emit IssuerAdded(issuer);
    }

    function addStudent(address student) external onlyAdmin {
        _registerStudent(student);
    }

    // -----------------------------
    // ISSUER: REGISTER STUDENT
    // -----------------------------

    function issuerRegisterStudent(address student) external onlyIssuerOrAdmin {
        _registerStudent(student);
    }

    function _registerStudent(address student) internal {
        require(student != address(0), "ZERO_ADDR");
        if (!hasRole(STUDENT_ROLE, student)) {
            _grantRole(STUDENT_ROLE, student);
            emit StudentRegistered(student);
        }
    }

    // -----------------------------
    // ISSUE CERTIFICATE (ISSUER/ADMIN)
    // -----------------------------

    function issueCertificate(
        string calldata issuerName,
        string calldata studentName,
        address student,
        string calldata courseName,
        uint64 expiry
    ) external onlyIssuerOrAdmin returns (string memory specialId) {
        require(student != address(0), "ZERO_ADDR");

        _registerStudent(student);

        _counter++;
        specialId = _generateId(_counter);

        bytes32 key = _toKey(specialId);
        if (_certs[key].exists) revert CertificateAlreadyExists(specialId);

        _certs[key] = Certificate({
            specialId: specialId,
            issuerName: issuerName,
            studentName: studentName,
            student: student,
            courseName: courseName,
            expiry: expiry,
            issuedAt: uint64(block.timestamp),
            revoked: false,
            exists: true
        });

        _byStudent[student].push(specialId);
        _allIds.push(specialId);

        emit CertificateIssued(
            specialId,
            issuerName,
            studentName,
            student,
            courseName,
            expiry
        );
    }

    // -----------------------------
    // READ: CERTIFICATE (PUBLIC)
    // -----------------------------

    function getStudentCertificate(
        string calldata specialId
    ) external view returns (Certificate memory) {
        return _mustGet(specialId);
    }

    function listCertificatesByStudent(
        address student
    ) external view returns (Certificate[] memory) {
        string[] storage ids = _byStudent[student];
        uint256 len = ids.length;

        Certificate[] memory result = new Certificate[](len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = _mustGet(ids[i]);
        }
        return result;
    }

    function listMyCertificates() external view returns (Certificate[] memory) {
        require(hasRole(STUDENT_ROLE, msg.sender), "STUDENT_ONLY");
        string[] storage ids = _byStudent[msg.sender];
        uint256 len = ids.length;

        Certificate[] memory result = new Certificate[](len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = _mustGet(ids[i]);
        }
        return result;
    }

    function totalCertificates() external view returns (uint256) {
        return _allIds.length;
    }

    function listCertificatesPaged(uint256 offset, uint256 limit)
        external
        view
        returns (Certificate[] memory)
    {
        uint256 total = _allIds.length;
        if (offset >= total) return new Certificate[](0);

        uint256 end = offset + limit;
        if (end > total) end = total;

        Certificate[] memory result = new Certificate[](end - offset);
        uint256 j = 0;
        for (uint256 i = offset; i < end; i++) {
            result[j++] = _mustGet(_allIds[i]);
        }
        return result;
    }

    // -----------------------------
    // VERIFY (PUBLIC)
    // -----------------------------

    function verify(
        string calldata specialId
    ) external view returns (bool isValid, string memory reason) {
        Certificate memory c = _certs[_toKey(specialId)];
        if (!c.exists) return (false, "NOT_FOUND");
        if (c.revoked) return (false, "REVOKED");
        if (c.expiry != 0 && block.timestamp > c.expiry) return (false, "EXPIRED");
        return (true, "");
    }

    // -----------------------------
    // REVOKE (ADMIN ONLY)
    // -----------------------------

    function revokeCertificate(string calldata specialId) external onlyAdmin {
        Certificate storage c = _mustGetStorage(specialId);
        if (!c.revoked) {
            c.revoked = true;
            emit CertificateRevoked(specialId, c.issuerName);
        }
    }

    // -----------------------------
    // INTERNAL HELPERS
    // -----------------------------

    function _mustGet(string memory specialId) internal view returns (Certificate memory) {
        Certificate storage c = _mustGetStorage(specialId);
        return c;
    }

    function _mustGetStorage(string memory specialId) internal view returns (Certificate storage) {
        bytes32 key = _toKey(specialId);
        Certificate storage c = _certs[key];
        if (!c.exists) revert CertificateNotFound(specialId);
        return c;
    }

    function _toKey(string memory s) internal pure returns (bytes32) {
        return keccak256(bytes(s));
    }

    function _generateId(uint256 num) internal pure returns (string memory) {
        if (num == 0) return "AC-0";

        uint256 temp = num;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (num != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + (num % 10)));
            num /= 10;
        }

        return string(abi.encodePacked("AC-", string(buffer)));
    }
}


