/**
 * Show the tree of admins presets.
 *
 * @module     tool_admin_presets/tree
 * @copyright  2019 Pimenko <contact@pimenko.com>
 * @author     Jordan Kesraoui
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
define(['core/ajax', 'core/tree', 'core/templates', 'jquery'], (Ajax, TreeAccessible, Templates, $) => {

    /**
     * NodeTree Object.
     * @param {string} id  Id of the node.
     * @param {string} settingId Id of the setting.
     * @param {string} label Label of the setting.
     * @param {string} description Description of the setting.
     * @constructor
     */
    let NodeTree = function(id, settingId, label, description) {
        this.id = id;
        this.settingId = settingId;
        this.label = label;
        this.description = description;
        this.parent = null;
        this.displayed = false;
        this.checked = true;
        this.level = 1;
        this.children = [];
        this.padding = 0;
    };

    /**
     * Return if the node has children or not.
     *
     * @return {boolean}
     */
    NodeTree.prototype.hasChildren = function() {
        return this.children.length > 0;
    };

    /**
     * Return if the node is empty (without children and is category type).
     * @return {boolean}
     */
    NodeTree.prototype.isEmpty = function() {
        return this.settingId === 'category' && !this.hasChildren();
    };

    /**
     * Accessible Tree of settings.
     *
     * @param {string} rootNode Element Id of the root of the tree.
     * @constructor
     */
    let Tree = function(rootNode) {
        this.view = null;
        this.nodes = [];
        this.accessibleview = null;
        this.rootNode = document.getElementById(rootNode);
    };

    /**
     * Initialise the tree.
     *
     * @param {array} ids Array of setting ids.
     * @param {array} nodeids Array of node ids.
     * @param {array} labels Array of settings labels.
     * @param {array} descriptions Arrays of settings descriptions.
     * @param {array} parents Arrays of setings parents.
     */
    Tree.prototype.init = function(ids, nodeids, labels, descriptions, parents) {
        let nelements = ids.length;

        this.rootNode.innerHTML = "";
        let promises = [];

        // Add all nodes to the Tree.
        for (let i = 0; i < nelements; i++) {

            // Create a new node.
            let newNode = new NodeTree(
                nodeids[i],
                ids[i],
                decodeURIComponent(labels[i]),
                decodeURIComponent(descriptions[i])
            );

            this.nodes[newNode.id] = newNode;
        }

        // Associate parents and children.
        for (let i = 0; i < nelements; i++) {
            if (parents[i] === 'root') {
                this.nodes[nodeids[i]].parent = null;
            } else {
                this.nodes[nodeids[i]].parent = this.nodes[parents[i]];
                this.nodes[parents[i]].children.push(this.nodes[nodeids[i]]);
            }
        }

        // Display all parent nodes.
        for (var key in this.nodes) {
            if (this.nodes.hasOwnProperty(key)) {
                if (this.nodes[key].parent === null) {
                    promises.push(this.display(key));
                }
            }
        }

        // Make the tree accessible.
        Promise.all(promises).finally(() => {
            this.accessibleview = new TreeAccessible('#' + this.rootNode.getAttribute('id'));
        }).catch(function(error) {
            window.console.log(error);
        });
    };

    /**
     * Apply the events click on the element's node and his checkbox.
     *
     * @param {string} nodeId Id of the node.
     */
    Tree.prototype.applyEvent = function(nodeId) {
        let node = this.nodes[nodeId];
        // If the elements is displayed.
        if (node.displayed) {

            let elementNode = document.getElementById(nodeId);

            // Display all children node when is the node is clicked.
            elementNode.addEventListener('focus', () => {
                if (node.hasChildren()) {

                    let promises = [];
                    node.children.forEach((nodeChild) => {
                        promises.push(this.display(nodeChild.id));
                    });

                    // Make the node accessible.
                    Promise.all(promises).finally(() => {
                        this.accessibleview.initialiseNodes($('#' + nodeId));
                    }).catch(function(error) {
                        window.console.log(error);
                    });
                }
            });

            // Change the value of mark checked when a click on the checkbox.
            let checkboxElement = document.getElementById(nodeId + '_checkbox');
            checkboxElement.addEventListener('click', (event) => {
                event.stopPropagation();
                this.setChecked(nodeId, !node.checked);
            });

            // Change the value of mark checked when the enter key is pushed.
            elementNode.addEventListener('keydown', (event) => {

                switch (event.key) {

                    case "Enter" : {

                        event.stopPropagation();
                        event.preventDefault();

                        this.setChecked(nodeId, !node.checked);

                        return;
                    }

                    case "ArrowRight": {

                        event.stopPropagation();
                        event.preventDefault();

                        if (this.accessibleview.isGroupItem($(event.target))) {

                            if (this.accessibleview.isGroupCollapsed($(event.target).find('a.collapse_link'))) {
                                let collapselink = $(event.target).find('a.collapse_link').first();
                                collapselink.click();

                                let group = $(event.target).find("div[role=group]").first();
                                group.find("div[role=treeitem]").first().focus();
                            }

                        }
                        return;
                    }

                    case "ArrowLeft" : {

                        event.stopPropagation();
                        event.preventDefault();

                        if (this.accessibleview.isGroupItem($(event.target))) {

                            if (this.accessibleview.isGroupCollapsed($(event.target).find('a.collapse_link'))) {
                                $(event.target).parents('div[role=treeitem]').first().focus();
                            } else {
                                let collapselink = $(event.target).find('a.collapse_link').first();
                                collapselink.click();
                                collapselink.parent().focus();
                            }

                        } else {
                            $(event.target).parents('div[role=treeitem]').first().focus();
                        }

                        return;
                    }

                    case "ArrowDown" : {

                        event.stopPropagation();
                        event.preventDefault();

                        if ($(event.target).data('setting') === true
                            || this.accessibleview.isGroupCollapsed($(event.target).find('a.collapse_link'))) {

                            let next = $(event.target).next();

                            if (next.is(":visible")) {
                                next.focus();
                            } else if ($(event.target).next().length === 0) {
                                let parentnext = $(event.target).parents('div[role=treeitem]');
                                parentnext.next().focus();
                            }
                        } else {

                            let group = $(event.target).find("div[role=group]").first();
                            group.find("div[role=treeitem]").first().focus();
                        }

                        return;
                    }

                    case "ArrowUp": {

                        event.stopPropagation();
                        event.preventDefault();

                        let prev = $(event.target).prev();

                        if (prev.is(":visible")) {
                            prev.focus();
                        } else if ($(event.target).prev().length === 0) {
                            let parent = $(event.target).parents('div[role=treeitem]');
                            parent.focus();
                        }
                        return;
                    }

                }
            });
        }
    };

    /**
     * Display the Node in the DOM (create DOM element).
     *
     * @param {string} nodeId Id of the node.
     * @return {Promise}
     */
    Tree.prototype.display = function(nodeId) {
        return new Promise((resolve, reject) => {
            let node = this.nodes[nodeId];
            // If the elements is not yet displayed.

            if (!node.displayed && !node.isEmpty()) {
                let parentElement = null;
                // Take the root node of the tree if the Node hasn't parent.
                if (node.parent === null) {
                    parentElement = this.rootNode;
                } else {
                    parentElement = document.getElementById(node.parent.id).querySelector('div[role=group]');
                    this.nodes[nodeId].level = this.nodes[node.parent.id].level + 1;
                }

                let haschildren = '';
                if (node.hasChildren()) {
                    haschildren = 'has-children';
                }

                let checked = false;
                if (node.checked) {
                    checked = true;
                }

                let issetting = false;

                if (node.settingId === "setting") {
                    issetting = true;
                }

                // Add the new node in the DOM.
                // Calculate padding for element.
                if (node.level > 1) {
                    node.padding = 20 * (node.level - 1);

                    if (issetting) {
                        node.padding = node.padding + 15;
                    }
                }

                // Get settings nbr.
                let settingsnbr = 0;
                if (node.hasChildren()) {
                    let countsetting = 0;
                    node.children.forEach((childNode) => {
                        // Count checked child.
                        countsetting = countsetting + this.getSettingsNbr(childNode.id);
                    });
                    settingsnbr = countsetting;
                }

                let newNode = {
                    "id": node.id,
                    "level": node.level,
                    "label": node.label,
                    "has_children": haschildren,
                    "checked": checked,
                    "setting": issetting,
                    "settingsnumber": settingsnbr,
                    "padding": node.padding
                };

                // Add the node in the DOM.
                Templates.render('tool_admin_presets/tree_node', newNode).then((html) => {

                    parentElement.insertAdjacentHTML('beforeend', html);

                    // Mark the node displayed.
                    this.nodes[nodeId].displayed = true;

                    // Apply click event on the element.
                    this.applyEvent(nodeId);

                    // Add padding level.
                    if (newNode.setting === true) {
                        let escapeId = newNode.id.replace('@@', '\\@\\@');
                        document.querySelectorAll('#' + escapeId + " .admin_presets_tree_name")[0]
                            .style.padding = "0px 0px 0px " + newNode.padding + 'px';
                    }

                    return resolve(true);
                }).catch(function(error) {
                    reject(false);
                    window.console.log(error);
                });
            } else {
                resolve(true);
            }
        });
    };

    /**
     * Get the settings number for this node and all child.
     *
     * @param {string} nodeId Id of the node.
     *
     * @return {int} settingsnbr nbr of settings.
     */
    Tree.prototype.getSettingsNbr = function(nodeId) {
        let node = this.nodes[nodeId];

        let countsettings = 0;

        if (node.settingId === 'setting') {
            countsettings++;
        }

        // Modify all children.
        if (node.hasChildren()) {
            node.children.forEach((childNode) => {
                // Count checked child.
                countsettings = countsettings + this.getSettingsNbr(childNode.id);
            });
        }

        return countsettings;
    };

    /**
     * Set the property checked on the node and his children.
     *
     * @param {string} nodeId Id of the node.
     * @param {boolean} checked Checking status.
     */
    Tree.prototype.setChecked = function(nodeId, checked) {
        let node = this.nodes[nodeId];
        this.nodes[nodeId].checked = checked;

        // Change the checkbox apparence.
        if (node.displayed) {
            let checkboxElement = document.getElementById(nodeId + '_checkbox');
            // Check the node.
            checkboxElement.checked = checked;

            // Add or remove active class.
            let escapeId = nodeId.replace('@@', '\\@\\@');
            if (checked) {
                document.querySelector('label[for=' + escapeId + '_checkbox' + ']').classList.add('active');
            } else {
                document.querySelector('label[for=' + escapeId + '_checkbox' + ']').classList.remove('active');
            }
        }

        // Modify all children.
        if (node.hasChildren()) {
            node.children.forEach((childNode) => {
                // Count checked child.
                this.setChecked(childNode.id, checked);
            });
        }
    };

    /**
     * Submit the settings to the form.
     *
     * @param {string} buttonId Id of submit button element.
     */
    Tree.prototype.submit = function(buttonId) {
        let button = document.getElementById(buttonId);

        // Event on click on the submit button.
        button.addEventListener('click', () => {
            let settingsPresetsForm = document.getElementById("settings_tree_div");

            // Create all hidden input with nodes checked.
            for (let key in this.nodes) {
                if (this.nodes.hasOwnProperty(key)) {
                    let node = this.nodes[key];
                    if (document.getElementById(node.id + '_checkbox')) {
                        let settingInput = document.getElementById(node.id + '_checkbox');

                        if (settingInput.checked) {
                            settingInput.setAttribute('value', '1');
                        }
                    } else if (node.settingId !== 'category' && node.settingId !== 'page' && node.checked) {
                        let settingInput = document.createElement('input');
                        settingInput.setAttribute('type', 'hidden');
                        settingInput.setAttribute('name', node.id);
                        settingInput.setAttribute('value', '1');
                        settingsPresetsForm.appendChild(settingInput);
                    }
                }
            }
        });
    };

    /**
     * Removes all child DOM elements of the given node from the tab order.
     *
     * @method removeAllFromTabOrder
     * @param {object} node jquery object representing a node.
     */
    TreeAccessible.prototype.removeAllFromTabOrder = function(node) {
        node.find('*').attr('tabindex', '-1');
        this.getGroupFromItem($(node)).find('*').attr('tabindex', '-1');
    };

    return {
        init: (action) => {

            if (action === 'export') {
                this.ajaxmethodname = 'tool_admin_presets_get_settings';
            }
            // Call ajax functions to retrieve settings.
            Ajax.call([{
                methodname: this.ajaxmethodname,
                args: {}
            }], true, true)[0].done((response) => {

                    // Make the tree with settings retrieved.
                    let treesettings = new Tree('settings_tree_div');
                    treesettings.init(
                        response.settings.ids,
                        response.settings.nodes,
                        response.settings.labels,
                        response.settings.descriptions,
                        response.settings.parents);

                    // Make the tree with settings retrieved.
                    let treeplugins = new Tree('settingsplugin_tree_div');
                    treeplugins.init(
                        response.plugins.ids,
                        response.plugins.nodes,
                        response.plugins.labels,
                        response.plugins.descriptions,
                        response.plugins.parents);

                    // Set the submit event.
                    treesettings.submit('id_submitbutton');
                    treeplugins.submit('id_submitbutton');
                }
            );
        }
    };
});
