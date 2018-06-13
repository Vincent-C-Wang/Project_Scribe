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

    // Switch to page displaying specified user's favorites
    self.view_user_favs = function(user_id) {
        self.vue.is_main_page = false;
        self.vue.is_favs_page = true;
        self.vue.is_fols_page = false;
        self.vue.is_profile_page = false;

        var all_favs = self.vue.favorites_list;
        var scrls = self.vue.scroll_list;
        self.vue.user_favorites = [];       //reinitialize list

        var i, j;
        for (i = 0; i < all_favs.length; i++) {
            for (j = 0; j < scrls.length; j++) {
                if (all_favs[i].scroll_id == scrls[j].id && all_favs[i].logged_id == user_id) {
                    self.vue.user_favorites.push(
                        {
                            s_id: scrls[j].id,
                            author_id: scrls[j].author_id,
                            author_name: scrls[j].author_name,
                            title: scrls[j].title,
                            abstract: scrls[j].abstract,
                            post: scrls[j].post,
                        }
                    );
                }
            }
        }
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

    // Get all profile info from existing list of profiles
    self.view_profile = function(author_id) {
        self.vue.is_main_page = false;
        self.vue.is_favs_page = false;
        self.vue.is_fols_page = false;
        self.vue.is_profile_page = true;

        self.vue.id = self.vue.profile_list[author_id-1].profile_id;
        self.vue.author_id = author_id;
        self.vue.first_name = self.vue.profile_list[author_id-1].first_name;
        self.vue.last_name = self.vue.profile_list[author_id-1].last_name;
        self.vue.email = self.vue.profile_list[author_id-1].author_email;
        self.vue.about_me = self.vue.profile_list[author_id-1].about_me;
    };

    self.edit_bio_button = function () {
        // The button to edit the "About Me" portion has been pressed.
        self.vue.is_editing_bio = !self.vue.is_editing_bio;
    };

    self.edit_bio = function(profile_id) {
        $.post(edit_bio_url,
            {
                profile_id: profile_id,
                about_me: self.vue.about_me
            },
            function () {
                $.web2py.enableElement($("#edit_bio_submit"));
                self.edit_bio_button();
                self.get_profiles();
            });
    };

    // *** Collect list of all followed authors from database. ***
    self.get_follows = function(){
        $.getJSON(
            follows_url,
            function (data) {
                // Update the local data
                self.vue.follows_list = data.follows_list
            })
    };

    // Switch to page displaying specified user's followings
    self.view_user_fols = function(user_id) {
        self.vue.is_main_page = false;
        self.vue.is_favs_page = false;
        self.vue.is_fols_page = true;
        self.vue.is_profile_page = false;

        var all_fols = self.vue.follows_list;
        var profs = self.vue.profile_list;
        self.vue.user_follows = [];       //reinitialize list

        var i, j;
        for (i = 0; i < all_fols.length; i++) {
            for (j = 0; j < profs.length; j++) {
                if (all_fols[i].logged_id == user_id &&
                    all_fols[i].author_id == profs[j].author_id) {
                    self.vue.user_follows.push(
                        {
                            p_id: profs[j].id,
                            author_id: profs[j].author_id,
                            author_email: profs[j].author_email,
                            author_first_name: profs[j].first_name,
                            author_last_name: profs[j].last_name
                        }
                    );
                }
            }
        }
    };

    self.follow_user = function (author_id) {
        $.post(follow_user_url,
            {
                logged_id: self.vue.logged_id,
                author_id: author_id,
            },
            function () {
                self.get_scrolls();
                self.get_follows();
            })
    };

    self.unfollow_user = function (logged_id, author_id) {
        var i;
        var fol_id = null;
        // Get database ID for the specified author to unfollow
        for (i = 0; i < self.vue.follows_list.length; i++) {
            if (logged_id == self.vue.follows_list[i].logged_id &&
                author_id == self.vue.follows_list[i].author_id) {
                fol_id = self.vue.follows_list[i].id;
            }
        }
        $.post(unfollow_user_url,
            {
                fol_id: fol_id
            },
            function () {
                self.get_scrolls();
                self.get_follows();
            })
    };

    self.is_following = function(logged_id, author_id) {
        var i;
        var is_fol = false;
        for (i = 0; i < self.vue.follows_list.length; i++) {
            if (logged_id == self.vue.follows_list[i].logged_id &&
                author_id == self.vue.follows_list[i].author_id) {
                is_fol = true;
            }
        }
        return is_fol;
    };

    self.back_to_main = function() {
        self.vue.is_main_page = true;
        self.vue.is_profile_page = false;
        self.vue.is_fols_page = false;
        self.vue.is_favs_page = false;
    };
    self.mark_read = function(logged_id, scroll_id){
        // add to read database
        $.post(mark_read_url,
        {
            logged_id: logged_id
            scroll_id: scroll_id
        })

    };
    self.is_read = function(){
        //if in database then it is counted as read

    };

    // ***** Complete as needed. *****
    self.vue = new Vue({
        el: "#vue-div",
        delimiters: ['${', '}'],            //indicates vue object
        unsafeDelimiters: ['!{', '}'],
        data: {
            is_main_page: true,
            is_profile_page: false,
            is_fols_page: false,
            is_favs_page: false,
            logged_in: false,
            logged_user: null,
            logged_id: null,

            profile_list: [],
            scroll_list: [],
            favorites_list: [],
            user_favorites: [],
            follows_list: [],
            user_follows: [],

            has_more: false,
            is_adding_scroll: false,
            is_editing_scroll: false,
            form_title_add: null,
            form_abstract_add: null,
            form_post_add: null,

            // Profile variables
            id: null,
            author_id: null,
            first_name: null,
            last_name: null,
            email: null,
            about_me: null,
            is_editing_bio: false
        },
        methods: {
            get_scrolls: self.get_scrolls,
            get_more: self.get_more,
            add_scroll_button: self.add_scroll_button,
            add_scroll: self.add_scroll,
            delete_scroll: self.delete_scroll,
            edit_scroll_button: self.edit_scroll_button,
            edit_scroll: self.edit_scroll,

            get_profiles: self.get_profiles,
            view_profile: self.view_profile,
            edit_bio_button: self.edit_bio_button,
            edit_bio: self.edit_bio,

            get_favorites: self.get_favorites,
            view_user_favs: self.view_user_favs,
            favorite_scroll: self.favorite_scroll,
            unfavorite_scroll: self.unfavorite_scroll,
            is_favorite: self.is_favorite,

            get_follows: self.get_follows,
            view_user_fols: self.view_user_fols,
            follow_user: self.follow_user,
            unfollow_user: self.unfollow_user,
            is_following: self.is_following,

            back_to_main: self.back_to_main
        }
    });

    // Get initial data
    self.get_profiles();
    self.get_scrolls();
    self.get_follows();
    self.get_favorites();
    $("#vue-div").show();

    return self;
};

var APP = null;

// This will make everything accessible from the js console;
// for instance, self.x above would be accessible as APP.x
jQuery(function(){APP = app();});
