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

    // *** Collect list of all favorites from database. ***
    self.get_favorites = function(){
        $.getJSON(
            favorites_url,
            function (data) {
                // Update the local data
                self.vue.favorites_list = data.favorites_list
            })
    };

    self.favorite_scroll = function (scroll_id, author_id) {
        $.post(favorite_scroll_url,
            {
                logged_id: self.vue.logged_id,
                owner_id: author_id,
                scroll_id: scroll_id
            },
            function () {
                self.get_scrolls();
                self.get_favorites();
            })
    };

    self.unfavorite_scroll = function (logged_id, scroll_id) {
        var i;
        var fav_id = null;
        // Get database ID for the specified scroll under the current user
        for (i = 0; i < self.vue.favorites_list.length; i++) {
            if (logged_id == self.vue.favorites_list[i].logged_id &&
                scroll_id == self.vue.favorites_list[i].scroll_id) {
                fav_id = self.vue.favorites_list[i].id;
            }
        }
        $.post(unfavorite_scroll_url,
            {
                fav_id: fav_id
            },
            function () {
                self.get_scrolls();
                self.get_favorites();
            })
    };

    self.is_favorite = function(logged_id, scroll_id) {
        var i;
        var is_fav = false;
        for (i = 0; i < self.vue.favorites_list.length; i++) {
            if (logged_id == self.vue.favorites_list[i].logged_id &&
                scroll_id == self.vue.favorites_list[i].scroll_id) {
                is_fav = true;
            }
        }
        return is_fav;
    };

    self.add_scroll_button = function () {
        // The button to add a scroll has been pressed.
        self.vue.is_adding_scroll = !self.vue.is_adding_scroll;
    };

    self.add_scroll = function () {
        $.post(add_scroll_url,
            {
                title: self.vue.form_title_add,
                author_name: self.vue.logged_user,
                abstract: self.vue.form_abstract_add,
                post: self.vue.form_post_add
            },
            function (data) {
                $.web2py.enableElement($("#add_scroll_submit"));
                self.vue.scroll_list.unshift(data.scroll);
                self.add_scroll_button();
                self.get_scrolls();
                // enumerate(self.vue.scroll_list);

                self.vue.form_title_add = null;
                self.vue.form_abstract_add = null;
                self.vue.form_post_add = null;
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

    // *** Collect list of all users from database. ***
    self.get_profiles = function(){
        $.getJSON(
            profiles_url,
            function (data) {
                // Update the local data
                self.vue.profile_list = data.profile_list;
            })
    };

    self.view_profile = function(author_id) {
        self.vue.is_main_page = false;
        self.vue.is_profile_page = true;
        self.vue.p_id = self.vue.profile_list[author_id-1].profile_id;
        self.vue.p_first_name = self.vue.profile_list[author_id-1].first_name;
        self.vue.p_last_name = self.vue.profile_list[author_id-1].last_name;
        self.vue.p_email = self.vue.profile_list[author_id-1].author_email;
        self.vue.p_about_me = self.vue.profile_list[author_id-1].about_me;

        $.post(view_profile_url, {
            author_id: author_id
        },
        function () {});
    };

     self.edit_bio_button = function () {
        // The button to edit the "About Me" portion has been pressed.
        self.vue.is_editing_bio = !self.vue.is_editing_bio;
    };

    self.edit_bio = function(profile_id) {
        $.post(edit_bio_url,
            {
                profile_id: profile_id,
                about_me: self.vue.p_about_me
            },
            function () {
                $.web2py.enableElement($("#edit_bio_submit"));
                self.edit_bio_button();
                self.get_profiles();
            });
    };

    self.back_to_main = function() {
        self.vue.is_main_page = true;
        self.vue.is_profile_page = false;
    };

    // ***** Complete as needed. *****
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],            //indicates vue object
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_main_page: true,
            is_profile_page: false,
            logged_in: false,
            logged_user: null,
            logged_id: null,
            profile_list: [],
            scroll_list: [],
            favorites_list: [],
            has_more: false,
            is_adding_scroll: false,
            is_editing_scroll: false,
            form_title_add: null,
            form_abstract_add: null, 
            form_post_add: null,

            p_id: null,
            p_first_name: null,
            p_last_name: null,
            p_email: null,
            p_about_me: null,
            is_editing_bio: false
        },
        methods: {
            get_profiles: self.get_profiles,
            get_scrolls: self.get_scrolls,
            get_favorites: self.get_favorites,
            get_more: self.get_more,
            favorite_scroll: self.favorite_scroll,
            unfavorite_scroll: self.unfavorite_scroll,
            is_favorite: self.is_favorite,
            add_scroll_button: self.add_scroll_button,
            add_scroll: self.add_scroll,
            delete_scroll: self.delete_scroll,
            edit_scroll_button: self.edit_scroll_button,
            edit_scroll: self.edit_scroll,
            view_profile: self.view_profile,
            back_to_main: self.back_to_main,

            edit_bio_button: self.edit_bio_button,
            edit_bio: self.edit_bio
        }
    });

    // Get initial data
    self.get_profiles();
    self.get_scrolls();
    self.get_favorites();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
