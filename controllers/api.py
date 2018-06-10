def get_profiles():
    profile_list = []
    if auth.user is not None:

        # Add profiles if not already existing in table.
        for r in db(db.auth_user.id).select():
            not_found = True
            for p in db(db.profiles.id).select():
                if int(r.id) == int(p.author_id):
                    not_found = False
                    break
            if not_found:
                db.profiles.insert(
                    author_id = r.id,
                    author_email = r.email,
                    author_first_name = r.first_name,
                    author_last_name = r.last_name
                )
        # Get profile info for all users.
        for p in db(db.profiles.id).select():
            prof_info = dict(
                profile_id = p.id,
                author_id = p.author_id,
                author_email = p.author_email,
                first_name = p.author_first_name,
                last_name = p.author_last_name,
                about_me = p.about_me,
            )
            profile_list.append(prof_info)

    # Reset is_viewing booleans to false, to sync with vue's main_page boolean.
    rows = db(db.profiles.id).select()
    for p in rows:
        p.update_record(is_viewing=False)

    return response.json(dict(
        profile_list = profile_list,
    ))

def get_scrolls():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    scroll_list = []
    logged_in = False
    logged_user = None
    logged_id = None
    has_more = False

    rows = db().select(db.scrolls.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            s = dict(
                id = r.id,
                author_id = r.author_id,
                author_name = r.author_name,
                title = r.title,
                abstract = r.abstract,
                post = r.post,
                is_editing = r.is_editing,
            )
            scroll_list.append(s)
        else:
            has_more = True

    if auth.user is not None:
        logged_in = True
        logged_id = auth.user.id
        logged_user = auth.user.first_name + " " + auth.user.last_name

    return response.json(dict(
        scroll_list=scroll_list,
        logged_in=logged_in,
        logged_id = logged_id,
        logged_user = logged_user,
        has_more=has_more,
    ))


def get_favorites():
    favorites_list = []
    if auth.user is not None:
        # Get all the favorites the currently logged user has.
        for r in db(db.favorites.logged_id == auth.user.id).select():
            favorite = dict(
                id = r.id,
                logged_id = r.logged_id,
                owner_id = r.owner_id,
                scroll_id = r.scroll_id
            )
            favorites_list.append(favorite)
    return response.json(dict(
        favorites_list=favorites_list
    ))

@auth.requires_signature()
def favorite_scroll():
    # Add a new favorite scroll
    f_id = db.favorites.insert(
        logged_id = request.vars.logged_id,
        owner_id = request.vars.owner_id,
        scroll_id = request.vars.scroll_id
    )
    fav = db.favorites(f_id)
    return response.json(dict(favorite = fav))

@auth.requires_signature()
def unfavorite_scroll():
    # Delete a scroll from favorites based on current user
    logger.info("Delete scroll_id from favorites: %r", request.vars.scroll_id)
    db(db.favorites.id == request.vars.fav_id).delete()
    return "ok"

@auth.requires_signature()
def add_scroll():
    # Inserts new scroll information
    s_id = db.scrolls.insert(
        author_name=request.vars.author_name,
        title = request.vars.title,
        abstract = request.vars.abstract,
        post = request.vars.post
    )
    s = db.scrolls(s_id)
    return response.json(dict(scroll = s))

@auth.requires_signature()
def del_scroll():
    logger.info("Delete scroll_id: %r", request.vars.scroll_id)
    db(db.scrolls.id == request.vars.scroll_id).delete()
    return "ok"

@auth.requires_signature()
def edit_scroll_button():
    scroll_id = int(request.vars.scroll_id)
    s = db.scrolls[scroll_id]

    if s.is_editing == 'False':
        s.update_record(is_editing = True)
    else:
        s.update_record(is_editing = False)

    return response.json(dict(scroll = s))

@auth.requires_signature()
def edit_scroll():
    logger.info("Edit scroll_id: %r", request.vars.scroll_id)
    s = db(db.scrolls.id == request.vars.scroll_id).update(
        title = request.vars.title,
        abstract = request.vars.abstract,
        post = request.vars.post
    )
    return response.json(dict(scroll = s))

@auth.requires_signature()
def view_profile():
    rows = db(db.profiles.author_id == request.vars.author_id).select()

    for p in rows:
        if p.is_viewing == 'False':
            p.update_record(is_viewing=True)
        else:
            p.update_record(is_viewing=False)

@auth.requires_signature()
def edit_bio():
    logger.info(request.vars.profile_id)
    p = db(db.profiles.id == request.vars.profile_id).update(
        about_me = request.vars.about_me
    )
    return response.json(dict(profile = p))
