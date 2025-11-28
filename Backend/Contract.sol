// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CertificateRegistry {
    struct Certificate {
        string specialId;    // unique certificate ID, e.g. "AC-1", "AC-2"
        string issuerName;
        string studentName;
        string studentId;    // e.g. "202100123"
        string courseName;
        uint64 expiry;       // unix timestamp; 0 => no expiry
        uint64 issuedAt;     // block timestamp at issuance
        bool revoked;
        bool exists;
    }

    mapping(bytes32 => Certificate) private _certs;
    mapping(bytes32 => string[])   private _byStudentId; // hash(studentId) => list of specialId
    mapping(bytes32 => string[])   private _byCourse;    // hash(courseName) => list of specialId

    event CertificateIssued(
        string specialId,
        string issuerName,
        string studentName,
        string studentId,
        string courseName,
        uint64 expiry
    );

    event CertificateRevoked(
        string specialId,
        string issuerName
    );

    error CertificateAlreadyExists(string specialId);
    error CertificateNotFound(string specialId);
    error StudentIdMismatch(string expected, string actual);

    uint256 private _counter; // used to generate unique IDs

    // ------------------------------------------------
    // ISSUE
    // ------------------------------------------------

    function issueCertificate(
        string calldata issuerName,
        string calldata studentName,
        string calldata studentId,
        string calldata courseName,
        uint64 expiry
    ) external returns (string memory specialId) {
        _counter++;
        specialId = _generateId(_counter);

        bytes32 key = _toKey(specialId);
        if (_certs[key].exists) revert CertificateAlreadyExists(specialId);

        _certs[key] = Certificate({
            specialId:  specialId,
            issuerName: issuerName,
            studentName: studentName,
            studentId:  studentId,
            courseName: courseName,
            expiry:     expiry,
            issuedAt:   uint64(block.timestamp),
            revoked:    false,
            exists:     true
        });

        _byStudentId[_toKey(studentId)].push(specialId);
        _byCourse[_toKey(courseName)].push(specialId);

        emit CertificateIssued(
            specialId,
            issuerName,
            studentName,
            studentId,
            courseName,
            expiry
        );
    }

    // ------------------------------------------------
    // READ: Single certificate (struct)
    // ------------------------------------------------

    function getCertificate(
        string calldata specialId
    ) public view returns (Certificate memory) {
        return _mustGet(specialId);
    }

    // ------------------------------------------------
    // READ: All certificates for a student
    // ------------------------------------------------

    function listCertificatesByStudent(
        string calldata studentId
    ) external view returns (Certificate[] memory) {
        string[] storage ids = _byStudentId[_toKey(studentId)];
        uint256 len = ids.length;

        Certificate[] memory result = new Certificate[](len);
        for (uint256 i = 0; i < len; i++) {
            result[i] = _mustGet(ids[i]);
        }
        return result;
    }

    // ------------------------------------------------
    // VERIFY
    // ------------------------------------------------

    function verify(
        string calldata specialId
    ) external view returns (bool isValid, string memory reason) {
        Certificate memory c = _certs[_toKey(specialId)];
        if (!c.exists) return (false, "NOT_FOUND");
        if (c.revoked) return (false, "REVOKED");
        if (c.expiry != 0 && block.timestamp > c.expiry) {
            return (false, "EXPIRED");
        }
        return (true, "");
    }

    // ------------------------------------------------
    // REVOKE (student-safe)
    // ------------------------------------------------

    function revokeStudentCertificate(
        string calldata studentId,
        string calldata specialId
    ) external {
        Certificate storage c = _mustGetStorage(specialId);
        if (keccak256(bytes(c.studentId)) != keccak256(bytes(studentId))) {
            revert StudentIdMismatch(c.studentId, studentId);
        }
        if (!c.revoked) {
            c.revoked = true;
            emit CertificateRevoked(specialId, c.issuerName);
        }
    }

    // ------------------------------------------------
    // INTERNAL HELPERS
    // ------------------------------------------------

    function _mustGet(
        string memory specialId
    ) internal view returns (Certificate memory) {
        Certificate storage c = _mustGetStorage(specialId);
        return c;
    }

    function _mustGetStorage(
        string memory specialId
    ) internal view returns (Certificate storage) {
        bytes32 key = _toKey(specialId);
        Certificate storage c = _certs[key];
        if (!c.exists) revert CertificateNotFound(specialId);
        return c;
    }

    function _toKey(
        string memory s
    ) internal pure returns (bytes32) {
        return keccak256(bytes(s));
    }

    function _generateId(
        uint256 num
    ) internal pure returns (string memory) {
        if (num == 0) {
            return "AC-0";
        }
        uint256 temp = num;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (num != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(num % 10)));
            num /= 10;
        }
        return string(abi.encodePacked("AC-", string(buffer)));
    }

    function _expiryString(uint64 expiry) internal pure returns (string memory) {
        if (expiry == 0) return "NO_EXPIRY";
        uint256 num = uint256(expiry);
        if (num == 0) return "0";
        uint256 temp = num;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (num != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(num % 10)));
            num /= 10;
        }
        return string(buffer);
    }
}
