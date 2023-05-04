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

use context_system;
use core_external\external_api;
use core_external\external_single_structure;
use core_external\external_multiple_structure;
use core_external\external_value;
use core_external\external_function_parameters;
use core_adminpresets\manager;

/**
 * Define some function for AJAX request
 *
 * @package          tool_admin_presets
 * @copyright        2023 Pimenko <support@pimenko.com><pimenko.com>
 * @author           Jordan Kesraoui | Sylvain Revenu | Pimenko based on David Monllaó <david.monllao@urv.cat> code
 * @license          http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class get_settings extends external_api {

    /**
     * Returns description of get_settings() parameters.
     *
     * @return external_function_parameters
     */
    public static function execute_parameters(): external_function_parameters {
        return new external_function_parameters([]);
    }

    /**
     * Get all the system settings.
     *
     * @return array of system settings
     */
    public static function execute(): array {
        global $PAGE;
        $PAGE->set_context(context_system::instance());
        $manager = new manager();
        $data = [];

        $settings = $manager->get_site_settings();

        $plugins = $manager->get_site_plugins();

        if ($settings) {
            $data['settings'] = $manager->get_settings_branches($settings);
        }

        if ($plugins) {
            $data['plugins'] = $manager->get_plugins_branches($plugins);
        }

        return $data;
    }

    /**
     * Returns description of get_settings() result value.
     *
     * @return external_single_structure
     */
    public static function execute_returns(): external_single_structure {
        return new external_single_structure([
            'settings' => new external_single_structure([
                'ids' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting id')
                ),
                'descriptions' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting description')
                ),
                'labels' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting label')
                ),
                'nodes' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Nodes key')
                ),
                'parents' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting parent')
                ),
            ]),
            'plugins' => new external_single_structure([
                'ids' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting id')
                ),
                'descriptions' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting description')
                ),
                'labels' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting label')
                ),
                'nodes' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Nodes key')
                ),
                'parents' => new external_multiple_structure(
                    new external_value(PARAM_TEXT, 'Setting parent')
                )
            ]),
        ]);
    }
}
