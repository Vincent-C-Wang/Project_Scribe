// This is the js for the default/index.html view.

var app = function() {

    var self = {};

    Vue.config.silent = false; // show all warnings

    // Extends an array
    self.extend = function(a, b) {
        for (var i = 0; i < b.length; i++) {
            a.push(b[i]);
        }
    };

    // Enumerates an array.
    var enumerate = function(v) { var k=0; return v.map(function(e) {e._idx = k++;});};

    function get_memos_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return memos_url + "?" + $.param(pp);
    }

    self.get_more = function () {
        var num_memos = self.vue.memo_list.length;
        $.getJSON(get_memos_url(num_memos, num_memos + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.memo_list, data.memo_list);
        });
    };

    // *** Collect list of memos from server. ***
    // (query from database, done from api.py)
    self.get_memos = function(){

        // Server call
        // This is where the query to DB will be made in api.py
        $.getJSON(
            // memos_url,
            get_memos_url(0, 10),
            function (data) {

                // Update the local data
                self.vue.memo_list = data.memo_list;
                self.vue.logged_in = data.logged_in;
                self.vue.has_more = data.has_more;
            })
    };

    self.add_memo_button = function () {
        // The button to add a memo has been pressed.
        self.vue.is_adding_memo = !self.vue.is_adding_memo;
    };

    self.add_memo = function () {
        // The submit button to add a memo has been added.
        $.post(add_memo_url,
            {
                title: self.vue.form_title,
                memo: self.vue.form_memo
            },
            function (data) {
                $.web2py.enableElement($("#add_memo_submit"));
                self.vue.memo_list.unshift(data.memo);

                self.get_memos();
                // enumerate(self.vue.memo_list);

            });
    };

    self.delete_memo = function(memo_id) {
        $.post(del_memo_url,
            {
                memo_id: memo_id
            },
            function () {
                var idx = null;
                for (var i = 0; i < self.vue.memo_list.length; i++) {
                    if (self.vue.memo_list[i].id === memo_id) {
                        // If I set this to i, it won't work, as the if below will
                        // return false for items in first position.
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                    self.vue.memo_list.splice(idx - 1, 1);
                }
            }
        )
    };

    // This is so whenever "Edit Memo" is pressed, it only applies for the desired memo
    self.edit_memo_button = function(memo_id) {
        $.post(edit_memo_button_url,
            {
                memo_id: memo_id
            },
            function () {
                self.get_memos();
            }
        )
    };

    self.edit_memo = function(memo_id) {
        $.post(edit_memo_url,
            {
                memo_id: memo_id,
                title: self.vue.form_title,
                memo: self.vue.form_memo
            },
            function (data) {
                $.web2py.enableElement($("#edit_memo_submit"));

                // enumerate(self.vue.memos);
                self.get_memos();
            });
    };

    // Whenever the toggle button is pressed, it only applies for the desired memo
    self.toggle_public = function(memo_id) {
        $.post(toggle_public_url,
            {
                memo_id: memo_id
            },
            function () {
                self.get_memos();
            }
        )
    };

    // ***** Complete as needed. *****
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],            //indicates vue object
        unsafeDelimiters: ['!{', '}'],
        data: {
            logged_in: false,
            memo_list:[],
            has_more: false,
            is_adding_memo: false,
            is_editing_memo: false,
            form_title: null,
            form_memo: null,
            form_public: false,
        },
        methods: {
            get_memos: self.get_memos,
            get_more: self.get_more,
            add_memos_url: self.add_memos_url,
            add_memo_button: self.add_memo_button,
            add_memo: self.add_memo,
            delete_memo: self.delete_memo,
            edit_memo_button: self.edit_memo_button,
            edit_memo: self.edit_memo,
            toggle_public: self.toggle_public
        }
    });

    // Get initial data
    self.get_memos();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
