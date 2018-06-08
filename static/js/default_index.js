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

    // *** Collect list of other users from database. ***
    self.get_users = function(){
        $.getJSON(
            users_url,
            function (data) {
                // Update the local data
                self.vue.users_list = data.users_list;
            })
    };

    function get_scrolls_url(start_idx, end_idx) {
        var pp = {
            start_idx: start_idx,
            end_idx: end_idx
        };
        return scrolls_url + "?" + $.param(pp);
    }

    self.get_more = function () {
        var num_scrolls = self.vue.scroll_list.length;
        $.getJSON(get_scrolls_url(num_scrolls, num_scrolls + 10), function (data) {
            self.vue.has_more = data.has_more;
            self.extend(self.vue.scroll_list, data.scroll_list);
        });
    };

    // *** Collect logged user info and list of scrolls from database. ***
    self.get_scrolls = function(){
        $.getJSON(
            // scrolls_url,
            get_scrolls_url(0, 10),
            function (data) {
                // Update the local data
                self.vue.scroll_list = data.scroll_list;
                self.vue.logged_in = data.logged_in;
                self.vue.logged_id = data.logged_id;
                self.vue.logged_user = data.logged_user;
                self.vue.has_more = data.has_more;
            })
    };

    self.favorite_scroll = function (scroll_id, owner_email) {
        $.post(favorite_scroll_url,
            {
                logged_id: self.vue.logged_id,
                owner_email: owner_email,
                scroll_id: scroll_id
            },
            function () {
                self.get_scrolls();
            })
    };

    self.unfavorite_scroll = function (scroll_id) {
        $.post(unfavorite_scroll_url,
            {
                scroll_id: scroll_id
            },
            function () {
                self.get_scrolls();
            })
    };

    self.add_scroll_button = function () {
        // The button to add a scroll has been pressed.
        self.vue.is_adding_scroll = !self.vue.is_adding_scroll;
    };

    self.add_scroll = function () {
        $.post(add_scroll_url,
            {
                title: self.vue.form_title_add,
                abstract: self.vue.form_abstract_add,
                post: self.vue.form_post_add
            },
            function (data) {
                $.web2py.enableElement($("#add_scroll_submit"));
                self.vue.scroll_list.unshift(data.scroll);
                self.add_scroll_button();
                self.get_scrolls();
                // enumerate(self.vue.scroll_list);
            });
    };

    self.delete_scroll = function(scroll_id) {
        $.post(del_scroll_url,
            {
                scroll_id: scroll_id
            },
            function () {
                var idx = null;
                for (var i = 0; i < self.vue.scroll_list.length; i++) {
                    if (self.vue.scroll_list[i].id === scroll_id) {
                        idx = i + 1;
                        break;
                    }
                }
                if (idx) {
                    self.vue.scroll_list.splice(idx - 1, 1);
                }})
    };

    // This is so whenever "Edit Scroll" is pressed, it only applies for the desired scroll
    self.edit_scroll_button = function(scroll_id) {
        $.post(edit_scroll_button_url,
            {
                scroll_id: scroll_id
            },
            function () {
                self.get_scrolls();
            })
    };

    self.edit_scroll = function(scroll_id, new_title, new_abs, new_post) {
        $.post(edit_scroll_url,
            {
                scroll_id: scroll_id,
                title: new_title,
                abstract: new_abs,
                post: new_post
            },
            function (data) {
                $.web2py.enableElement($("#edit_scroll_submit"));
                // enumerate(self.vue.scroll_list);
                self.edit_scroll_button(scroll_id);
                self.get_scrolls();
            });
    };

    // ***** Complete as needed. *****
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],            //indicates vue object
        unsafeDelimiters: ['!{', '}'],
        data: {
            logged_in: false,
            logged_user: null,
            logged_id: null,
            users_list: [],
            scroll_list: [],
            has_more: false,
            is_adding_scroll: false,
            is_editing_scroll: false,
            form_title_add: null,
            form_abstract_add: null,
            form_post_add: null,
        },
        methods: {
            get_scrolls: self.get_scrolls,
            get_more: self.get_more,
            favorite_scroll: self.favorite_scroll,
            unfavorite_scroll: self.unfavorite_scroll,
            add_scroll_button: self.add_scroll_button,
            add_scroll: self.add_scroll,
            delete_scroll: self.delete_scroll,
            edit_scroll_button: self.edit_scroll_button,
            edit_scroll: self.edit_scroll,
        }
    });

    // Get initial data
    self.get_scrolls();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
