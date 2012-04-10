/*
 * Copyright (c) 2012 Yahoo! Inc. All rights reserved.
 */
/*jslint anon:true, sloppy:true, nomen:true*/
YUI.add('html_frame_mojit_binder_index', function(Y, NAME) {

    var urlManager;

    /**
     * This YUI().use() should not be required here but something is *not* adding the "controller" module
     */
    Y.use('controller', 'node', function(YY){
        urlManager = new YY.Controller();
    });

    /**
     * Updates the URL in the addres bar
     *
     * Removes http://some.domain.com/ stuff if found
     */
    function updateUrl(url, redirect) {
        if (redirect) {
            Y.log('The URL provided was not found in Mojito.', 'info', NAME);
            document.location = url;
        } else {
            if (url.indexOf('http://') === 0) {
                url = url.slice(url.indexOf('/', 7));
            }
            urlManager.save(url);
        }
    }

    Y.namespace('mojito.binders')[NAME] = {

        /**
         * Binder initialization method, invoked after all binders on the page
         * have been constructed.
         */
        init: function(mp) {
            this.mp = mp;
        },

        /**
         * The binder method, invoked to allow the mojit to attach DOM event
         * handlers.
         *
         * @param node {Node} The DOM node to which this mojit is attached.
         */
        bind: function(node) {

            var that = this;
           
            /*
             * This YUI().use() should not be required but something is *not* adding the "node" module
             */
            YUI().use('node', function(YY){
                /*
                 * Listen for clicks on "a" nodes
                 */
                YY.one('body').delegate('click', function(event){

                    var url = event.target.get('href'),
                        params = {
                            body: {
                                url: url
                            }
                        };

                    /*
                     * Stop the URL from being called
                     */
                    event.preventDefault();

                    /*
                     * Now call our controller to see if we know the url
                     */
                    that.mp.invoke('handleUrlClick', {params:params}, function(err, data, meta){
                        if(err){
                            updateUrl(url, true);
                        } else {
                            updateUrl(url);
                            YY.one('title').setContent(meta.store.title);
                            YY.one('body').setContent(data);
                        }
                    });
                    
                }, 'a');
                
            });
        }
    };

}, '0.0.1', {requires: ['mojito-client', 'controller', 'node']});