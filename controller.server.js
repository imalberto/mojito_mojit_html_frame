/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


/*jslint anon:true, sloppy:true, nomen:true*/
/*global YUI*/


YUI.add('html_frame_mojit', function(Y, NAME) {

    var renderListAsHtmlAssets = function(list, type) {
        var i,
            data = '';

        if ('js' === type) {
            for (i = 0; i < list.length; i += 1) {
                data += '<script type="text/javascript" src="' +
                    list[i] + '"></script>\n';
            }
        } else if ('css' === type) {
            for (i = 0; i < list.length; i += 1) {
                data += '<link rel="stylesheet" type="text/css" href="' +
                    list[i] + '"/>\n';
            }
        } else if ('blob' === type) {
            for (i = 0; i < list.length; i += 1) {
                data += list[i] + '\n';
            }
        } else {
            Y.log('Unknown asset type "' + type + '". Skipped.', 'warn', NAME);
        }

        return data;
    };

    /**
     * Adds a binder to meta.binders object
     */
    function addHtmlFrameMojitBinder(meta){
        meta.binders['html_frame_mojit_node'] = {
            type: 'html_frame_mojit',
            viewId: 'html_frame_mojit_node',
            instanceId: 'html_frame_mojit_node',
            name: 'html_frame_mojit_binder_index',
            needs: {
                "html_frame_mojit_binder_index": "/static/html_frame_mojit/binders/index.js"
            }
        };
    }

    Y.mojito.controllers[NAME] = {

        index: function(ac) {
            this.__call(ac);
        },


        __call: function(ac) {

            // Grab the "child" from the config an add it as the
            // only item in the "children" map.
            var child = ac.config.get('child'),
                cfg;

            // Map the action to the child
            child.action = ac.action;

            // Create a config object for the composite addon
            cfg = {
                children: {
                    child: child
                },
                assets: ac.config.get('assets')
            };

            Y.log('executing html_frame_mojit child', 'mojito', 'qeperf');

            // Now execute the child as a composite
            ac.composite.execute(cfg, function(data, meta) {

                // Make sure we have meta
                meta.http = meta.http || {};
                meta.http.headers = meta.http.headers || {};

                // Make sure our Content-type is HTML
                meta.http.headers['content-type'] =
                    'text/html; charset="utf-8"';

                // Set the default data
                data.title = ac.config.get('title') ||
                    'Powered by Mojito ' + Y.mojito.version;
                data.mojito_version = Y.mojito.version;

                /*
                 * Add the Binder required for trapping links client side
                 */
                addHtmlFrameMojitBinder(meta);

                // Add all the assets we have been given to our local store
                ac.assets.addAssets(meta.assets);

                // If we are deploying to the client get all the assets required
                if (ac.config.get('deploy') === true) {
                    ac.deploy.constructMojitoClientRuntime(ac.assets,
                        meta.binders);
                }

                // Attach assets found in the "meta" to the page
                Y.Object.each(ac.assets.getAssets(), function(types, location) {
                    if (!data[location]) {
                        data[location] = '';
                    }
                    Y.Object.each(types, function(assets, type) {
                        data[location] += renderListAsHtmlAssets(assets, type);
                    });
                });

                meta.view = {name: 'index'};

                Y.log('html_frame_mojit done()', 'mojito', 'qeperf');

                ac.done(data, meta);
            });
        }
    };

}, '0.1.0', {requires: [
    'mojito-assets-addon',
    'mojito-deploy-addon',
    'mojito-config-addon'
]});
