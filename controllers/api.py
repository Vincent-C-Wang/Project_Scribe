def get_users():
    user_list = []
    if auth.user is not None:
        # (The below query is given by the professor on Piazza.)
        # Get all users other than the currently logged one.
        for r in db(db.auth_user.id != auth.user.id).select():
            user_info = dict(
                first_name=r.first_name,
                last_name=r.last_name,
                email=r.email,
                user_id=r.id
            )
            user_list.append(user_info)

    return response.json(dict(
        user_list=user_list,
    ))

def get_scrolls():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    scroll_list = []
    logged_user = None
    logged_id = None
    has_more = False

    rows = db().select(db.scrolls.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            s = dict(
                id = r.id,
                title = r.title,
                abstract = r.abstract,
                post = r.post,
                user_email = r.user_email,
                is_editing = r.is_editing,
                is_favorite = r.is_favorite
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
        for r in db(db.favorites.logged_id == auth.user.id).select():
            favorite = dict(
                owner_email = r.owner_email,
                scroll_id = r.scroll_id
            )
            favorites_list.append(favorite)
    return response.json(dict(
        favorites_list=favorites_list
    ))

@auth.requires_signature()
def favorite_scroll():
    scroll_id = int(request.vars.scroll_id)
    scroll = db.scrolls[scroll_id]

    if scroll.is_favorite == 'False':
        scroll.update_record(is_favorite = True)
    else:
        scroll.update_record(is_favorite = False)

    # Add a new favorite scroll
    f_id = db.favorites.insert(
        logged_id = request.vars.logged_id,
        owner_email = request.vars.owner_email,
        scroll_id = request.vars.scroll_id
    )
    fav = db.favorites(f_id)
    return response.json(dict(favorite = fav))

@auth.requires_signature()
def unfavorite_scroll():
    scroll_id = int(request.vars.scroll_id)
    scroll = db.scrolls[scroll_id]

    if scroll.is_favorite == 'False':
        scroll.update_record(is_favorite=True)
    else:
        scroll.update_record(is_favorite=False)

    # Delete a scroll from favorites
    logger.info("Delete scroll_id from favorites: %r", request.vars.scroll_id)
    db(db.favorites.scroll_id == request.vars.scroll_id).delete()
    return "ok"

@auth.requires_signature()
def add_scroll():
    # Inserts new scroll information
    s_id = db.scrolls.insert(
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

# @auth.requires_signature()
# def toggle_public():
#     memo_id = int(request.vars.memo_id)
#     m = db.checklist[memo_id]
#
#     if m.is_public == 'False':
#         m.update_record(is_public = True)
#     else:
#         m.update_record(is_public = False)
#
#     return response.json(dict(checklist=m))