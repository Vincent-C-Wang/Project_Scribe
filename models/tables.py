# Define your tables below (or better in another model file) for example
#
# >>> db.define_table('mytable', Field('myfield', 'string'))
#
# Fields can be 'string','text','password','integer','double','boolean'
#       'date','time','datetime','blob','upload', 'reference TABLENAME'
# There is an implicit 'id integer autoincrement' field
# Consult manual for more options, validators, etc.

import datetime

def get_user_email():
    return auth.user.email if auth.user is not None else None


db.define_table('scrolls',
                Field('author_id', 'reference auth_user', default=auth.user_id),
                Field('author_name'),
                Field('title'),
                Field('abstract', 'text'),
                Field('post', 'text'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_editing', default=False)
                )
db.define_table('favorites',
                Field('logged_id', 'reference auth_user', default=auth.user_id),
                Field('owner_id'),
                Field('scroll_id')
                )
db.define_table('profiles',
                Field('author_id'),
                Field('author_email'),
                Field('author_first_name'),
                Field('author_last_name'),
                Field('about_me'),
                Field('num_followers', default=0)
                )
db.define_table('follows',
                Field('logged_id', 'reference auth_user', default=auth.user_id),
                Field('author_id')
                )

db.scrolls.updated_on.writable = db.scrolls.updated_on.readable = False
db.scrolls.id.writable = db.scrolls.id.readable = False


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
