@tool @tool_admin_presets @javascript @presets_tree
Feature: I should see presets tree when I am on "Create preset" page

  Background:
    Given I log in as "admin"
    And I navigate to "Site admin presets" in site administration

  Scenario: Should see a setting and plugin tree
    Given I click on "Create preset" "button"
    And I should see "Admin settings"
    And I should see "Users" in the "#settings_tree_div" "css_element"
    Then I click on "Users" "link" in the "#settings_tree_div" "css_element"
    And I should see "Accounts" in the "#accountsNode" "css_element"
    Then I click on "Accounts" "link" in the "#accountsNode" "css_element"
    And I should see "User management" in the "#usermanagementNode" "css_element"
    Then I click on "User management" "link" in the "#usermanagementNode" "css_element"
    And I should see "Default user filters" in the "#usermanagementNode_group" "css_element"
    And I should see "Plugin settings"
    And I should see "mod" in the "#settingsplugin_tree_div" "css_element"
