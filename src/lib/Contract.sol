// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CertificateRegistry
 * @dev This contract stores on‑chain certificates that are identified by a
 * unique special ID. Each certificate records both the issuer and the
 * recipient (student) by their wallet addresses rather than using string
 * identifiers. It also persists human‑readable metadata about the issuer,
 * student and course, along with optional expiry and revocation status.
 */
contract CertificateRegistry {
    /// @dev Data structure representing a single certificate record.
    struct Certificate {
        string specialId;     // Unique certificate ID (e.g. "AC-1", "AC-2").
        string issuerName;    // Human‑readable name of the issuing institution.
        address issuer;       // Wallet address of the issuer who created the certificate.
        string studentName;   // Human‑readable name of the student.
        address student;      // Wallet address of the student.
        string courseName;    // Name of the course or credential.
        uint64 expiry;        // Unix timestamp when certificate expires; 0 means no expiry.
        uint64 issuedAt;      // Block timestamp when certificate was issued.
        bool revoked;         // Whether the issuer has revoked the certificate.
        bool exists;          // Internal flag indicating the record has been created.
    }

    // Storage of all certificates indexed by the keccak256 hash of their specialId.
    mapping(bytes32 => Certificate) private _certs;

    // Mapping from student address to list of certificate IDs (specialId) for easy lookup.
    mapping(address => string[]) private _byStudent;

    // Optional index: mapping from hashed course name to list of certificate IDs.
    mapping(bytes32 => string[]) private _byCourse;

    /// Emitted when a new certificate is issued.
    event CertificateIssued(
        string specialId,
        address issuer,
        string issuerName,
        address student,
        string studentName,
        string courseName,
        uint64 expiry
    );

    /// Emitted when a certificate is revoked by its issuer.
    event CertificateRevoked(
        string specialId,
        address issuer
    );

    /// Error thrown when attempting to create a certificate with a specialId that already exists.
    error CertificateAlreadyExists(string specialId);

    /// Error thrown when attempting to reference a certificate that does not exist.
    error CertificateNotFound(string specialId);

    /// Error thrown when the provided student address does not match the stored address.
    error StudentMismatch(address expected, address actual);

    // Counter used to generate unique special IDs in the format "AC-<N>".
    uint256 private _counter;

    /**
     * @notice Issue a new certificate for a student.
     * @param issuerName Human‑readable name of the issuing institution.
     * @param studentName Human‑readable name of the student.
     * @param student Wallet address of the student receiving the certificate.
     * @param courseName Name of the course or credential being issued.
     * @param expiry Optional expiry timestamp; set to 0 for no expiry.
     * @return specialId The newly generated unique certificate ID.
     */
    function issueCertificate(
        string calldata issuerName,
        string calldata studentName,
        address student,
        string calldata courseName,
        uint64 expiry
    ) external returns (string memory specialId) {
        // Increment the counter to create a new ID each time.
        _counter++;
        specialId = _generateId(_counter);

        bytes32 key = _toKey(specialId);
        if (_certs[key].exists) revert CertificateAlreadyExists(specialId);

        // Create the certificate record in memory first.
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
            exists: true
        });

        // Persist to storage.
        _certs[key] = cert;
        // Index by student address.
        _byStudent[student].push(specialId);
        // Index by course name using its hash.
        _byCourse[_toKey(courseName)].push(specialId);

        emit CertificateIssued(
            specialId,
            cert.issuer,
            issuerName,
            student,
            studentName,
            courseName,
            expiry
        );
    }

    /**
     * @notice Retrieve a certificate by its special ID.
     * @param specialId The unique ID of the certificate to retrieve.
     * @return Certificate struct containing the certificate details.
     */
    function getCertificate(
        string calldata specialId
    ) public view returns (Certificate memory) {
        return _mustGet(specialId);
    }

    /**
     * @notice List all certificates issued to a particular student address.
     * @param student The wallet address of the student.
     * @return An array of Certificate structs.
     */
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

    /**
     * @notice Verify whether a certificate exists, is not revoked and not expired.
     * @param specialId The unique ID of the certificate to verify.
     * @return isValid True if the certificate is valid.
     * @return reason Reason when invalid: "NOT_FOUND", "REVOKED", "EXPIRED" or "" (valid).
     */
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

    /**
     * @notice Revoke a certificate ensuring the provided student address matches the stored record.
     * @param student The student wallet address expected to own the certificate.
     * @param specialId The unique ID of the certificate to revoke.
     */
    function revokeStudentCertificate(
        address student,
        string calldata specialId
    ) external {
        Certificate storage c = _mustGetStorage(specialId);
        if (c.student != student) {
            revert StudentMismatch(c.student, student);
        }
        if (!c.revoked) {
            c.revoked = true;
            emit CertificateRevoked(specialId, c.issuer);
        }
    }

    // ------------------------------------------------
    // Internal helper functions
    // ------------------------------------------------

    /**
     * @dev Retrieve a certificate from storage. Reverts if it does not exist.
     */
    function _mustGet(
        string memory specialId
    ) internal view returns (Certificate memory) {
        Certificate storage c = _mustGetStorage(specialId);
        return c;
    }

    /**
     * @dev Retrieve a certificate from storage with a mutable reference.
     * Reverts if it does not exist.
     */
    function _mustGetStorage(
        string memory specialId
    ) internal view returns (Certificate storage) {
        bytes32 key = _toKey(specialId);
        Certificate storage c = _certs[key];
        if (!c.exists) revert CertificateNotFound(specialId);
        return c;
    }

    /**
     * @dev Convert an arbitrary string to a bytes32 key for indexing.
     */
    function _toKey(
        string memory s
    ) internal pure returns (bytes32) {
        return keccak256(bytes(s));
    }

    /**
     * @dev Generate a human‑friendly certificate ID given a counter.
     * The format is "AC-<number>" where <number> is a decimal representation.
     */
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
}