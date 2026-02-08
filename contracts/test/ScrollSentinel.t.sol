// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/ScrollSentinel.sol";

contract ScrollSentinelTest is Test {
    ScrollSentinel sentinel;
    address admin = makeAddr("admin");
    address projectOwner = makeAddr("projectOwner");
    address reporter = makeAddr("reporter");
    address target = makeAddr("targetContract");

    function setUp() public {
        vm.prank(admin);
        sentinel = new ScrollSentinel();
    }

    function test_registerContract() public {
        vm.prank(projectOwner);
        uint256 id = sentinel.registerContract(target, "MyDeFiProtocol");

        (address ca, address mo, string memory name, , , uint8 score, bool active) = sentinel.getMonitorInfo(id);
        assertEq(ca, target);
        assertEq(mo, projectOwner);
        assertEq(name, "MyDeFiProtocol");
        assertEq(score, 100);
        assertTrue(active);
    }

    function test_raiseAlertUpdatesScore() public {
        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        // Admin is auto-registered as reporter
        vm.prank(admin);
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.High, ScrollSentinel.AlertType.Reentrancy, "Reentrancy detected", bytes32(0));

        (,,,,,uint8 score,) = sentinel.getMonitorInfo(monId);
        assertEq(score, 85); // 100 - 15 (high severity)
    }

    function test_multipleAlertsStackImpact() public {
        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        vm.startPrank(admin);
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Critical, ScrollSentinel.AlertType.FlashLoan, "Flash loan attack", bytes32(0));
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.High, ScrollSentinel.AlertType.LargeWithdrawal, "Large withdrawal", bytes32(0));
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Medium, ScrollSentinel.AlertType.PriceManipulation, "Price manipulation", bytes32(0));
        vm.stopPrank();

        (,,,,uint256 alertCount, uint8 score,) = sentinel.getMonitorInfo(monId);
        assertEq(alertCount, 3);
        assertEq(score, 50); // 100 - 30 - 15 - 5
    }

    function test_scoreFloorAtZero() public {
        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        vm.startPrank(admin);
        // 4 critical alerts = 120 impact, but score floors at 0
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Critical, ScrollSentinel.AlertType.Reentrancy, "crit1", bytes32(0));
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Critical, ScrollSentinel.AlertType.Reentrancy, "crit2", bytes32(0));
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Critical, ScrollSentinel.AlertType.Reentrancy, "crit3", bytes32(0));
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Critical, ScrollSentinel.AlertType.Reentrancy, "crit4", bytes32(0));
        vm.stopPrank();

        (,,,,,uint8 score,) = sentinel.getMonitorInfo(monId);
        assertEq(score, 0);
    }

    function test_acknowledgeAlert() public {
        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        vm.prank(admin);
        uint256 alertId = sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Low, ScrollSentinel.AlertType.Unusual, "unusual activity", bytes32(0));

        vm.prank(projectOwner);
        sentinel.acknowledgeAlert(alertId);

        (,,,,,,bool acked,) = sentinel.getAlertInfo(alertId);
        assertTrue(acked);
    }

    function test_onlyReporterCanRaiseAlerts() public {
        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        vm.prank(projectOwner);
        vm.expectRevert("not authorized reporter");
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Low, ScrollSentinel.AlertType.Unusual, "test", bytes32(0));
    }

    function test_registerAndUseReporter() public {
        vm.prank(admin);
        sentinel.registerReporter(reporter);

        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        vm.prank(reporter);
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Medium, ScrollSentinel.AlertType.AccessControl, "access issue", bytes32(0));

        (,,,,uint256 alertCount,,) = sentinel.getMonitorInfo(monId);
        assertEq(alertCount, 1);
    }

    function test_deactivateMonitor() public {
        vm.prank(projectOwner);
        uint256 monId = sentinel.registerContract(target, "Protocol");

        vm.prank(projectOwner);
        sentinel.deactivateMonitor(monId);

        (,,,,,,bool active) = sentinel.getMonitorInfo(monId);
        assertFalse(active);

        // Can't raise alerts on deactivated monitor
        vm.prank(admin);
        vm.expectRevert("monitor not active");
        sentinel.raiseAlert(monId, ScrollSentinel.AlertSeverity.Low, ScrollSentinel.AlertType.Unusual, "test", bytes32(0));
    }

    function test_ownerMonitorsTracking() public {
        vm.startPrank(projectOwner);
        sentinel.registerContract(target, "Proto1");
        sentinel.registerContract(makeAddr("c2"), "Proto2");
        sentinel.registerContract(makeAddr("c3"), "Proto3");
        vm.stopPrank();

        uint256[] memory ids = sentinel.getOwnerMonitors(projectOwner);
        assertEq(ids.length, 3);
    }

    function test_batchGetScores() public {
        vm.startPrank(projectOwner);
        uint256 id1 = sentinel.registerContract(target, "P1");
        uint256 id2 = sentinel.registerContract(makeAddr("c2"), "P2");
        vm.stopPrank();

        vm.prank(admin);
        sentinel.raiseAlert(id1, ScrollSentinel.AlertSeverity.High, ScrollSentinel.AlertType.Reentrancy, "alert", bytes32(0));

        uint256[] memory ids = new uint256[](2);
        ids[0] = id1;
        ids[1] = id2;
        uint8[] memory scores = sentinel.batchGetScores(ids);
        assertEq(scores[0], 85);
        assertEq(scores[1], 100);
    }
}
