# Here go your api methods. (Many will be recycled from default.py from hw2.)

# Template by TA Rakshit; queries database and sends it to default_index.js
# @auth.requires_signature(hash_vars=False)
# def get_memos():
#     checklists = None
#
#     if auth.user is not None:
#         checklists = db(db.checklist.user_email == auth.user.email).select()
#     logged_in = auth.user is not None
#     return response.json(dict(
#         memo_list=checklists,
#         logged_in=logged_in
#     ))

# @auth.requires_signature(hash_vars=False)
def get_memos():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    memo_list = []
    has_more = False
    rows = db().select(db.checklist.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                title = r.title,
                memo = r.memo,
                is_public = r.is_public,
                user_email = r.user_email,
                is_editing = r.is_editing
            )
            memo_list.append(t)
        else:
            has_more = True
    logged_in = auth.user is not None
    return response.json(dict(
        memo_list=memo_list,
        logged_in=logged_in,
        has_more=has_more,
    ))

@auth.requires_signature()
def add_memo():
    # Inserts memo information
    m_id = db.checklist.insert(
        title = request.vars.title,
        memo = request.vars.memo
    )
    m = db.checklist(m_id)
    return response.json(dict(checklist=m))

@auth.requires_signature()
def del_memo():
    logger.info("memo_id: %r", request.vars.memo_id)
    db(db.checklist.id == request.vars.memo_id).delete()
    return "ok"

@auth.requires_signature()
def edit_memo_button():
    memo_id = int(request.vars.memo_id)
    m = db.checklist[memo_id]

    if m.is_editing == 'False':
        m.update_record(is_editing = True)
    else:
        m.update_record(is_editing = False)

    return response.json(dict(checklist=m))

@auth.requires_signature()
def edit_memo():
    logger.info("memo_id: %r", request.vars.memo_id)
    m = db(db.checklist.id == request.vars.memo_id).update(
        title = request.vars.title,
        memo = request.vars.memo
    )
    return response.json(dict(checklist=m))

@auth.requires_signature()
def toggle_public():
    memo_id = int(request.vars.memo_id)
    m = db.checklist[memo_id]

    if m.is_public == 'False':
        m.update_record(is_public = True)
    else:
        m.update_record(is_public = False)

    return response.json(dict(checklist=m))