// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ScrollSentinel — On-Chain Security Monitoring for Scroll
/// @notice Register contracts for monitoring, log security alerts, track security scores
contract ScrollSentinel {
    // ─── Types ───────────────────────────────────────────────────────────

    enum AlertSeverity { Info, Low, Medium, High, Critical }
    enum AlertType { Reentrancy, FlashLoan, LargeWithdrawal, AccessControl, PriceManipulation, Unusual, Custom }

    struct MonitoredContract {
        address contractAddress;
        address owner;            // who registered it
        string name;
        uint256 registeredAt;
        uint256 alertCount;
        uint8 securityScore;      // 0-100 (starts at 100, decreases with alerts)
        bool active;
    }

    struct Alert {
        uint256 monitorId;
        AlertSeverity severity;
        AlertType alertType;
        string description;
        bytes32 txHash;           // reference transaction hash
        uint256 timestamp;
        bool acknowledged;
        address reporter;
    }

    // ─── State ───────────────────────────────────────────────────────────

    mapping(uint256 => MonitoredContract) public monitors;
    mapping(uint256 => Alert) public alerts;
    mapping(address => uint256[]) public contractMonitors;  // contract => monitor IDs
    mapping(address => uint256[]) public ownerMonitors;     // owner => monitor IDs
    mapping(address => bool) public registeredReporters;    // authorized alert reporters

    uint256 public nextMonitorId;
    uint256 public nextAlertId;
    address public owner;

    // Severity score impacts
    mapping(AlertSeverity => uint8) public severityImpact;

    // ─── Events ──────────────────────────────────────────────────────────

    event ContractRegistered(uint256 indexed monitorId, address indexed contractAddress, string name);
    event AlertRaised(uint256 indexed alertId, uint256 indexed monitorId, AlertSeverity severity, AlertType alertType);
    event AlertAcknowledged(uint256 indexed alertId);
    event SecurityScoreUpdated(uint256 indexed monitorId, uint8 newScore);
    event ReporterRegistered(address indexed reporter);
    event MonitorDeactivated(uint256 indexed monitorId);

    // ─── Modifiers ───────────────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    modifier onlyReporter() {
        require(registeredReporters[msg.sender] || msg.sender == owner, "not authorized reporter");
        _;
    }

    modifier onlyMonitorOwner(uint256 monitorId) {
        require(monitors[monitorId].owner == msg.sender, "not monitor owner");
        _;
    }

    // ─── Constructor ─────────────────────────────────────────────────────

    constructor() {
        owner = msg.sender;
        registeredReporters[msg.sender] = true;

        // Set default severity impacts on security score
        severityImpact[AlertSeverity.Info] = 0;
        severityImpact[AlertSeverity.Low] = 2;
        severityImpact[AlertSeverity.Medium] = 5;
        severityImpact[AlertSeverity.High] = 15;
        severityImpact[AlertSeverity.Critical] = 30;
    }

    // ─── Reporter Management ─────────────────────────────────────────────

    function registerReporter(address reporter) external onlyOwner {
        registeredReporters[reporter] = true;
        emit ReporterRegistered(reporter);
    }

    function removeReporter(address reporter) external onlyOwner {
        registeredReporters[reporter] = false;
    }

    // ─── Contract Registration ───────────────────────────────────────────

    /// @notice Register a contract for monitoring
    function registerContract(address contractAddress, string calldata name) external returns (uint256 monitorId) {
        monitorId = nextMonitorId++;
        monitors[monitorId] = MonitoredContract({
            contractAddress: contractAddress,
            owner: msg.sender,
            name: name,
            registeredAt: block.timestamp,
            alertCount: 0,
            securityScore: 100,
            active: true
        });
        contractMonitors[contractAddress].push(monitorId);
        ownerMonitors[msg.sender].push(monitorId);
        emit ContractRegistered(monitorId, contractAddress, name);
    }

    /// @notice Deactivate monitoring
    function deactivateMonitor(uint256 monitorId) external onlyMonitorOwner(monitorId) {
        monitors[monitorId].active = false;
        emit MonitorDeactivated(monitorId);
    }

    // ─── Alert System ────────────────────────────────────────────────────

    /// @notice Raise a security alert for a monitored contract
    function raiseAlert(
        uint256 monitorId,
        AlertSeverity severity,
        AlertType alertType,
        string calldata description,
        bytes32 txHash
    ) external onlyReporter returns (uint256 alertId) {
        require(monitors[monitorId].active, "monitor not active");

        alertId = nextAlertId++;
        alerts[alertId] = Alert({
            monitorId: monitorId,
            severity: severity,
            alertType: alertType,
            description: description,
            txHash: txHash,
            timestamp: block.timestamp,
            acknowledged: false,
            reporter: msg.sender
        });

        monitors[monitorId].alertCount++;

        // Update security score
        uint8 impact = severityImpact[severity];
        uint8 currentScore = monitors[monitorId].securityScore;
        if (impact >= currentScore) {
            monitors[monitorId].securityScore = 0;
        } else {
            monitors[monitorId].securityScore = currentScore - impact;
        }

        emit AlertRaised(alertId, monitorId, severity, alertType);
        emit SecurityScoreUpdated(monitorId, monitors[monitorId].securityScore);
    }

    /// @notice Acknowledge an alert (contract owner)
    function acknowledgeAlert(uint256 alertId) external {
        uint256 monitorId = alerts[alertId].monitorId;
        require(monitors[monitorId].owner == msg.sender, "not monitor owner");
        require(!alerts[alertId].acknowledged, "already acknowledged");
        alerts[alertId].acknowledged = true;
        emit AlertAcknowledged(alertId);
    }

    // ─── View Functions ──────────────────────────────────────────────────

    /// @notice Get monitoring overview for a contract
    function getMonitorInfo(uint256 monitorId) external view returns (
        address contractAddress,
        address monitorOwner,
        string memory name,
        uint256 registeredAt,
        uint256 alertCount,
        uint8 securityScore,
        bool active
    ) {
        MonitoredContract storage m = monitors[monitorId];
        return (m.contractAddress, m.owner, m.name, m.registeredAt, m.alertCount, m.securityScore, m.active);
    }

    /// @notice Get alert details
    function getAlertInfo(uint256 alertId) external view returns (
        uint256 monitorId,
        AlertSeverity severity,
        AlertType alertType,
        string memory description,
        bytes32 txHash,
        uint256 timestamp,
        bool acknowledged,
        address reporter
    ) {
        Alert storage a = alerts[alertId];
        return (a.monitorId, a.severity, a.alertType, a.description, a.txHash, a.timestamp, a.acknowledged, a.reporter);
    }

    /// @notice Get all monitor IDs for a contract address
    function getContractMonitors(address contractAddress) external view returns (uint256[] memory) {
        return contractMonitors[contractAddress];
    }

    /// @notice Get all monitor IDs for an owner
    function getOwnerMonitors(address monitorOwner) external view returns (uint256[] memory) {
        return ownerMonitors[monitorOwner];
    }

    /// @notice Get alert severity breakdown for a monitor
    function getAlertBreakdown(uint256 monitorId) external view returns (
        uint256 critical,
        uint256 high,
        uint256 medium,
        uint256 low,
        uint256 info
    ) {
        uint256 total = nextAlertId;
        for (uint256 i; i < total; i++) {
            if (alerts[i].monitorId != monitorId) continue;
            AlertSeverity s = alerts[i].severity;
            if (s == AlertSeverity.Critical) critical++;
            else if (s == AlertSeverity.High) high++;
            else if (s == AlertSeverity.Medium) medium++;
            else if (s == AlertSeverity.Low) low++;
            else info++;
        }
    }

    /// @notice Batch get security scores for multiple monitors
    function batchGetScores(uint256[] calldata monitorIds) external view returns (uint8[] memory scores) {
        scores = new uint8[](monitorIds.length);
        for (uint256 i; i < monitorIds.length; i++) {
            scores[i] = monitors[monitorIds[i]].securityScore;
        }
    }
}
