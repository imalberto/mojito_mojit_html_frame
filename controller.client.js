/*
 * Copyright (c) 2011-2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*jslint anon:true, sloppy:true, nomen:true*/
/*global YUI*/

YUI.add('mojito_mojit_html_frame', function(Y, NAME) {

    Y.mojito.controllers[NAME] = {

        index: function(ac) {
            this.__call(ac);
        },

        __call: function(ac) {
            // Grab the "child" from the config and add it as the
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

            Y.log('executing mojito_mojit_html_frame child', 'mojito', 'qeperf');

            // Now execute the child as a composite
            ac.composite.execute(cfg, function(data, meta) {

                // Make sure we have meta
                meta.http = meta.http || {};
                meta.http.headers = meta.http.headers || {};

                // Set the default data
                meta.store = {
                    title: ac.config.get('title')
                };
//                Y.one('title').setContent(ac.config.get('title'));

                // Add all the assets we have been given to our local store
                ac.assets.addAssets(meta.assets);

                Y.log('mojito_mojit_html_frame done()', 'mojito', 'qeperf');

                ac.done(data.child, meta);
            });
        },

        handleUrlClick: function(ac){
            var url = ac.params.body('url') || '',
                route = ac.url.find(url, 'get'),
                command,
                mojitAction;

//            Y.log(JSON.stringify(route, null, 4));

            /*
             * If the "route" is null return an error
             */
            if(!route){
                ac.error('URL "' + url + '" not matched.');
                return;
            }

            /*
             * Get the mojit + action from the "route.call" key
             */
            mojitAction = route.call.split('.');

            /*
             * Build a "command" object to dispatch
             */
            command = {
                instance: {
                    base: mojitAction[0],
                    action: mojitAction[1] || 'index'
                },
                params: {
                    route: Y.merge(route.query, route.param),
                    url: Y.QueryString.parse(url.slice(url.indexOf('?') + 1)),
                    body: {},
                    file: {}
                },
                context: ac.context
            };

            /*
             * Now dispatch the "command" object
             */
            ac._dispatch(command, ac);
        }
    };

}, '0.1.0', {requires: ['mojito-url-addon', 'querystring-parse']});