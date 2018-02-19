'use strict';

fruskac.Dialog = (function () {

    /**
     * Dialog
     * @global
     * @constructor
     */
    function Dialog() {

        var self = this;

        self.container = document.createElement('div');

        self.dialog = new InfoBox({
            content: self.container,
            maxWidth: 280,
            pixelOffset: new google.maps.Size(-16, -308),
            zIndex: null,
            boxClass: 'dialog',
            boxStyle: {
                width: '280px'
            },
            closeBoxURL: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOC4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMTYgMTYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDE2IDE2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwb2x5Z29uIHBvaW50cz0iMTYsMS45IDE0LjEsMCA4LDYuMSAxLjksMCAwLDEuOSA2LjEsOCAwLDE0LjEgMS45LDE2IDgsOS45IDE0LjEsMTYgMTYsMTQuMSA5LjksOCAiLz4NCjwvc3ZnPg0K',
            closeBoxMargin: '5px',
            infoBoxClearance: new google.maps.Size(10, 10),
            isHidden: false,
            pane: 'floatPane',
            enableEventPropagation: false
        });

        // Event that closes the Dialog with a click on the map
        google.maps.event.addListener(gmap, 'click', function () {
            self.close();
        });

        // Event that closes the Dialog on ESC key
        google.maps.event.addDomListener(document, 'keyup', function (e) {
            var code = (e.keyCode ? e.keyCode : e.which);
            if (code === 27) {
                self.close();
            }
        });

        event.subscribe([
            EVENT_STORAGE_STATE_CHANGE,
            EVENT_STORAGE_FOCUS,
            EVENT_STORAGE_HIGHLIGHT
        ], function () {
            self.close();
        });

    }

    /**
     * @global
     */
    Dialog.prototype = {

        /**
         * Open Dialog with content and position
         * @param {string} content
         * @param {*} anchor
         */
        open: function (content, anchor) {

            var self = this;

            self.container.innerHTML = content;

            self.dialog.setContent(self.container);

            setTimeout(function () {
                self.dialog.open(gmap, anchor);
                setTimeout(function () {
                    self.animateWobble();
                }, 99)
            }, 99);

        },

        /**
         * Closes Dialog
         */
        close: function () {
            if (this.dialog.getVisible()) {
                this.dialog.close();
            }
        },

        /**
         * Animate Marker with Wobble animation
         */
        animateWobble: function () {
            dynamics.animate(this.container.parentNode, {
                rotateZ: Math.random() * 30 - 15
            }, {
                type: dynamics.bounce,
                duration: 1800
            })
        }

    };

    return Dialog;

})();
