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
                Field('user_email', default=get_user_email()),
                Field('title'),
                Field('abstract', 'text'),
                Field('post', 'text'),
                Field('updated_on', 'datetime', update=datetime.datetime.utcnow()),
                Field('is_editing', default=False),
                )
db.define_table('favorites',
                Field('logged_id', 'reference auth_user', default=auth.user_id),
                Field('owner_email'),
                Field('scroll_id')
                )

db.scrolls.user_email.writable = False
db.scrolls.user_email.readable = False

db.scrolls.updated_on.writable = db.scrolls.updated_on.readable = False
db.scrolls.id.writable = db.scrolls.id.readable = False


# after defining tables, uncomment below to enable auditing
# auth.enable_record_versioning(db)
