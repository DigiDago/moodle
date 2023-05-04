<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

namespace tool_admin_presets\external;

use core_external\external_api;

/**
 * Tests for the get_settings external class.
 *
 * @package    tool_admin_presets
 * @category   test
 * @copyright  2023 Pimenko <support@pimenko.com><pimenko.com>
 * @author     Sylvain Revenu | Pimenko
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @coversDefaultClass \tool_admin_presets\external\get_settings
 */
class get_settings_test extends \advanced_testcase {

    /**
     * Cover main methode of this external get_settings class.
     *
     * @covers ::execute
     * @return void
     */
    public function test_execute():void {
        $this->resetAfterTest();
        $this->setAdminUser();

        $results = get_settings::execute();
        $results = external_api::clean_returnvalue(
            get_settings::execute_returns(),
            $results
        );

        // Check both tree are presents.
        $this->assertArrayHasKey('settings', $results);
        $this->assertArrayHasKey('plugins', $results);

        // Check general structure of both tree.
        $this->assertArrayHasKey('ids', $results['settings']);
        $this->assertArrayHasKey('descriptions', $results['settings']);
        $this->assertArrayHasKey('labels', $results['settings']);
        $this->assertArrayHasKey('nodes', $results['settings']);
        $this->assertArrayHasKey('parents', $results['settings']);

        $this->assertArrayHasKey('ids', $results['plugins']);
        $this->assertArrayHasKey('descriptions', $results['plugins']);
        $this->assertArrayHasKey('labels', $results['plugins']);
        $this->assertArrayHasKey('nodes', $results['plugins']);
        $this->assertArrayHasKey('parents', $results['plugins']);
    }
}
